"use client";

import { useRef, useState } from "react";
import { Sparkles, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEditorStore } from "@/lib/store/editorStore";
import { toast } from "sonner";

type AddFramePanelProps = {
  placeholderId: string;
};

export function AddFramePanel({ placeholderId }: AddFramePanelProps) {
  const confirmPlaceholder = useEditorStore((state) => state.confirmPlaceholder);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("读取文件失败"));
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("无法解析图片数据"));
        }
      };
      reader.readAsDataURL(file);
    });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      confirmPlaceholder(placeholderId, {
        assetUrl: dataUrl,
        metadata: {
          source: "upload",
          originalName: file.name
        }
      });
      toast.success("图片已上传，已添加到时间轴中。");
      event.target.value = "";
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("请输入用于生成的 Prompt。");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "生成失败，请稍后重试。");
      }

      confirmPlaceholder(placeholderId, {
        assetUrl: data.image,
        metadata: {
          source: "gemini-2.5-flash",
          prompt: prompt.trim()
        }
      });
      toast.success("AI 生成完成，已填充新帧。");
      setPrompt("");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-600">
        <h3 className="text-lg font-semibold text-neutral-700">上传一张图片</h3>
        <p className="mt-2 leading-relaxed">
          支持 PNG / JPG / WEBP。图片将直接作为这一帧的画面，并用于之后的过渡生成。
        </p>
        <Button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="mt-6 flex items-center gap-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          选择图片
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUploadChange}
        />
      </div>
      <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-700">AI 生成帧</h3>
        <p className="mt-2 text-sm text-neutral-600">
          使用 Gemini 生成图像，建议描述清楚场景、主体、光线与镜头风格。
        </p>
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="例如：日落时分的城市天际线，暖色调，航拍镜头。"
          className="mt-4"
        />
        <Button
          variant="secondary"
          className="mt-4 flex items-center gap-2"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary" />
          )}
          使用 Gemini 生成
        </Button>
      </div>
    </div>
  );
}
