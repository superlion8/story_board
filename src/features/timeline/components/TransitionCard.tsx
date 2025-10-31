"use client";

import { Loader2, Sparkles, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transition } from "@/lib/types/story";
import { useEditorStore } from "@/lib/store/editorStore";

const statusText: Record<Transition["status"], string> = {
  idle: "待配置",
  queued: "排队中",
  running: "生成中",
  ready: "已生成",
  failed: "失败",
  "needs-regenerate": "需重算"
};

type TransitionCardProps = {
  transition: Transition;
};

export function TransitionCard({ transition }: TransitionCardProps) {
  const selectTransition = useEditorStore((state) => state.selectTransition);
  const selectedTransitionId = useEditorStore(
    (state) => state.selectedTransitionId
  );

  const isSelected = selectedTransitionId === transition.id;
  const isQueued =
    transition.status === "queued" || transition.status === "running";
  const isReady = transition.status === "ready";

  return (
    <button
      type="button"
      onClick={() => selectTransition(transition.id)}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border border-dashed border-neutral-300 bg-white/80 px-4 py-3 text-left text-sm text-neutral-600 transition hover:border-primary/60",
        isSelected && "border-primary bg-primary/5 text-primary",
        transition.status === "needs-regenerate" && "border-dashed border-warning/70"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Video className="h-4 w-4" />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Transition</span>
          <span className="text-xs text-neutral-500">
            {statusText[transition.status]}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isQueued ? (
          <Loader2 className="h-4 w-4 animate-spin text-warning" />
        ) : (
          <Sparkles
            className={cn(
              "h-4 w-4",
              isReady ? "text-success" : "text-primary"
            )}
          />
        )}
      </div>
    </button>
  );
}
