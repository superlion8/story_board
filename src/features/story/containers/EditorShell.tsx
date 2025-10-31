"use client";

import { ReactNode } from "react";
import { Timeline } from "@/features/timeline/Timeline";
import { EditorTabs } from "@/features/story/components/EditorTabs";
import { EditorHeader } from "@/features/story/components/EditorHeader";

type EditorShellProps = {
  storyId: string;
  headerSlot?: ReactNode;
};

export function EditorShell({ storyId, headerSlot }: EditorShellProps) {
  return (
    <div
      className="flex h-full min-h-screen flex-col gap-6 p-6 md:p-10"
      data-story-id={storyId}
    >
      <div className="space-y-4">
        {headerSlot}
        <EditorHeader />
      </div>
      <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
        <aside className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
          <Timeline />
        </aside>
        <section className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <EditorTabs />
        </section>
      </div>
    </div>
  );
}
