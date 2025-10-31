"use client";

import { FrameCard } from "@/features/timeline/components/FrameCard";
import { TransitionCard } from "@/features/timeline/components/TransitionCard";
import { useEditorStore } from "@/lib/store/editorStore";

export function Timeline() {
  const frames = useEditorStore((state) => state.frames);
  const transitions = useEditorStore((state) => state.transitions);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">时间轴</h3>
        <p className="text-sm text-neutral-500">
          点击占位格添加新帧，生成过渡后可预览
        </p>
      </div>
      <div className="flex flex-1 items-start justify-start gap-4 overflow-x-auto pb-6">
        {frames.map((frame, index) => {
          const transition = transitions.find(
            (item) => item.fromFrameId === frame.id
          );
          const isLast = index === frames.length - 1;
          return (
            <div key={frame.id} className="flex items-start gap-4">
              <FrameCard frame={frame} />
              {!isLast && transition ? (
                <TransitionCard transition={transition} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
