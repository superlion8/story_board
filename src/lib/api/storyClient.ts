"use client";

import { useQuery } from "@tanstack/react-query";
import { demoStories, demoTransitions } from "@/lib/mock-data";

export function useStories() {
  return useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return demoStories;
    }
  });
}

export function useStory(storyId: string) {
  return useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return demoStories.find((story) => story.id === storyId) ?? demoStories[0];
    }
  });
}

export function useTransitions(storyId: string) {
  return useQuery({
    queryKey: ["story", storyId, "transitions"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return demoTransitions.filter((transition) => transition.storyId === storyId);
    }
  });
}
