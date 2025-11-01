"use client";

import { Fragment } from "react";
import { FrameCard } from "@/features/timeline/components/FrameCard";
import { TransitionCard } from "@/features/timeline/components/TransitionCard";
import { useEditorStore } from "@/lib/store/editorStore";
import { TransitionPlaceholderCard } from "@/features/timeline/components/TransitionPlaceholderCard";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export function Timeline() {
  const frames = useEditorStore((state) => state.frames);
  const transitions = useEditorStore((state) => state.transitions);
  const reorderFrame = useEditorStore((state) => state.reorderFrame);

  const orderedFrames = [...frames].sort((a, b) => a.order - b.order);
  
  // Filter out placeholder frames for sortable items
  const sortableFrames = orderedFrames.filter(
    (frame) => !frame.id.startsWith("placeholder-")
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortableFrames.findIndex((f) => f.id === active.id);
      const newIndex = sortableFrames.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderFrame(oldIndex, newIndex);
      }
    }
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">序列</h3>
        <p className="text-sm text-neutral-500">
          拖拽帧以重新排序 • 点击帧或过渡以编辑
        </p>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableFrames.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {orderedFrames.map((frame, index) => {
              const transition = transitions.find(
                (item) => item.fromFrameId === frame.id
              );
              const nextFrame = orderedFrames[index + 1];
              const showPlaceholder =
                !transition &&
                nextFrame &&
                nextFrame.id.startsWith("placeholder-") &&
                !frame.id.startsWith("placeholder-");

              return (
                <Fragment key={frame.id}>
                  <FrameCard frame={frame} />
                  {transition && !frame.id.startsWith("placeholder-") ? (
                    <TransitionCard transition={transition} />
                  ) : showPlaceholder ? (
                    <TransitionPlaceholderCard />
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
