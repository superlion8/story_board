import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getEnv } from "@/lib/env";

const MODEL_NAME = "gemini-2.5-flash-image";

type ImageRequestBody = {
  prompt?: string;
  aspectRatio?: string;
  referenceImage?: string;
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

    const parts: Array<Record<string, unknown>> = [];

    if (body.referenceImage) {
      const inlineData = parseDataUrl(body.referenceImage);
      if (!inlineData) {
        return NextResponse.json(
          { error: "Reference image must be a valid base64 data URL." },
          { status: 400 }
        );
      }
      parts.push({
        inlineData
      });
    }

    parts.push({ text: prompt });

    const generationRequest: Record<string, unknown> = {
      contents: [
        {
          role: "user",
          parts
        }
      ]
    };

    if (generationConfig) {
      generationRequest.generationConfig = generationConfig;
    }

    const result = await model.generateContent(generationRequest as any);

    const responseParts = (result.response?.candidates?.[0]?.content?.parts ?? []) as Array<
      Record<string, any>
    >;

    const inlineDataPart = responseParts.find(
      (part) => part.inlineData?.data
    ) as { inlineData?: { data?: string; mimeType?: string } } | undefined;

    const fileDataPart = responseParts.find(
      (part) => part.fileData?.fileUri
    ) as { fileData?: { fileUri?: string; mimeType?: string } } | undefined;

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

function parseDataUrl(value: string) {
  if (!value.startsWith("data:")) {
    return null;
  }
  const match = value.match(/^data:(?<mime>[^;]+);base64,(?<data>.+)$/);
  if (!match?.groups?.data) {
    return null;
  }
  return {
    mimeType: match.groups.mime || "image/png",
    data: match.groups.data
  };
}
