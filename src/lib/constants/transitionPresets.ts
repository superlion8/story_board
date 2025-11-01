export type TransitionPreset = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
  category: "basic" | "cinematic" | "creative";
};

export const transitionPresets: TransitionPreset[] = [
  // Basic transitions
  {
    id: "fade",
    name: "淡入淡出",
    description: "平滑的淡入淡出过渡",
    prompt: "smooth fade transition between scenes",
    icon: "⚡",
    category: "basic",
  },
  {
    id: "crossfade",
    name: "交叉溶解",
    description: "两个场景交叉淡化",
    prompt: "crossfade transition with gentle blending",
    icon: "✨",
    category: "basic",
  },
  {
    id: "slide",
    name: "滑动",
    description: "从一侧滑入新场景",
    prompt: "smooth sliding transition from left to right",
    icon: "➡️",
    category: "basic",
  },
  {
    id: "zoom",
    name: "缩放",
    description: "放大或缩小过渡",
    prompt: "zoom in transition with smooth camera movement",
    icon: "🔍",
    category: "basic",
  },

  // Cinematic transitions
  {
    id: "camera-pan",
    name: "摄像机平移",
    description: "电影级摄像机平移",
    prompt: "cinematic camera pan transition, smooth and professional",
    icon: "🎬",
    category: "cinematic",
  },
  {
    id: "whip-pan",
    name: "快速摇镜",
    description: "快速摇镜头过渡",
    prompt: "fast whip pan transition with motion blur",
    icon: "💨",
    category: "cinematic",
  },
  {
    id: "dolly-zoom",
    name: "推拉镜头",
    description: "希区柯克式推拉",
    prompt: "dolly zoom effect transition, hitchcock style",
    icon: "🎥",
    category: "cinematic",
  },
  {
    id: "match-cut",
    name: "匹配剪辑",
    description: "相似元素间的匹配",
    prompt: "match cut transition connecting similar shapes or movements",
    icon: "🎞️",
    category: "cinematic",
  },

  // Creative transitions
  {
    id: "morph",
    name: "变形",
    description: "物体变形过渡",
    prompt: "smooth morphing transition between objects",
    icon: "🌀",
    category: "creative",
  },
  {
    id: "particle",
    name: "粒子效果",
    description: "粒子分散与聚合",
    prompt: "particle dispersion and reconstruction transition",
    icon: "✨",
    category: "creative",
  },
  {
    id: "paint",
    name: "水彩晕染",
    description: "水彩风格过渡",
    prompt: "watercolor paint spreading transition effect",
    icon: "🎨",
    category: "creative",
  },
  {
    id: "glitch",
    name: "故障风格",
    description: "数字故障效果",
    prompt: "digital glitch transition with RGB split",
    icon: "📺",
    category: "creative",
  },
];

export const categoryNames = {
  basic: "基础过渡",
  cinematic: "电影级过渡",
  creative: "创意过渡",
};

