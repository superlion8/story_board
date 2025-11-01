"use client";

import { useEffect, useCallback } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { toast } from "sonner";

export function useKeyboardShortcuts() {
  const selectedFrameId = useEditorStore((state) => state.selectedFrameId);
  const frames = useEditorStore((state) => state.frames);
  const removeFrame = useEditorStore((state) => state.removeFrame);
  const selectFrame = useEditorStore((state) => state.selectFrame);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const realFrames = frames.filter(
        (frame) => !frame.id.startsWith("placeholder-")
      );
      const currentIndex = realFrames.findIndex(
        (frame) => frame.id === selectedFrameId
      );

      switch (event.key) {
        case "Delete":
        case "Backspace":
          if (selectedFrameId && !selectedFrameId.startsWith("placeholder-")) {
            event.preventDefault();
            removeFrame(selectedFrameId);
            toast.success("帧已删除");
          }
          break;

        case "ArrowUp":
          event.preventDefault();
          if (currentIndex > 0) {
            selectFrame(realFrames[currentIndex - 1].id);
          }
          break;

        case "ArrowDown":
          event.preventDefault();
          if (currentIndex < realFrames.length - 1) {
            selectFrame(realFrames[currentIndex + 1].id);
          }
          break;

        case "Escape":
          event.preventDefault();
          selectFrame(null);
          break;

        default:
          break;
      }

      // Handle Ctrl/Cmd shortcuts
      if (event.metaKey || event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case "z":
            if (event.shiftKey) {
              event.preventDefault();
              toast.info("重做功能即将推出");
            } else {
              event.preventDefault();
              toast.info("撤销功能即将推出");
            }
            break;

          case "d":
            event.preventDefault();
            toast.info("复制功能即将推出");
            break;

          case "a":
            event.preventDefault();
            toast.info("全选功能即将推出");
            break;

          default:
            break;
        }
      }
    },
    [selectedFrameId, frames, removeFrame, selectFrame]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}

