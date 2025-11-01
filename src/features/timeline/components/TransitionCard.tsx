"use client";

import { Loader2, Sparkles, Video, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transition } from "@/lib/types/story";
import { useEditorStore } from "@/lib/store/editorStore";
import { useState, useEffect } from "react";

const statusText: Record<Transition["status"], string> = {
  idle: "待配置",
  queued: "排队中",
  running: "生成中",
  ready: "已生成",
  failed: "失败",
  "needs-regenerate": "需重算"
};

const estimatedTimeByStatus: Record<Transition["status"], number | null> = {
  idle: null,
  queued: 30,
  running: 15,
  ready: null,
  failed: null,
  "needs-regenerate": null
};

type TransitionCardProps = {
  transition: Transition;
};

export function TransitionCard({ transition }: TransitionCardProps) {
  const selectTransition = useEditorStore((state) => state.selectTransition);
  const selectedTransitionId = useEditorStore(
    (state) => state.selectedTransitionId
  );

  const [progress, setProgress] = useState(0);

  const isSelected = selectedTransitionId === transition.id;
  const isQueued =
    transition.status === "queued" || transition.status === "running";
  const isReady = transition.status === "ready";
  const isFailed = transition.status === "failed";
  const estimatedTime = estimatedTimeByStatus[transition.status];

  // Simulate progress for running transitions
  useEffect(() => {
    if (transition.status === "running") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 10;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (transition.status === "ready") {
      setProgress(100);
    } else {
      setProgress(0);
    }
  }, [transition.status]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => selectTransition(transition.id)}
        className={cn(
          "flex w-full flex-col gap-2 rounded-2xl border border-dashed border-neutral-300 bg-white/80 px-4 py-3 text-left text-sm text-neutral-600 transition hover:border-primary/60",
          isSelected && "border-primary bg-primary/5 text-primary",
          transition.status === "needs-regenerate" && "border-dashed border-warning/70",
          isFailed && "border-error/70 bg-error/5"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl",
                isFailed
                  ? "bg-error/10 text-error"
                  : "bg-primary/10 text-primary"
              )}
            >
              {isFailed ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Video className="h-4 w-4" />
              )}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Transition</span>
              <span
                className={cn(
                  "text-xs",
                  isFailed ? "text-error" : "text-neutral-500"
                )}
              >
                {statusText[transition.status]}
                {estimatedTime && (
                  <span className="ml-1 inline-flex items-center gap-1">
                    <Clock className="inline h-3 w-3" />
                    ~{estimatedTime}s
                  </span>
                )}
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
                  isReady ? "text-success" : isFailed ? "text-error" : "text-primary"
                )}
              />
            )}
          </div>
        </div>
        
        {/* Progress bar for running transitions */}
        {transition.status === "running" && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </button>
    </div>
  );
}
