export type FrameAssetType = "image" | "video";

export type Frame = {
  id: string;
  storyId: string;
  order: number;
  asset: {
    type: FrameAssetType;
    url: string;
    thumbnailUrl: string;
  };
  durationMs: number;
  metadata?: Record<string, unknown>;
  status: "ready" | "processing" | "failed";
};

export type TransitionStatus =
  | "idle"
  | "queued"
  | "running"
  | "ready"
  | "failed"
  | "needs-regenerate";

export type Transition = {
  id: string;
  storyId: string;
  fromFrameId: string;
  toFrameId: string;
  prompt: string;
  durationMs: number;
  status: TransitionStatus;
  previewUrl?: string;
  taskId?: string;
};

export type Story = {
  id: string;
  title: string;
  description?: string;
  coverUrl: string;
  totalDurationMs: number;
  frameCount: number;
  status: "draft" | "rendering" | "ready" | "failed";
  updatedAt: string;
};
