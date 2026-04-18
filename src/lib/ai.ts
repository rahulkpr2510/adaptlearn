const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_REQUEST_TIMEOUT_MS = 7000;
const DEFAULT_MIN_REQUEST_INTERVAL_MS = 1200;
const DEFAULT_MAX_RETRIES = 0;
const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 40;

type ResponseFormat = "json_object" | "text";

export interface AIRequestOptions {
  timeoutMs?: number;
  maxRetries?: number;
}

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();

let requestQueue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

function toPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getGeminiModel(): string {
  return process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
}

function getMinRequestIntervalMs(): number {
  return toPositiveInt(
    process.env.GEMINI_MIN_REQUEST_INTERVAL_MS,
    DEFAULT_MIN_REQUEST_INTERVAL_MS,
  );
}

function getRequestTimeoutMs(): number {
  return toPositiveInt(
    process.env.GEMINI_REQUEST_TIMEOUT_MS,
    DEFAULT_REQUEST_TIMEOUT_MS,
  );
}

function getMaxRetries(): number {
  return toPositiveInt(process.env.GEMINI_MAX_RETRIES, DEFAULT_MAX_RETRIES);
}

function getCacheTtlMs(): number {
  return toPositiveInt(process.env.GEMINI_CACHE_TTL_MS, DEFAULT_CACHE_TTL_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function cacheKey(
  model: string,
  format: ResponseFormat,
  systemPrompt: string,
  userPrompt: string,
): string {
  return `${model}|${format}|${systemPrompt}|${userPrompt}`;
}

function getCachedResponse(key: string): string | null {
  const cached = responseCache.get(key);
  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    responseCache.delete(key);
    return null;
  }

  return cached.value;
}

function setCachedResponse(key: string, value: string): void {
  const ttl = getCacheTtlMs();

  responseCache.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });

  if (responseCache.size <= MAX_CACHE_ENTRIES) {
    return;
  }

  const firstKey = responseCache.keys().next().value;
  if (typeof firstKey === "string") {
    responseCache.delete(firstKey);
  }
}

async function scheduleRateLimitedSlot(): Promise<void> {
  const minIntervalMs = getMinRequestIntervalMs();

  requestQueue = requestQueue.then(async () => {
    const elapsed = Date.now() - lastRequestAt;
    const remaining = minIntervalMs - elapsed;
    if (remaining > 0) {
      await sleep(remaining);
    }
    lastRequestAt = Date.now();
  });

  await requestQueue;
}

function extractJsonObject(raw: string): string | null {
  const trimmed = raw.trim();

  if (trimmed.startsWith("```")) {
    const stripped = trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");
    return stripped;
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return trimmed.slice(firstBrace, lastBrace + 1);
}

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

function extractGeminiText(
  payload: GeminiGenerateContentResponse,
): string | null {
  const parts = payload.candidates?.[0]?.content?.parts;
  if (!parts || parts.length === 0) {
    return null;
  }

  const joined = parts
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("\n")
    .trim();

  return joined.length > 0 ? joined : null;
}

function parseRetryAfterHeader(value: string | null): number {
  if (!value) {
    return 0;
  }

  const seconds = Number.parseInt(value, 10);
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds * 1000;
  }

  return 0;
}

function shouldRetry(status: number): boolean {
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

function retryDelayMs(attempt: number, retryAfterMs: number): number {
  if (retryAfterMs > 0) {
    return retryAfterMs;
  }

  const base = 600;
  const backoff = base * 2 ** attempt;
  const jitter = Math.floor(Math.random() * 250);
  return backoff + jitter;
}

async function doGeminiRequest(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  responseFormat: ResponseFormat,
  options?: AIRequestOptions,
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const endpoint = `${GEMINI_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const timeoutMs =
    typeof options?.timeoutMs === "number" && options.timeoutMs > 0
      ? Math.floor(options.timeoutMs)
      : getRequestTimeoutMs();
  const maxRetries =
    typeof options?.maxRetries === "number" && options.maxRetries >= 0
      ? Math.floor(options.maxRetries)
      : getMaxRetries();

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    await scheduleRateLimitedSlot();

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            responseMimeType:
              responseFormat === "json_object"
                ? "application/json"
                : "text/plain",
          },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      if (attempt >= maxRetries) {
        return null;
      }

      await sleep(retryDelayMs(attempt, 0));
      continue;
    }

    if (response.ok) {
      const payload = (await response.json()) as GeminiGenerateContentResponse;
      return extractGeminiText(payload);
    }

    if (!shouldRetry(response.status) || attempt >= maxRetries) {
      return null;
    }

    const retryAfterMs = parseRetryAfterHeader(
      response.headers.get("retry-after"),
    );
    await sleep(retryDelayMs(attempt, retryAfterMs));
  }

  return null;
}

async function requestChatCompletion(
  messages: ChatMessage[],
  responseFormat: ResponseFormat,
  options?: AIRequestOptions,
): Promise<string | null> {
  const systemPrompt = messages.find(
    (message) => message.role === "system",
  )?.content;
  const userPrompt = messages.find(
    (message) => message.role === "user",
  )?.content;

  if (!systemPrompt || !userPrompt) {
    return null;
  }

  const model = getGeminiModel();
  const key = cacheKey(model, responseFormat, systemPrompt, userPrompt);
  const cached = getCachedResponse(key);
  if (cached) {
    return cached;
  }

  const responseText = await doGeminiRequest(
    model,
    systemPrompt,
    userPrompt,
    responseFormat,
    options,
  );

  if (!responseText) {
    return null;
  }

  setCachedResponse(key, responseText);
  return responseText;
}

export async function generateJsonFromAI<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: AIRequestOptions,
): Promise<T | null> {
  const raw = await requestChatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    "json_object",
    options,
  );

  if (!raw) {
    return null;
  }

  const jsonText = extractJsonObject(raw);
  if (!jsonText) {
    return null;
  }

  try {
    return JSON.parse(jsonText) as T;
  } catch {
    return null;
  }
}

export async function generateTextFromAI(
  systemPrompt: string,
  userPrompt: string,
  options?: AIRequestOptions,
): Promise<string | null> {
  return requestChatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    "text",
    options,
  );
}
