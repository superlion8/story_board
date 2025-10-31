import { notFound } from "next/navigation";
import Image from "next/image";
import { demoStories } from "@/lib/mock-data";
import { EditorShell } from "@/features/story/containers/EditorShell";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";

type EditPageProps = {
  params: {
    id: string;
  };
};

export default function StoryEditPage({ params }: EditPageProps) {
  const story = demoStories.find((item) => item.id === params.id) ?? demoStories[0];

  if (!story) {
    notFound();
  }

  return (
    <EditorShell
      storyId={story.id}
      headerSlot={
        <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="relative h-20 w-32 overflow-hidden rounded-2xl bg-neutral-100">
            <Image
              src={story.coverUrl}
              alt={`${story.title} cover`}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{story.title}</h1>
              <Badge variant={story.status === "ready" ? "success" : "muted"}>
                {story.status}
              </Badge>
            </div>
            <p className="text-sm text-neutral-500">
              总时长 {formatDuration(story.totalDurationMs)} · 帧数{" "}
              {story.frameCount} · 更新于 {new Date(story.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      }
    />
  );
}
