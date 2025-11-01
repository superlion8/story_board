"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MoreHorizontal,
  Play,
  Pencil,
  Download,
  Copy,
  Trash2,
  Archive,
  Clock,
} from "lucide-react";
import { Story } from "@/lib/types/story";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration, formatDateTime } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type StoryCardProps = {
  story: Story;
};

const statusConfig = {
  draft: { label: "草稿", variant: "muted" as const },
  rendering: { label: "渲染中", variant: "warning" as const },
  ready: { label: "已完成", variant: "success" as const },
  failed: { label: "失败", variant: "error" as const },
};

export function StoryCard({ story }: StoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = () => {
    toast.success("故事已复制");
  };

  const handleArchive = () => {
    toast.success("故事已归档");
  };

  const handleDelete = () => {
    toast.error("删除功能即将推出");
  };

  return (
    <div
      className="group relative flex flex-col gap-4 rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video overflow-hidden rounded-3xl bg-neutral-100">
        <Image
          src={story.coverUrl}
          alt={story.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {/* Hover overlay with quick actions */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 backdrop-blur-sm">
            <Button asChild size="sm" className="gap-2">
              <Link href={`/story/${story.id}/edit`}>
                <Pencil className="h-3 w-3" />
                编辑
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="gap-2">
              <Link href={`/share/${story.id}`}>
                <Play className="h-3 w-3" />
                预览
              </Link>
            </Button>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute right-3 top-3">
          <Badge variant={statusConfig[story.status].variant}>
            {statusConfig[story.status].label}
          </Badge>
        </div>
      </div>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold">{story.title}</h3>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(story.totalDurationMs)}</span>
            <span>·</span>
            <span>{story.frameCount} 帧</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              复制故事
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              导出视频
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4" />
              归档
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-error focus:text-error"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {story.description && (
        <p className="line-clamp-2 text-sm text-neutral-500">
          {story.description}
        </p>
      )}
      
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <span>最近编辑：{formatDateTime(story.updatedAt)}</span>
      </div>
      
      <div className="flex gap-2">
        <Button asChild className="flex-1 gap-2" size="sm">
          <Link href={`/story/${story.id}/edit`}>
            <Pencil className="h-3 w-3" />
            继续编辑
          </Link>
        </Button>
        <Button asChild variant="secondary" className="flex-1 gap-2" size="sm">
          <Link href={`/share/${story.id}`}>
            <Play className="h-3 w-3" />
            预览
          </Link>
        </Button>
      </div>
    </div>
  );
}
