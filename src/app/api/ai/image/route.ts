import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getEnv } from "@/lib/env";

const MODEL_NAME = "gemini-2.5-flash";

type ImageRequestBody = {
  prompt?: string;
  aspectRatio?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ImageRequestBody;
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required to generate an image." },
        { status: 400 }
      );
    }

    const client = new GoogleGenerativeAI(getEnv("GEMINI_API_KEY"));
    const model = client.getGenerativeModel({ model: MODEL_NAME });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "image/png",
        ...(body.aspectRatio
          ? {
              // aspect ratios are supported as hints; non-fatal if invalid.
              imageGenerationConfig: { aspectRatio: body.aspectRatio }
            }
          : {})
      }
    });

    const inlinePart =
      result.response?.candidates?.[0]?.content?.parts?.find(
        (part) => "inlineData" in part
      );

    const inlineData = inlinePart && "inlineData" in inlinePart ? inlinePart.inlineData : null;

    if (!inlineData?.data) {
      return NextResponse.json(
        { error: "Gemini did not return image data." },
        { status: 502 }
      );
    }

    const mimeType = inlineData.mimeType ?? "image/png";
    const dataUrl = `data:${mimeType};base64,${inlineData.data}`;

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
