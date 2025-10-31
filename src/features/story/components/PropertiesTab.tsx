"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEditorStore } from "@/lib/store/editorStore";

export function PropertiesTab() {
  const selectedFrameId = useEditorStore((state) => state.selectedFrameId);
  const selectedTransitionId = useEditorStore((state) => state.selectedTransitionId);
  const frames = useEditorStore((state) => state.frames);
  const transitions = useEditorStore((state) => state.transitions);

  const frame = frames.find((item) => item.id === selectedFrameId);
  const transition = transitions.find((item) => item.id === selectedTransitionId);

  if (frame) {
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">帧属性</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-neutral-600">Frame ID</label>
            <Input readOnly value={frame.id} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-neutral-600">顺序</label>
            <Input readOnly value={frame.order + 1} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-neutral-600">停留时间 (ms)</label>
            <Input type="number" defaultValue={frame.durationMs} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-neutral-600">素材类型</label>
            <Input readOnly value={frame.asset.type} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm text-neutral-600">备注</label>
          <Textarea placeholder="可以记录该帧的剧情笔记、音效需求等。" />
        </div>
      </div>
    );
  }

  if (transition) {
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">过渡属性</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-neutral-600">Transition ID</label>
            <Input readOnly value={transition.id} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-neutral-600">时长 (ms)</label>
            <Input type="number" defaultValue={transition.durationMs} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-neutral-600">状态</label>
            <Input readOnly value={transition.status} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-neutral-600">任务 ID</label>
            <Input readOnly value={transition.taskId ?? "尚未触发"} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm text-neutral-600">备注</label>
          <Textarea placeholder="记录该过渡的艺术意图或修改建议。" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-neutral-500">
      <p>选择帧或过渡以查看属性详情。</p>
    </div>
  );
}
