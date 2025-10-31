import Link from "next/link";
import { PromptForm } from "@/features/create/components/PromptForm";
import { UploadCard } from "@/features/create/components/UploadCard";

export default function CreatePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold">创建新的 Story</h1>
          <p className="mt-2 text-neutral-600">
            选择一种方式生成首帧，系统将自动为你开启编辑器并创建时间轴。
          </p>
        </div>
        <Link href="/story" className="text-sm text-primary hover:underline">
          返回我的 Story
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <PromptForm />
        <UploadCard />
      </div>
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">流程提示</h2>
        <ol className="mt-4 space-y-3 text-sm text-neutral-600">
          <li>1. 首帧准备就绪后将自动跳转至 `/story/:id/edit`。</li>
          <li>2. 时间轴会自动生成一个空白占位帧，方便继续添加内容。</li>
          <li>3. 相邻帧之间可配置 Prompt 生成过渡视频。</li>
        </ol>
      </section>
    </main>
  );
}
