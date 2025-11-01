export type PromptExample = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: "landscape" | "portrait" | "abstract" | "scene";
  thumbnail?: string;
};

export const promptExamples: PromptExample[] = [
  {
    id: "cyberpunk-city",
    title: "赛博朋克城市",
    description: "霓虹灯闪烁的未来都市夜景",
    prompt:
      "A stunning cyberpunk cityscape at night, neon lights reflecting on wet streets, flying vehicles in the distance, towering skyscrapers with holographic advertisements, cinematic composition, 4K quality",
    category: "scene",
  },
  {
    id: "mountain-sunrise",
    title: "山峰日出",
    description: "壮丽的高山日出景观",
    prompt:
      "Majestic mountain peak at sunrise, golden hour lighting, dramatic clouds, snow-capped summit, cinematic landscape photography, epic scale",
    category: "landscape",
  },
  {
    id: "fantasy-forest",
    title: "奇幻森林",
    description: "魔法般的神秘森林",
    prompt:
      "Enchanted forest with bioluminescent plants, magical particles floating in the air, ancient trees with glowing runes, mystical atmosphere, fantasy art style",
    category: "scene",
  },
  {
    id: "space-station",
    title: "太空站",
    description: "未来科技的太空站",
    prompt:
      "Advanced space station orbiting Earth, detailed sci-fi architecture, solar panels gleaming in sunlight, planet visible in background, photorealistic rendering",
    category: "scene",
  },
  {
    id: "ocean-sunset",
    title: "海洋日落",
    description: "宁静的海滨黄昏",
    prompt:
      "Peaceful ocean sunset, warm golden light, gentle waves, silhouette of palm trees, tropical paradise, serene atmosphere",
    category: "landscape",
  },
  {
    id: "ancient-temple",
    title: "古代神庙",
    description: "神秘的古文明遗迹",
    prompt:
      "Ancient temple ruins in the jungle, overgrown with vines, dramatic lighting through trees, atmospheric fog, archaeological discovery, cinematic composition",
    category: "scene",
  },
  {
    id: "abstract-art",
    title: "抽象艺术",
    description: "流动的色彩与形状",
    prompt:
      "Abstract fluid art, flowing colors blending together, vibrant gradients of purple, blue, and pink, smooth curves, modern digital art",
    category: "abstract",
  },
  {
    id: "anime-character",
    title: "动漫人物",
    description: "精美的动漫风格角色",
    prompt:
      "Anime style character portrait, detailed eyes, flowing hair, vibrant colors, soft lighting, professional digital illustration",
    category: "portrait",
  },
];

export const categoryNames = {
  landscape: "风景",
  portrait: "人物",
  abstract: "抽象",
  scene: "场景",
};

