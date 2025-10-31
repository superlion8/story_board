"use client";

import { create } from "zustand";
import { Frame, Transition } from "@/lib/types/story";

type EditorState = {
  frames: Frame[];
  transitions: Transition[];
  selectedFrameId: string | null;
  selectedTransitionId: string | null;
  addFrame: (payload: { assetUrl: string; thumbnailUrl?: string }) => void;
  updateFrame: (frameId: string, changes: Partial<Frame>) => void;
  removeFrame: (frameId: string) => void;
  reorderFrame: (sourceOrder: number, targetOrder: number) => void;
  selectFrame: (frameId: string | null) => void;
  selectTransition: (transitionId: string | null) => void;
  updateTransition: (
    transitionId: string,
    changes: Partial<Omit<Transition, "id">>
  ) => void;
  queueTransition: (fromFrameId: string, toFrameId: string) => void;
  markNeedsRegenerate: (transitionId: string) => void;
};

const PLACEHOLDER_DURATION = 5000;

function createPlaceholderFrame(order: number): Frame {
  return {
    id: `placeholder-${order}`,
    storyId: "local-preview",
    order,
    asset: {
      type: "image",
      url: "",
      thumbnailUrl: ""
    },
    durationMs: PLACEHOLDER_DURATION,
    status: "ready"
  };
}

function ensurePlaceholder(frames: Frame[]): Frame[] {
  const hasPlaceholder = frames.some((frame) => frame.id.startsWith("placeholder-"));
  if (hasPlaceholder) {
    return frames;
  }
  const nextOrder = frames.length;
  return [...frames, createPlaceholderFrame(nextOrder)];
}

export const useEditorStore = create<EditorState>((set, get) => ({
  frames: ensurePlaceholder([
    {
      id: "frame-1",
      storyId: "local-preview",
      order: 0,
      asset: {
        type: "image",
        url: "/demo/frame-1.svg",
        thumbnailUrl: "/demo/frame-1-thumb.svg"
      },
      durationMs: PLACEHOLDER_DURATION,
      status: "ready"
    }
  ]),
  transitions: [],
  selectedFrameId: "frame-1",
  selectedTransitionId: null,
  addFrame: ({ assetUrl, thumbnailUrl }) =>
    set((state) => {
      const nonPlaceholder = state.frames.filter(
        (frame) => !frame.id.startsWith("placeholder-")
      );
      const nextOrder = nonPlaceholder.length;
      const newFrame: Frame = {
        id: crypto.randomUUID(),
        storyId: "local-preview",
        order: nextOrder,
        asset: {
          type: "image",
          url: assetUrl,
          thumbnailUrl: thumbnailUrl ?? assetUrl
        },
        durationMs: PLACEHOLDER_DURATION,
        status: "ready"
      };
      const updatedFrames = ensurePlaceholder(
        [...nonPlaceholder, newFrame].sort((a, b) => a.order - b.order)
      ).map((frame, index) => ({ ...frame, order: index }));
      return {
        frames: updatedFrames,
        transitions: syncTransitions(updatedFrames, state.transitions),
        selectedFrameId: newFrame.id,
        selectedTransitionId: null
      };
    }),
  updateFrame: (frameId, changes) =>
    set((state) => ({
      frames: state.frames.map((frame) =>
        frame.id === frameId ? { ...frame, ...changes } : frame
      )
    })),
  removeFrame: (frameId) =>
    set((state) => {
      const filtered = state.frames
        .filter((frame) => frame.id !== frameId && !frame.id.startsWith("placeholder-"))
        .map((frame, index) => ({ ...frame, order: index }));
      const frames = ensurePlaceholder(filtered);
      return {
        frames,
        transitions: syncTransitions(frames, state.transitions),
        selectedFrameId: frames[0]?.id ?? null,
        selectedTransitionId: null
      };
    }),
  reorderFrame: (sourceOrder, targetOrder) =>
    set((state) => {
      const movable = state.frames.filter(
        (frame) => !frame.id.startsWith("placeholder-")
      );
      const item = movable.find((frame) => frame.order === sourceOrder);
      if (!item) return state;
      const without = movable.filter((frame) => frame.order !== sourceOrder);
      const before = without.slice(0, targetOrder);
      const after = without.slice(targetOrder);
      const reordered = [...before, item, ...after].map((frame, index) => ({
        ...frame,
        order: index
      }));
      const frames = ensurePlaceholder(reordered);
      return {
        frames,
        transitions: syncTransitions(frames, state.transitions).map((transition) =>
          transition.status === "ready" ? { ...transition, status: "needs-regenerate" } : transition
        )
      };
    }),
  selectFrame: (frameId) =>
    set(() => ({
      selectedFrameId: frameId,
      selectedTransitionId: null
    })),
  selectTransition: (transitionId) =>
    set(() => ({
      selectedTransitionId: transitionId,
      selectedFrameId: null
    })),
  updateTransition: (transitionId, changes) =>
    set((state) => ({
      transitions: state.transitions.map((transition) =>
        transition.id === transitionId ? { ...transition, ...changes } : transition
      )
    })),
  queueTransition: (fromFrameId, toFrameId) =>
    set((state) => {
      const existing = state.transitions.find(
        (transition) =>
          transition.fromFrameId === fromFrameId &&
          transition.toFrameId === toFrameId
      );
      if (existing) {
        return {
          transitions: state.transitions.map((transition) =>
            transition.id === existing.id
              ? {
                  ...transition,
                  status: "queued",
                  prompt: transition.prompt || ""
                }
              : transition
          ),
          selectedTransitionId: existing.id
        };
      }
      const newTransition: Transition = {
        id: crypto.randomUUID(),
        storyId: "local-preview",
        fromFrameId,
        toFrameId,
        prompt: "",
        durationMs: PLACEHOLDER_DURATION,
        status: "queued"
      };
      return {
        transitions: [...state.transitions, newTransition],
        selectedTransitionId: newTransition.id,
        selectedFrameId: null
      };
    }),
  markNeedsRegenerate: (transitionId) =>
    set((state) => ({
      transitions: state.transitions.map((transition) =>
        transition.id === transitionId
          ? { ...transition, status: "needs-regenerate" }
          : transition
      )
    }))
}));

function syncTransitions(frames: Frame[], transitions: Transition[]): Transition[] {
  const realFrames = frames.filter((frame) => !frame.id.startsWith("placeholder-"));
  const mapped: Transition[] = [];
  for (let i = 0; i < realFrames.length - 1; i += 1) {
    const current = realFrames[i];
    const next = realFrames[i + 1];
    const existing = transitions.find(
      (transition) =>
        transition.fromFrameId === current.id && transition.toFrameId === next.id
    );
    mapped.push(
      existing ?? {
        id: crypto.randomUUID(),
        storyId: current.storyId,
        fromFrameId: current.id,
        toFrameId: next.id,
        prompt: "",
        durationMs: PLACEHOLDER_DURATION,
        status: "idle"
      }
    );
  }
  return mapped;
}
