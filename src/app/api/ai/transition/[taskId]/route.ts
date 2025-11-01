import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getEnv, getOptionalEnv } from "@/lib/env";

const KLING_DEFAULT_BASE = "https://api-singapore.klingai.com";

function createKlingToken() {
  const accessKey = getEnv("KLING_ACCESS_KEY");
  const secretKey = getEnv("KLING_SECRET_KEY");

  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iss: accessKey,
      exp: now + 1800,
      nbf: now - 5
    },
    secretKey,
    { algorithm: "HS256" }
  );
}

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { taskId } = await context.params;
    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    const baseUrl = getOptionalEnv("KLING_API_BASE") ?? KLING_DEFAULT_BASE;
    const response = await fetch(`${baseUrl}/v1/videos/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${createKlingToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to query Kling task", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Kling task query failed:", error);
    return NextResponse.json(
      {
        error: "Failed to query Kling task.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
