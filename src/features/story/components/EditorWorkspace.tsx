"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store/editorStore";
import { toast } from "sonner";
import { ImageTab } from "@/features/story/components/ImageTab";
import { TransitionTab } from "@/features/story/components/TransitionTab";
import { AddFramePanel } from "@/features/story/components/AddFramePanel";

type PreviewMode = "single" | "all";

export function EditorWorkspace() {
  const frames = useEditorStore((state) => state.frames);
  const transitions = useEditorStore((state) => state.transitions);
  const selectedFrameId = useEditorStore((state) => state.selectedFrameId);
  const selectedTransitionId = useEditorStore(
    (state) => state.selectedTransitionId
  );

  const selectedFrame = frames.find((frame) => frame.id === selectedFrameId);
  const selectedTransition = transitions.find(
    (transition) => transition.id === selectedTransitionId
  );

  const isPlaceholderSelected =
    Boolean(selectedFrame?.id?.startsWith("placeholder-"));

  const [previewMode, setPreviewMode] = useState<PreviewMode>("single");
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (selectedTransitionId) {
      setShowEditor(false);
    }
  }, [selectedTransitionId]);

  useEffect(() => {
    if (isPlaceholderSelected) {
      setShowEditor(false);
    }
  }, [isPlaceholderSelected]);

  useEffect(() => {
    if (selectedTransition && !selectedTransition.previewUrl) {
      setShowEditor(true);
    }
  }, [selectedTransition]);

  const hasSelection = Boolean(selectedFrame || selectedTransition);
  const hasMultiple =
    frames.filter((frame) => !frame.id.startsWith("placeholder-")).length +
      transitions.length >
    1;

  const selectionLabel = selectedTransition
    ? "过渡视频"
    : selectedFrame
      ? `Frame #${selectedFrame.order + 1}`
      : "未选择";

  const previewContent = useMemo(() => {
    if (previewMode === "all") {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-neutral-500">
          <span>全片预览即将上线，当前展示缩略视图。</span>
          <span>请选择单个 Frame 或 Video 以编辑细节。</span>
        </div>
      );
    }

    if (selectedTransition) {
      if (selectedTransition.previewUrl) {
        return (
          <video
            key={selectedTransition.previewUrl}
            className="h-full w-full rounded-2xl object-cover"
            src={selectedTransition.previewUrl}
            controls
            playsInline
          />
        );
      }
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-neutral-500">
          <span>暂无预览视频</span>
          <span>生成后可在此查看 5s 过渡。</span>
        </div>
      );
    }

    if (selectedFrame && !isPlaceholderSelected) {
      if (selectedFrame.asset.url) {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selectedFrame.asset.url}
            alt={selectionLabel}
            className="h-full w-full rounded-2xl object-contain bg-neutral-900/5"
          />
        );
      }

      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-neutral-500">
          <span>等待上传或生成图像</span>
          <span>请使用编辑面板补充图像内容。</span>
        </div>
      );
    }

    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-neutral-500">
        <span>请选择左侧 Frame 或 Video 进行预览。</span>
        <span>新增帧后可继续扩展故事时间轴。</span>
      </div>
    );
  }, [previewMode, selectedFrame, selectedTransition, selectionLabel, isPlaceholderSelected]);

  const toggleEditor = () => {
    if (!selectedFrame && !selectedTransition) {
      toast.error("请先在左侧选择一个 Frame 或 Transition。");
      return;
    }
    setShowEditor((prev) => !prev);
  };

  const handlePreviewModeChange = (mode: PreviewMode) => {
    setPreviewMode(mode);
    if (mode === "all") {
      toast.info("全片预览将在后续版本提供拼接效果。");
    }
  };

  const handleDownload = () => {
    if (selectedTransition?.previewUrl) {
      window.open(selectedTransition.previewUrl, "_blank");
      return;
    }
    if (selectedFrame?.asset.url) {
      const link = document.createElement("a");
      link.href = selectedFrame.asset.url;
      link.download = `frame-${selectedFrame.order + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    toast.error("当前没有可下载的媒体资源。");
  };

  const primaryActionLabel = hasMultiple
    ? "Download Image/Video"
    : "Save Image/Video";

  if (isPlaceholderSelected && selectedFrame) {
    return (
      <div className="flex h-full flex-col gap-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">添加新帧</h2>
          <p className="text-sm text-neutral-500">
            选择上传图片或使用 AI 生成内容，以填充这一帧。
          </p>
        </div>
        <AddFramePanel placeholderId={selectedFrame.id} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Preview</h2>
          <p className="text-sm text-neutral-500">
            {previewMode === "single"
              ? `正在查看：${selectionLabel}`
              : "预览整段故事占位效果"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode === "single" ? "default" : "secondary"}
            onClick={() => handlePreviewModeChange("single")}
          >
            Preview Single
          </Button>
          <Button
            variant={previewMode === "all" ? "default" : "secondary"}
            onClick={() => handlePreviewModeChange("all")}
          >
            Preview All
          </Button>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-neutral-100 bg-white p-6 shadow-inner">
        <div className="h-[360px] w-full max-w-[520px] rounded-2xl bg-neutral-200/40 p-4">
          <div className="h-full w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
            {previewContent}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={toggleEditor} disabled={!hasSelection}>
          Edit
        </Button>
        <Button onClick={handleDownload}>{primaryActionLabel}</Button>
      </div>
      {showEditor ? (
        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          {selectedTransition ? <TransitionTab /> : <ImageTab />}
        </div>
      ) : null}
    </div>
  );
}
