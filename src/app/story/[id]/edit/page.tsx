import { notFound } from "next/navigation";
import { demoStories } from "@/lib/mock-data";
import { EditorShell } from "@/features/story/containers/EditorShell";

export default async function StoryEditPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = demoStories.find((item) => item.id === id) ?? demoStories[0];

  if (!story) {
    notFound();
  }

  return <EditorShell storyId={story.id} />;
}
