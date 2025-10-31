"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEditorStore } from "@/lib/store/editorStore";

export function ImageTab() {
  const selectedFrameId = useEditorStore((state) => state.selectedFrameId);
  const frame = useEditorStore((state) =>
    state.frames.find((item) => item.id === selectedFrameId)
  );
  const addFrame = useEditorStore((state) => state.addFrame);

  if (!frame) {
    return (
      <div className="space-y-4 text-center text-neutral-500">
        <p>请选择一帧以进行编辑。</p>
      </div>
    );
  }

  if (frame.id.startsWith("placeholder-")) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-neutral-500">
        <p>这是一个空白占位帧，上传或生成一张图像即可继续。</p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              addFrame({
                assetUrl: "/demo/frame-2.svg",
                thumbnailUrl: "/demo/frame-2-thumb.svg"
              })
            }
          >
            上传图片
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              addFrame({
                assetUrl: "/demo/frame-1.svg",
                thumbnailUrl: "/demo/frame-1-thumb.svg"
              })
            }
          >
            AI 生成
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
      <div className="flex flex-col gap-4">
        <div className="relative aspect-video overflow-hidden rounded-3xl bg-neutral-100">
          {frame.asset.url ? (
            <Image
              src={frame.asset.url}
              alt={`Frame ${frame.order}`}
              fill
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="flex gap-3">
          <Button className="flex-1">替换图片</Button>
          <Button variant="secondary" className="flex-1">
            基础编辑
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-600">
            Prompt 注释
          </label>
          <Textarea placeholder="记录该帧的生成提示词，方便下次复用。" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-600">
              停留时长 (秒)
            </label>
            <Input type="number" defaultValue={frame.durationMs / 1000} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-600">
              标签
            </label>
            <Input placeholder="如：开场、场景转换" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary">保存修改</Button>
        </div>
      </div>
    </div>
  );
}
