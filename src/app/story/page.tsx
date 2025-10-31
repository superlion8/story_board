import Link from "next/link";
import { StoryGrid } from "@/features/story-list/containers/StoryGrid";

export default function StoryListPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">我的 Story</h1>
          <p className="mt-2 text-neutral-600">
            管理已创建的故事，快速进入编辑或渲染结果。
          </p>
        </div>
        <Link
          href="/create"
          className="rounded-2xl bg-primary px-5 py-3 text-sm text-white shadow hover:shadow-lg"
        >
          新建 Story
        </Link>
      </div>
      <StoryGrid />
    </main>
  );
}
