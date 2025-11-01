import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getEnv, getOptionalEnv } from "@/lib/env";

const KLING_MODEL = "kling-v2-1";
const KLING_DEFAULT_BASE = "https://api-singapore.klingai.com";

type TransitionRequestBody = {
  startImage?: string;
  endImage?: string;
  prompt?: string;
  duration?: number;
  mode?: "standard" | "pro";
  cfgScale?: number;
  staticMask?: string;
  dynamicMasks?: Array<{
    mask: string;
    trajectories?: Array<{ x: number; y: number }>;
  }>;
};

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TransitionRequestBody;
    const startImage = body.startImage?.trim();
    const endImage = body.endImage?.trim();
    const prompt = body.prompt?.trim();

    if (!startImage || !endImage || !prompt) {
      return NextResponse.json(
        { error: "startImage, endImage, and prompt are required." },
        { status: 400 }
      );
    }

    const duration = body.duration ?? 5;
    const mode = body.mode ?? "pro";
    const cfgScale = body.cfgScale ?? 0.5;
    const baseUrl = getOptionalEnv("KLING_API_BASE") ?? KLING_DEFAULT_BASE;

    const startImageBase64 = extractBase64(startImage);
    const endImageBase64 = extractBase64(endImage);

    const payload: Record<string, unknown> = {
      model_name: KLING_MODEL,
      mode,
      duration: String(duration),
      prompt,
      cfg_scale: cfgScale,
      static_mask: body.staticMask,
      dynamic_masks: body.dynamicMasks
    };

    if (startImageBase64) {
      payload.image_base64 = startImageBase64;
    } else {
      payload.image = startImage;
    }

    if (endImageBase64) {
      payload.image_tail_base64 = endImageBase64;
    } else {
      payload.image_tail = endImage;
    }

    const response = await fetch(`${baseUrl}/v1/videos/image2video`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${createKlingToken()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Kling API request failed", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      taskId: data.task_id ?? data.taskId,
      status: data.status ?? "queued",
      response: data
    });
  } catch (error) {
    console.error("Kling transition generation failed:", error);
    return NextResponse.json(
      {
        error: "Failed to generate transition video via Kling.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

function extractBase64(value: string) {
  if (value.startsWith("data:")) {
    const commaIndex = value.indexOf(",");
    if (commaIndex !== -1) {
      return value.slice(commaIndex + 1);
    }
  }
  return null;
}
