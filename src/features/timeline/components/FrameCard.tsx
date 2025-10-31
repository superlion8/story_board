"use client";

import Image from "next/image";
import { Trash2, MoveLeft, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import { Frame } from "@/lib/types/story";
import { useEditorStore } from "@/lib/store/editorStore";

type FrameCardProps = {
  frame: Frame;
};

export function FrameCard({ frame }: FrameCardProps) {
  const selectFrame = useEditorStore((state) => state.selectFrame);
  const selectedFrameId = useEditorStore((state) => state.selectedFrameId);
  const removeFrame = useEditorStore((state) => state.removeFrame);
  const reorderFrame = useEditorStore((state) => state.reorderFrame);
  const frames = useEditorStore((state) =>
    state.frames.filter((item) => !item.id.startsWith("placeholder-"))
  );

  const isSelected = selectedFrameId === frame.id;
  const isPlaceholder = frame.id.startsWith("placeholder-");

  if (isPlaceholder) {
    return (
      <button
        type="button"
        onClick={() => selectFrame(frame.id)}
        className={cn(
          "flex h-[140px] w-[160px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-500 transition hover:border-primary hover:text-primary",
          isSelected && "border-primary bg-primary/10 text-primary"
        )}
      >
        + 添加帧
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex w-[200px] flex-col gap-3 rounded-3xl border border-transparent p-3 transition hover:border-primary/40",
        isSelected && "border-primary bg-primary/5 shadow"
      )}
    >
      <button
        type="button"
        onClick={() => selectFrame(frame.id)}
        className="flex flex-col gap-2"
      >
        <div className="relative h-28 w-full overflow-hidden rounded-2xl bg-neutral-100">
          {frame.asset.thumbnailUrl ? (
            <Image
              src={frame.asset.thumbnailUrl}
              alt={`Frame ${frame.order}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400">
              无缩略图
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>Frame #{frame.order + 1}</span>
          <span>{formatDuration(frame.durationMs)}</span>
        </div>
      </button>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => reorderFrame(frame.order, Math.max(frame.order - 1, 0))}
            disabled={frame.order === 0}
            aria-label="向左移动"
          >
            <MoveLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              reorderFrame(frame.order, Math.min(frame.order + 1, frames.length - 1))
            }
            disabled={frame.order === frames.length - 1}
            aria-label="向右移动"
          >
            <MoveRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeFrame(frame.id)}
          aria-label="删除帧"
        >
          <Trash2 className="h-4 w-4 text-error" />
        </Button>
      </div>
    </div>
  );
}
