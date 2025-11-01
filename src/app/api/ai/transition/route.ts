import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import path from "path";
import { readFile } from "fs/promises";
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

    const startData = await resolveImageData(startImage);
    const endData = await resolveImageData(endImage);

    const payload: Record<string, unknown> = {
      model_name: KLING_MODEL,
      mode,
      duration: String(duration),
      prompt,
      cfg_scale: cfgScale,
      static_mask: body.staticMask,
      dynamic_masks: body.dynamicMasks
    };

    payload.image_base64 = startData.base64;
    payload.image = startData.base64;
    payload.image_tail_base64 = endData.base64;
    payload.image_tail = endData.base64;

    if (startData.mimeType) {
      payload.image_format = startData.mimeType;
    }
    if (endData.mimeType) {
      payload.image_tail_format = endData.mimeType;
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
    const match = value.match(/^data:(?<mime>[^;]+);base64,(?<data>.+)$/);
    if (match?.groups?.data) {
      return {
        data: match.groups.data,
        mimeType: match.groups.mime ?? undefined
      };
    }
  }
  return null;
}

async function resolveImageData(value: string) {
  const dataUrl = extractBase64(value);
  if (dataUrl) {
    return { base64: dataUrl.data, mimeType: dataUrl.mimeType };
  }

  if (value.startsWith("http")) {
    const res = await fetch(value);
    if (!res.ok) {
      throw new Error(`Failed to fetch image ${value} (${res.status})`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      base64: buffer.toString("base64"),
      mimeType: res.headers.get("content-type") ?? undefined
    };
  }

  const relativePath = value.startsWith("/") ? value.slice(1) : value;
  const absolute = path.join(process.cwd(), "public", relativePath);
  const buffer = await readFile(absolute);
  return {
    base64: buffer.toString("base64"),
    mimeType: guessMimeType(relativePath)
  };
}

function guessMimeType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return undefined;
  }
}
