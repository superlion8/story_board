"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEditorStore } from "@/lib/store/editorStore";
import { formatDuration } from "@/lib/utils";

export function PreviewTab() {
  const [mode, setMode] = useState<"single" | "all">("single");
  const frames = useEditorStore((state) => state.frames);
  const selectedFrameId = useEditorStore((state) => state.selectedFrameId);
  const transitions = useEditorStore((state) => state.transitions);

  const frame = frames.find((item) => item.id === selectedFrameId);

  const totalDuration = frames
    .filter((item) => !item.id.startsWith("placeholder-"))
    .reduce((acc, item) => acc + item.durationMs, 0);

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
        <TabsList>
          <TabsTrigger value="single">单段预览</TabsTrigger>
          <TabsTrigger value="all">全片预览</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <PreviewPlaceholder
            title="单段预览"
            description={
              frame
                ? `Frame #${frame.order + 1} 时长 ${formatDuration(frame.durationMs)}`
                : "请选择一帧或过渡进行预览。"
            }
          />
        </TabsContent>
        <TabsContent value="all">
          <PreviewPlaceholder
            title="全片预览"
            description={`总时长 ~ ${formatDuration(totalDuration + transitions.length * 5000)}`}
          />
        </TabsContent>
      </Tabs>
      <div className="flex items-center gap-3">
        <Button variant="secondary">导出低清片段</Button>
        <Button variant="ghost">开新窗口播放</Button>
      </div>
    </div>
  );
}

function PreviewPlaceholder({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 text-center text-neutral-500">
      <p className="text-lg font-medium text-neutral-600">{title}</p>
      <p className="max-w-md text-sm text-neutral-500">{description}</p>
    </div>
  );
}
