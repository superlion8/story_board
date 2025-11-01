"use client";

import { useRef, useState } from "react";
import { Sparkles, Loader2, ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TARGET_EDITOR_ROUTE = "/story/story-1/edit?from=gemini";

export function PromptForm() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("电影感");
  const [isLoading, setIsLoading] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) {
      toast.error("请输入用于生成的 Prompt。");
      return;
    }

    setIsLoading(true);

    try {
      const combinedPrompt = style
        ? `${prompt.trim()}，风格：${style.trim()}`
        : prompt.trim();

      const response = await fetch("/api/ai/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: combinedPrompt,
          referenceImage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "生成失败，请稍后再试。");
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "story-board:pending-frame",
          JSON.stringify({
            image: data.image,
            prompt: combinedPrompt,
            source: "gemini-2.5-flash-image",
            referenceImage
          })
        );
      }

      toast.success("Gemini 生图任务已完成，正在跳转编辑器。");
      router.push(TARGET_EDITOR_ROUTE);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col gap-4 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold">Prompt 生成首帧</h2>
      <Textarea
        required
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="描述你想要的故事开场，例如：辽阔的火星荒原，日落时分的探险队。"
      />
      <div>
        <label className="mb-2 block text-sm text-neutral-600">风格预设</label>
        <Input
          value={style}
          onChange={(event) => setStyle(event.target.value)}
          placeholder="如：电影感、赛博朋克、手绘"
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">参考图（可选）</span>
          {referenceImage ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => setReferenceImage(null)}
            >
              <X className="h-3 w-3" />
              移除
            </Button>
          ) : null}
        </div>
        {referenceImage ? (
          <div className="relative h-40 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={referenceImage} alt="参考图" className="h-full w-full object-cover" />
          </div>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4 text-primary" />
            上传参考图
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") {
                setReferenceImage(reader.result);
              }
            };
            reader.readAsDataURL(file);
          }}
        />
      </div>
      <Button type="submit" disabled={isLoading} className="gap-2">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        生成并进入编辑器
      </Button>
      <p className="text-xs text-neutral-500">
        生成完成后会自动创建 Story 并进入时间轴编辑器。平均耗时 10 秒。
      </p>
    </form>
  );
}
