"use client";

import Link from "next/link";
import { Play, Pause, MonitorSmartphone, Undo2, Redo2, Sparkles, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function EditorHeader() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [resolution, setResolution] = useState<"preview" | "final">("preview");

  return (
    <header className="flex items-center justify-between rounded-3xl border border-neutral-100 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="返回首页">
          <Link href="/">
            <Home className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setIsPlaying((prev) => !prev)}
          aria-label={isPlaying ? "暂停" : "播放"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" aria-label="撤销">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="重做">
          <Redo2 className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-neutral-200" />
        <div className="flex items-center gap-2 rounded-2xl bg-neutral-100 p-1">
          <Button
            variant={resolution === "preview" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setResolution("preview")}
          >
            低清
          </Button>
          <Button
            variant={resolution === "final" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setResolution("final")}
          >
            高清
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <MonitorSmartphone className="h-4 w-4" />
          Saved • 1m ago
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="md" className="gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          任务队列 (2)
        </Button>
        <Button size="md">Render Final Video</Button>
      </div>
    </header>
  );
}
