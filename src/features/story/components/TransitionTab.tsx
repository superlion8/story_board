"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useEditorStore } from "@/lib/store/editorStore";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function TransitionTab() {
  const selectedTransitionId = useEditorStore((state) => state.selectedTransitionId);
  const transitions = useEditorStore((state) => state.transitions);
  const frames = useEditorStore((state) => state.frames);
  const updateTransition = useEditorStore((state) => state.updateTransition);

  const transition = transitions.find((item) => item.id === selectedTransitionId);
  const [prompt, setPrompt] = useState(transition?.prompt ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    setPrompt(transition?.prompt ?? "");
  }, [transition?.prompt]);

  const startFrame = useMemo(
    () => frames.find((frame) => frame.id === transition?.fromFrameId),
    [frames, transition?.fromFrameId]
  );
  const endFrame = useMemo(
    () => frames.find((frame) => frame.id === transition?.toFrameId),
    [frames, transition?.toFrameId]
  );

  const handleGenerate = async () => {
    if (!transition || !startFrame || !endFrame) {
      return;
    }

    if (!prompt.trim()) {
      toast.error("请填写过渡 Prompt。");
      return;
    }

    setIsSubmitting(true);
    updateTransition(transition.id, {
      prompt: prompt.trim(),
      status: "running"
    });

    try {
      const response = await fetch("/api/ai/transition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          startImage: startFrame.asset.url,
          endImage: endFrame.asset.url,
          prompt: prompt.trim(),
          duration: Math.round(transition.durationMs / 1000)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "过渡生成失败，请稍后重试。");
      }

      const statusCandidate = typeof data.status === "string" ? data.status.toLowerCase() : "";
      const normalizedStatus: typeof transition.status = [
        "queued",
        "running",
        "ready"
      ].includes(statusCandidate as typeof transition.status)
        ? (statusCandidate as typeof transition.status)
        : "queued";

      const taskIdValue =
        data.taskId ??
        data.task_id ??
        data.response?.task_id ??
        data.response?.data?.task_id ??
        data.response?.data?.taskId;

      updateTransition(transition.id, {
        status: normalizedStatus,
        taskId: taskIdValue,
        prompt: prompt.trim(),
        previewUrl:
          data.response?.video_url ??
          data.response?.preview_url ??
          data.response?.resource_url
      });

      toast.success("已提交 Kling 过渡生成任务。");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
      updateTransition(transition.id, {
        status: "failed"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!transition || !transition.taskId) {
      return;
    }

    if (!["queued", "running"].includes(transition.status)) {
      setIsPolling(false);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const resp = await fetch(`/api/ai/transition/${transition.taskId}`);
        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.error ?? "查询任务状态失败");
        }

        if (cancelled) return;

        const rawStatus =
          data.task_status ??
          data.status ??
          data.taskStatus ??
          data.result?.status ??
          data.data?.task_status ??
          data.data?.status ??
          "";

        const normalized = normalizeStatus(rawStatus);

        const videoUrl =
          data.video_url ??
          data.preview_url ??
          data.result?.video_url ??
          data.result?.preview_url ??
          data.data?.video_url ??
          data.data?.preview_video ??
          transition.previewUrl;

        updateTransition(transition.id, {
          status: normalized,
          previewUrl: videoUrl ?? transition.previewUrl
        });

        if (normalized === "ready") {
          setIsPolling(false);
          toast.success("Kling 过渡已生成完成。");
          return;
        } else if (normalized === "failed") {
          setIsPolling(false);
          toast.error("Kling 过渡生成失败。");
          return;
        }
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : String(error);
        toast.error(message);
        updateTransition(transition.id, { status: "failed" });
        setIsPolling(false);
      }
    };

    setIsPolling(true);
    poll();
    const timer = setInterval(poll, 5000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [transition, updateTransition]);

  if (!transition || !startFrame || !endFrame) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-neutral-500">
        <p>请选择时间轴中的一个过渡以编辑提示词与参数。</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_2fr]">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FramePreview frame={startFrame} label="开始帧" />
          <FramePreview frame={endFrame} label="结束帧" />
        </div>
        <div className="rounded-3xl bg-neutral-50 p-4 text-sm text-neutral-600">
          <p>使用 Kling 模型生成首尾帧之间的 5 秒过渡视频。</p>
          <p className="mt-2">状态：{transition.status}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-600">
            过渡 Prompt
          </label>
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="例如：A cinematic drone fly-through that bridges the cyberpunk skyline to the lush jungle."
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["电影感", "慢门", "快节奏", "手持摇镜"].map((preset) => (
            <Badge
              key={preset}
              variant={prompt.includes(preset) ? "default" : "muted"}
              className="cursor-pointer"
              onClick={() =>
                setPrompt((prev) =>
                  prev.includes(preset) ? prev : prev ? `${prev}，${preset}` : preset
                )
              }
            >
              {preset}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              updateTransition(transition.id, {
                prompt,
                status: "needs-regenerate"
              })
            }
          >
            保存草稿
          </Button>
          <Button disabled={isSubmitting || isPolling} onClick={handleGenerate}>
            {isSubmitting ? "生成中..." : isPolling ? "生成中..." : "生成过渡"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function normalizeStatus(raw: string): ReturnType<typeof useEditorStore.getState>['transitions'][number]['status'] {
  const value = raw?.toLowerCase?.() ?? "";
  switch (value) {
    case "success":
    case "succeeded":
    case "completed":
    case "ready":
      return "ready";
    case "running":
    case "processing":
    case "in_progress":
      return "running";
    case "queued":
    case "pending":
    case "waiting":
      return "queued";
    case "failed":
    case "error":
    case "timeout":
      return "failed";
    default:
      return "running";
  }
}

type FramePreviewProps = {
  frame: ReturnType<typeof useEditorStore.getState>["frames"][number];
  label: string;
};

function FramePreview({ frame, label }: FramePreviewProps) {
  return (
    <div className="space-y-3 rounded-3xl border border-neutral-100 bg-white p-4 text-sm">
      <span className="block text-neutral-500">{label}</span>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-neutral-100">
        {frame.asset.thumbnailUrl ? (
          <Image
            src={frame.asset.thumbnailUrl}
            alt={label}
            fill
            className="object-cover"
          />
        ) : null}
      </div>
      <p className="text-xs text-neutral-400">Frame #{frame.order + 1}</p>
    </div>
  );
}
