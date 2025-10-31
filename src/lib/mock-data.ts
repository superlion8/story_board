import { Story, Transition } from "@/lib/types/story";

export const demoStories: Story[] = [
  {
    id: "story-1",
    title: "暮色中的城市",
    description: "AI prompts about futuristic city at dusk.",
    coverUrl: "/demo/frame-1.svg",
    totalDurationMs: 45000,
    frameCount: 8,
    status: "draft",
    updatedAt: new Date().toISOString()
  },
  {
    id: "story-2",
    title: "森林探险",
    description: "Animated journey across a mystic forest.",
    coverUrl: "/demo/frame-2.svg",
    totalDurationMs: 60000,
    frameCount: 10,
    status: "ready",
    updatedAt: new Date(Date.now() - 3600_000).toISOString()
  }
];

export const demoTransitions: Transition[] = [];
