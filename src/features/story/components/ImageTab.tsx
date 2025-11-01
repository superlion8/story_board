"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEditorStore } from "@/lib/store/editorStore";
import { toast } from "sonner";

export function ImageTab() {
  const selectedFrameId = useEditorStore((state) => state.selectedFrameId);
  const frame = useEditorStore((state) =>
    state.frames.find((item) => item.id === selectedFrameId)
  );
  const updateFrame = useEditorStore((state) => state.updateFrame);

  const [note, setNote] = useState((frame?.metadata?.prompt as string) ?? "");
  const [isReplacing, setIsReplacing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setNote((frame?.metadata?.prompt as string) ?? "");
  }, [frame?.id, frame?.metadata?.prompt]);

  if (!frame) {
    return (
      <div className="space-y-4 text-center text-neutral-500">
        <p>请选择一帧以进行编辑。</p>
      </div>
    );
  }

  if (frame.id.startsWith("placeholder-")) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-neutral-500">
        <p>这是一个待填充的占位帧。</p>
        <p>请在预览面板中选择「上传图片」或「AI 生成」完成添加。</p>
      </div>
    );
  }

  const handleReplace = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsReplacing(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateFrame(frame.id, {
        asset: {
          ...frame.asset,
          url: dataUrl,
          thumbnailUrl: dataUrl
        },
        metadata: {
          ...frame.metadata,
          source: "upload",
          originalName: file.name
        }
      });
      toast.success("已替换当前帧图像。");
      event.target.value = "";
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
    } finally {
      setIsReplacing(false);
    }
  };

  const handleRegenerate = async () => {
    if (!note.trim()) {
      toast.error("请先输入用于生成的 Prompt。");
      return;
    }
    setIsRegenerating(true);
    try {
      const response = await fetch("/api/ai/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: note.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "生成失败，请稍后重试。");
      }
      updateFrame(frame.id, {
        asset: {
          ...frame.asset,
          url: data.image,
          thumbnailUrl: data.image
        },
        metadata: {
          ...frame.metadata,
          prompt: note.trim(),
          source: "gemini-2.5-flash"
        }
      });
      toast.success("AI 生成完成，已替换当前帧。");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveNote = () => {
    updateFrame(frame.id, {
      metadata: {
        ...frame.metadata,
        prompt: note
      }
    });
    toast.success("已保存备注。");
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="flex flex-col gap-4">
        <div className="relative aspect-video overflow-hidden rounded-3xl bg-neutral-100">
          {frame.asset.url ? (
            <Image
              src={frame.asset.url}
              alt={`Frame ${frame.order}`}
              fill
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={isReplacing}
          >
            {isReplacing ? "上传中..." : "替换图片"}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? "生成中..." : "AI 重新生成"}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-600">
            Prompt / 备注
          </label>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="记录该帧的生成提示词或备注，方便下次复用。"
          />
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={handleSaveNote}>
            保存备注
          </Button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplace}
      />
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
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
}
