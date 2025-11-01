"use client";

export function TransitionPlaceholderCard() {
  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-white/60 px-4 py-3 text-sm text-neutral-500">
      <div className="font-medium text-neutral-600">Transition</div>
      <p>添加下一帧后，可在此生成过渡视频。</p>
    </div>
  );
}
