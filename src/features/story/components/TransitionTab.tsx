"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useEditorStore } from "@/lib/store/editorStore";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  transitionPresets,
  categoryNames,
  type TransitionPreset,
} from "@/lib/constants/transitionPresets";
import { Sparkles } from "lucide-react";

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

      const taskIdValue =
        data.taskId ??
        data.task?.task_id ??
        data.task?.taskId ??
        data.response?.data?.task_id ??
        data.response?.data?.taskId ??
        data.response?.task_id ??
        data.response?.taskId;

      const normalizedStatus: typeof transition.status = normalizeStatus(
        data.status ?? data.task?.task_status ?? data.response?.data?.task_status ?? "queued"
      ) as typeof transition.status;

      const previewUrl =
        data.videoUrl ??
        data.task?.task_result?.videos?.[0]?.url ??
        data.response?.data?.task_result?.videos?.[0]?.url ??
        data.response?.video_url ??
        data.response?.preview_url ??
        data.response?.resource_url;

      updateTransition(transition.id, {
        status: normalizedStatus,
        taskId: taskIdValue,
        prompt: prompt.trim(),
        previewUrl: previewUrl ?? transition.previewUrl
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
        const result = await resp.json();
        if (!resp.ok) {
          throw new Error(result.error ?? "查询任务状态失败");
        }

        if (cancelled) return;

        const rawStatus =
          result.status ??
          result.task?.task_status ??
          result.task_status ??
          result.raw?.data?.task_status ??
          result.raw?.task_status ??
          "";

        const normalized = normalizeStatus(rawStatus);

        const videoUrl =
          result.videoUrl ??
          result.task?.task_result?.videos?.[0]?.url ??
          result.raw?.data?.task_result?.videos?.[0]?.url ??
          result.raw?.task_result?.videos?.[0]?.url ??
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
        {/* Preset Templates */}
        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-600">
            <Sparkles className="h-4 w-4" />
            快速选择预设效果
          </label>
          <div className="space-y-3">
            {Object.entries(categoryNames).map(([category, label]) => {
              const categoryPresets = transitionPresets.filter(
                (p) => p.category === category
              );
              return (
                <div key={category}>
                  <p className="mb-2 text-xs font-medium text-neutral-500">
                    {label}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setPrompt(preset.prompt)}
                        className="flex items-start gap-2 rounded-xl border border-neutral-200 bg-white p-3 text-left transition hover:border-primary hover:bg-primary/5"
                      >
                        <span className="text-xl">{preset.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900">
                            {preset.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {preset.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-x-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-neutral-500">或自定义</span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-600">
            自定义 Prompt
          </label>
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="例如：A cinematic drone fly-through that bridges the cyberpunk skyline to the lush jungle."
            rows={4}
          />
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
      <div
        className="relative overflow-hidden rounded-2xl bg-neutral-100"
        style={{ aspectRatio: "16 / 9" }}
      >
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
