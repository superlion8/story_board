import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getEnv, getOptionalEnv } from "@/lib/env";

const KLING_DEFAULT_BASE = "https://api-singapore.klingai.com";
const KLING_TASK_PATHS = [
  "/v1/videos/image2video/",
  "/v1/videos/tasks/",
  "/v1/queues/tasks/",
  "/v1/videos/task/"
];

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
    const token = createKlingToken();
    let lastResponse: Response | null = null;
    let lastData: unknown = null;

    for (const path of KLING_TASK_PATHS) {
      const response = await fetch(`${baseUrl}${path}${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      lastResponse = response;
      const raw = await response.json();
      lastData = raw;

      if (response.ok) {
        const taskData = raw?.data ?? raw;
        const normalized = normalizeStatus(taskData?.task_status ?? raw?.status ?? "");
        const videoUrl =
          taskData?.task_result?.videos?.[0]?.url ??
          taskData?.video_url ??
          raw?.video_url;

        return NextResponse.json({
          status: normalized,
          task: taskData,
          videoUrl,
          raw
        });
      }

      if (response.status === 404) {
        continue;
      }

      return NextResponse.json(
        { error: "Failed to query Kling task", details: raw },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        error: "Task not found in Kling queues",
        details: lastData ?? null
      },
      { status: lastResponse?.status ?? 404 }
    );
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

function normalizeStatus(raw: string) {
  const value = raw?.toLowerCase?.() ?? "";
  switch (value) {
    case "succeed":
    case "success":
    case "completed":
    case "ready":
      return "ready";
    case "processing":
    case "running":
    case "in_progress":
      return "running";
    case "submitted":
    case "queued":
    case "pending":
      return "queued";
    case "failed":
    case "error":
      return "failed";
    default:
      return "running";
  }
}
