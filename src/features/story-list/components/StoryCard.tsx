"use client";

import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Play, Pencil, Download } from "lucide-react";
import { Story } from "@/lib/types/story";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration, formatDateTime } from "@/lib/utils";

type StoryCardProps = {
  story: Story;
};

export function StoryCard({ story }: StoryCardProps) {
  return (
    <div className="group relative flex flex-col gap-4 rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden rounded-3xl bg-neutral-100">
        <Image
          src={story.coverUrl}
          alt={story.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{story.title}</h3>
          <p className="text-xs text-neutral-500">
            {formatDuration(story.totalDurationMs)} · {story.frameCount} 帧
          </p>
        </div>
        <Badge variant={story.status === "ready" ? "success" : "muted"}>
          {story.status}
        </Badge>
      </div>
      <p className="text-sm text-neutral-500">
        {story.description ?? "暂无描述"}
      </p>
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>最近编辑：{formatDateTime(story.updatedAt)}</span>
        <button type="button" className="rounded-full p-2 hover:bg-neutral-100">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="flex gap-2">
        <Button asChild className="flex-1 gap-2">
          <Link href={`/story/${story.id}/edit`}>
            <Pencil className="h-4 w-4" />
            继续编辑
          </Link>
        </Button>
        <Button asChild variant="secondary" className="flex-1 gap-2">
          <Link href={`/share/${story.id}`}>
            <Play className="h-4 w-4 text-primary" />
            预览
          </Link>
        </Button>
        <Button variant="ghost" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
