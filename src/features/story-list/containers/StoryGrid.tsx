"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { useStories } from "@/lib/api/storyClient";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/features/story-list/components/StoryCard";

const filters = [
  { key: "all", label: "全部" },
  { key: "draft", label: "草稿" },
  { key: "rendering", label: "渲染中" },
  { key: "ready", label: "已渲染" }
] as const;

export function StoryGrid() {
  const { data: stories, isLoading } = useStories();
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]["key"]>("all");
  const [query, setQuery] = useState("");

  const filtered = (stories ?? []).filter((story) => {
    const matchFilter = activeFilter === "all" || story.status === activeFilter;
    const matchQuery =
      !query ||
      story.title.toLowerCase().includes(query.toLowerCase()) ||
      story.description?.toLowerCase().includes(query.toLowerCase());
    return matchFilter && matchQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <Badge
              key={filter.key}
              variant={activeFilter === filter.key ? "default" : "muted"}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="搜索标题或描述"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-72 pl-9"
            />
          </div>
          <Button variant="secondary" className="gap-2">
            <Filter className="h-4 w-4 text-primary" />
            高级筛选
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-3xl bg-neutral-200/60"
            />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid gap-6 md:grid-cols-3">
          {filtered.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-neutral-100 bg-white p-12 text-center text-neutral-500 shadow-sm">
      <p className="text-lg font-semibold text-neutral-700">还没有 Story</p>
      <p>创建你的第一个故事，开始帧与过渡的叙事旅程。</p>
      <Button asChild>
        <a href="/create">立即创建</a>
      </Button>
    </div>
  );
}
