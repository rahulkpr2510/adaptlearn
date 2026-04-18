import bcrypt from "bcryptjs";
import { z } from "zod";

import { createSessionForUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const signInSchema = z.object({
  email: z.email().trim().max(120),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const json = (await request.json()) as unknown;
    const parsed = signInSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json(
        { error: "Please provide valid sign-in details." },
        { status: 400 },
      );
    }

    const normalizedEmail = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const passwordMatches = await bcrypt.compare(
      parsed.data.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    await createSessionForUser(user.id);

    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch {
    return Response.json(
      { error: "Could not sign in right now." },
      { status: 500 },
    );
  }
}
