"use client";

import { Fragment } from "react";
import { FrameCard } from "@/features/timeline/components/FrameCard";
import { TransitionCard } from "@/features/timeline/components/TransitionCard";
import { useEditorStore } from "@/lib/store/editorStore";

export function Timeline() {
  const frames = useEditorStore((state) => state.frames);
  const transitions = useEditorStore((state) => state.transitions);

  const orderedFrames = [...frames].sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">序列</h3>
        <p className="text-sm text-neutral-500">
          左侧选择 Frame / Video，右侧区域即时预览与编辑。
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {orderedFrames.map((frame) => {
          const transition = transitions.find(
            (item) => item.fromFrameId === frame.id
          );

          return (
            <Fragment key={frame.id}>
              <FrameCard frame={frame} />
              {transition && !frame.id.startsWith("placeholder-") ? (
                <TransitionCard transition={transition} />
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
