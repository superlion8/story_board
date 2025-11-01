import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getEnv } from "@/lib/env";

const MODEL_NAME = "gemini-2.5-flash-image";

type ImageRequestBody = {
  prompt?: string;
  aspectRatio?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ImageRequestBody;
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required to generate an image." },
        { status: 400 }
      );
    }

    const client = new GoogleGenerativeAI(getEnv("GEMINI_API_KEY"));
    const model = client.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig =
      body.aspectRatio !== undefined
        ? {
            imageGenerationConfig: { aspectRatio: body.aspectRatio }
          }
        : undefined;

    const generationRequest: Record<string, unknown> = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    if (generationConfig) {
      generationRequest.generationConfig = generationConfig;
    }

    const result = await model.generateContent(generationRequest as any);

    const parts =
      result.response?.candidates?.[0]?.content?.parts ?? [];

    const inlineDataPart = parts.find(
      (part) => "inlineData" in part && part.inlineData?.data
    ) as { inlineData?: { data: string; mimeType?: string } } | undefined;

    const fileDataPart = parts.find(
      (part) => "fileData" in part && part.fileData?.fileUri
    ) as { fileData?: { fileUri: string; mimeType?: string } } | undefined;

    let dataUrl: string | null = null;
    let mimeType = "image/png";

    if (inlineDataPart?.inlineData?.data) {
      mimeType = inlineDataPart.inlineData.mimeType ?? mimeType;
      dataUrl = `data:${mimeType};base64,${inlineDataPart.inlineData.data}`;
    } else if (fileDataPart?.fileData?.fileUri) {
      mimeType = fileDataPart.fileData.mimeType ?? mimeType;
      dataUrl = await downloadFileAsDataUrl(
        fileDataPart.fileData.fileUri,
        mimeType
      );
    }

    if (!dataUrl) {
      return NextResponse.json(
        { error: "Gemini did not return image data." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      image: dataUrl,
      meta: {
        prompt,
        model: MODEL_NAME
      }
    });
  } catch (error) {
    console.error("Gemini image generation failed:", error);
    return NextResponse.json(
      {
        error: "Failed to generate image via Gemini.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

async function downloadFileAsDataUrl(fileUri: string, fallbackMime: string) {
  const apiKey = getEnv("GEMINI_API_KEY");
  const separator = fileUri.includes("?") ? "&" : "?";
  const response = await fetch(`${fileUri}${separator}key=${apiKey}`);
  if (!response.ok) {
    throw new Error(`Failed to download generated image (${response.status})`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType =
    response.headers.get("content-type") ?? fallbackMime ?? "image/png";
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
