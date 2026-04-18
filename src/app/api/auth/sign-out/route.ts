import { deleteCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  try {
    await deleteCurrentSession();
    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Could not sign out right now." },
      { status: 500 },
    );
  }
}
