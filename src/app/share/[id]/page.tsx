import { notFound } from "next/navigation";
import { demoStories } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { formatDuration, formatDateTime } from "@/lib/utils";
import Link from "next/link";

type SharePageProps = {
  params: {
    id: string;
  };
};

export default function SharePage({ params }: SharePageProps) {
  const story = demoStories.find((item) => item.id === params.id);

  if (!story) {
    notFound();
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl gap-8 px-6 py-16 lg:grid-cols-[2fr_1fr]">
      <section className="space-y-6">
        <div className="relative aspect-video overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-900 shadow-lg">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur">
              ▶
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button className="flex-1">播放预览</Button>
          <Button variant="secondary" className="flex-1">
            下载高清版
          </Button>
          <Button variant="ghost">
            <Link href={`/story/${story.id}/edit`}>回到编辑器</Link>
          </Button>
        </div>
      </section>
      <aside className="flex flex-col gap-6 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-semibold">{story.title}</h1>
          <p className="mt-2 text-sm text-neutral-500">{story.description}</p>
        </div>
        <dl className="space-y-3 text-sm text-neutral-600">
          <div className="flex justify-between">
            <dt>总时长</dt>
            <dd>{formatDuration(story.totalDurationMs)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>帧数</dt>
            <dd>{story.frameCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt>状态</dt>
            <dd>{story.status}</dd>
          </div>
          <div className="flex justify-between">
            <dt>更新时间</dt>
            <dd>{formatDateTime(story.updatedAt)}</dd>
          </div>
        </dl>
        <div className="space-y-3 rounded-3xl bg-neutral-50 p-4 text-sm text-neutral-600">
          <p>复制分享链接给同事或客户。</p>
          <Button variant="secondary" className="w-full">
            复制链接
          </Button>
        </div>
      </aside>
    </main>
  );
}
