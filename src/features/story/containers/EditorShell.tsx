"use client";

import { useEffect } from "react";
import { Timeline } from "@/features/timeline/Timeline";
import { EditorWorkspace } from "@/features/story/components/EditorWorkspace";
import { useEditorStore } from "@/lib/store/editorStore";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { toast } from "sonner";

const SESSION_KEY = "story-board:pending-frame";

type EditorShellProps = {
  storyId: string;
};

export function EditorShell({ storyId }: EditorShellProps) {
  const updateFrame = useEditorStore((state) => state.updateFrame);
  const selectFrame = useEditorStore((state) => state.selectFrame);
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return;
    }

    try {
      const data = JSON.parse(raw) as {
        image?: string;
        prompt?: string;
        source?: string;
      };

      if (!data.image) {
        throw new Error("缺少图像数据");
      }

      updateFrame("frame-1", {
        asset: {
          type: "image",
          url: data.image,
          thumbnailUrl: data.image
        },
        metadata: {
          ...useEditorStore.getState().frames.find((frame) => frame.id === "frame-1")
            ?.metadata,
          prompt: data.prompt,
          source: data.source
        }
      });
      selectFrame("frame-1");
      toast.success("已导入最新首帧，可继续扩展故事。");
    } catch (error) {
      console.error("Failed to hydrate frame from session:", error);
      toast.error("导入首帧失败，请重试。");
    } finally {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  }, [storyId, selectFrame, updateFrame]);

  return (
    <>
      <OnboardingTour />
      <div
        className="flex h-full min-h-screen flex-col gap-6 p-6 md:p-10"
        data-story-id={storyId}
      >
        <div className="grid flex-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
            <Timeline />
          </aside>
          <section className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
            <EditorWorkspace />
          </section>
        </div>
      </div>
    </>
  );
}
