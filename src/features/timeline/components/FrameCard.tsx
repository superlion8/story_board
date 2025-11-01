"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Frame } from "@/lib/types/story";
import { useEditorStore } from "@/lib/store/editorStore";

type FrameCardProps = {
  frame: Frame;
};

export function FrameCard({ frame }: FrameCardProps) {
  const selectFrame = useEditorStore((state) => state.selectFrame);
  const selectedFrameId = useEditorStore((state) => state.selectedFrameId);

  const isSelected = selectedFrameId === frame.id;
  const isPlaceholder = frame.id.startsWith("placeholder-");
  const hasThumbnail = Boolean(frame.asset.thumbnailUrl || frame.asset.url);

  if (isPlaceholder) {
    return (
      <button
        type="button"
        onClick={() => selectFrame(frame.id)}
        className={cn(
          "flex h-12 items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-transparent text-sm font-medium text-neutral-500 transition hover:border-primary hover:text-primary",
          isSelected && "border-primary text-primary"
        )}
      >
        + 添加帧
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => selectFrame(frame.id)}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-primary/60",
        isSelected && "border-primary bg-primary/5 text-primary"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
          {frame.order + 1}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Frame</span>
          <span className="text-xs text-neutral-500">
            {hasThumbnail ? "点击预览" : "等待图像"}
          </span>
        </div>
      </div>
      {hasThumbnail ? (
        <div
          className="relative w-20 overflow-hidden rounded-xl bg-neutral-100"
          style={{ aspectRatio: "16 / 9" }}
        >
          <Image
            src={frame.asset.thumbnailUrl || frame.asset.url}
            alt={`Frame ${frame.order + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="w-20 rounded-xl border border-dashed border-neutral-300"
          style={{ aspectRatio: "16 / 9" }}
        />
      )}
    </button>
  );
}
