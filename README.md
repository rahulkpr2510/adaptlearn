# Adaptive Learning System

A multi-topic adaptive learning app built with Next.js App Router.

Core loop:

Quiz -> Diagnosis -> Roadmap -> Follow-up Quiz

## What Changed (Topic Switching in Quiz)

The quiz experience is no longer fixed to DSA.

Users can now switch topics/tracks in two ways:

1. From the navbar: `Start Quiz` opens a topic selection screen.
2. Inside the quiz page: a `Change Topic` control is visible in the quiz header.

Supported topics:

- DSA
- SQL
- JavaScript Fundamentals

## Topic Switching Behavior

### 1) Start from topic picker

Route:

- `/quiz`

This opens a topic selection page with cards for all available tracks.

### 2) Switch topic while already in quiz flow

Inside `quiz/page.tsx`, the header shows `Change Topic` pills.

- Clicking a pill navigates to:
  - `/quiz?track=dsa&mode=diagnostic`
  - `/quiz?track=sql&mode=diagnostic`
  - `/quiz?track=javascript-fundamentals&mode=diagnostic`
- Current mode is preserved while switching (`diagnostic` or `follow-up`).

### 3) Follow-up mode note

Follow-up quizzes are track-specific and require a prior diagnosis in that same track.

If no diagnosis exists for the selected track, the app shows a clear prompt to run a diagnostic first.

## URL Query Parameters

The quiz page uses query params for state:

- `track`: `dsa | sql | javascript-fundamentals`
- `mode`: `diagnostic | follow-up`

Examples:

- `/quiz?track=dsa&mode=diagnostic`
- `/quiz?track=sql&mode=diagnostic`
- `/quiz?track=javascript-fundamentals&mode=follow-up`

If `track` is missing, the app shows the topic picker.

## Adaptive Engine Summary

The app uses deterministic local logic for quiz generation and diagnosis in the main user flow.

### Quiz generation

- Diagnostic quiz: 10 questions, balanced difficulty with concept coverage.
- Follow-up quiz: 5 questions focused on weak and prerequisite concepts.

### Diagnosis

- Calculates score and concept-wise accuracy.
- Classifies concept status:
  - Strong
  - Improving
  - Weak
- Builds trend and confidence summary from attempt history.

### Roadmap

- Prioritizes weak concepts.
- Pulls prerequisite repairs forward when needed.
- Produces study focus, practice plan, and retest criteria.

## Persistence Model

Client-side persistence is handled via `localStorage`.

Storage key:

- `adaptive-learning.store.v1`

Stored data includes:

- Attempt history per track
- Active quiz session
- Latest diagnosis and roadmap context

## Key Routes

- `/` Home
- `/quiz` Topic picker
- `/quiz?track=<track>&mode=<mode>` Quiz workspace
- `/results?track=<track>` Diagnosis dashboard
- `/roadmap?track=<track>` Personalized roadmap

## Key Files for Topic Switching

- `src/app/quiz/page.tsx`
  - Topic picker route behavior
  - In-page `Change Topic` controls
  - Diagnostic/follow-up mode switching
- `src/components/site-navbar-client.tsx`
  - `Start Quiz` links to `/quiz` (topic-agnostic entry)
- `src/data/adaptive-tracks.ts`
  - Source of available topics/tracks

## Tech Stack

- Next.js App Router (TypeScript)
- React 19
- Tailwind CSS v4
- Motion (animations)

## Run Locally

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Open:

- `http://localhost:3000`

## Validation

Run lint:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

## Quick Manual Test (Topic Switching)

1. Open `/quiz`.
2. Select SQL and generate a diagnostic quiz.
3. Use `Change Topic` in quiz header to switch to JavaScript Fundamentals.
4. Generate quiz and submit at least one attempt.
5. Open `/results?track=javascript-fundamentals` and verify diagnosis.
6. Switch to DSA from quiz header and verify independent track flow.

## Notes

- The app supports multi-track switching directly in quiz UX.
- Diagnosis and roadmap remain track-isolated by design.
- Follow-up quizzes require diagnosis history for the selected track.
