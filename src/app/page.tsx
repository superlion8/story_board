import Link from "next/link";

const heroFeatures = [
  "AI 生成帧与过渡",
  "可视化时间轴编辑",
  "低清预览与高清导出",
  "云端素材管理与分享"
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-20">
      <section className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl font-semibold leading-tight">
            Story Board
          </h1>
          <p className="text-lg text-neutral-700">
            通过图像与 Kling 过渡视频快速拼接长内容，掌控每一帧的叙事节奏。
          </p>
          <div className="flex gap-4">
            <Link
              href="/create"
              className="rounded-2xl bg-primary px-6 py-3 text-white shadow-lg transition hover:shadow-xl"
            >
              开始创作
            </Link>
            <Link
              href="/story"
              className="rounded-2xl border border-primary px-6 py-3 text-primary transition hover:bg-primary/10"
            >
              浏览我的 Story
            </Link>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-medium">核心能力</h2>
          <ul className="space-y-3 text-neutral-700">
            {heroFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 rounded-2xl bg-bg-light/60 px-4 py-3"
              >
                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="rounded-3xl bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-semibold">工作流预览</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-4">
          {[
            "上传或生成首帧",
            "扩展时间轴帧序列",
            "为帧间配置 AI 过渡",
            "渲染高清成片并分享"
          ].map((step, index) => (
            <li key={step} className="rounded-2xl border bg-bg-light/80 p-4">
              <span className="text-sm text-neutral-500">
                Step {index + 1}
              </span>
              <p className="mt-2 font-medium">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
