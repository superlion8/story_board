"use client";

import { Loader2, RefreshCcw, Sparkles, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Transition } from "@/lib/types/story";
import { useEditorStore } from "@/lib/store/editorStore";

const statusLabels: Record<Transition["status"], string> = {
  idle: "待配置",
  queued: "排队中",
  running: "生成中",
  ready: "已生成",
  failed: "失败",
  "needs-regenerate": "需重算"
};

const statusVariant: Record<Transition["status"], React.ComponentProps<typeof Badge>["variant"]> =
  {
    idle: "muted",
    queued: "warning",
    running: "warning",
    ready: "success",
    failed: "error",
    "needs-regenerate": "muted"
  };

type TransitionCardProps = {
  transition: Transition;
};

export function TransitionCard({ transition }: TransitionCardProps) {
  const selectTransition = useEditorStore((state) => state.selectTransition);
  const markNeedsRegenerate = useEditorStore((state) => state.markNeedsRegenerate);
  const selectedTransitionId = useEditorStore(
    (state) => state.selectedTransitionId
  );

  const isSelected = selectedTransitionId === transition.id;

  return (
    <div
      className={cn(
        "flex w-[200px] flex-col gap-3 rounded-3xl border border-dashed border-neutral-200 bg-white/60 p-4 text-sm text-neutral-600 transition hover:border-primary/40",
        isSelected && "border-primary bg-primary/5 shadow"
      )}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          Transition
        </span>
        <Badge variant={statusVariant[transition.status]}>
          {statusLabels[transition.status]}
        </Badge>
      </div>
      <p className="line-clamp-2 min-h-[48px] text-xs text-neutral-500">
        {transition.prompt || "尚未填写提示词"}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => selectTransition(transition.id)}
        >
          详情
        </Button>
        {(transition.status === "idle" ||
          transition.status === "failed" ||
          transition.status === "needs-regenerate") && (
          <Button
            variant="default"
            size="icon"
            onClick={() => selectTransition(transition.id)}
            aria-label="去生成过渡"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        )}
        {transition.status === "running" || transition.status === "queued" ? (
          <Button variant="ghost" size="icon" disabled>
            <Loader2 className="h-4 w-4 animate-spin text-warning" />
          </Button>
        ) : null}
        {transition.status === "ready" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => markNeedsRegenerate(transition.id)}
            aria-label="重新生成"
          >
            <RefreshCcw className="h-4 w-4 text-primary" />
          </Button>
        )}
      </div>
    </div>
  );
}
