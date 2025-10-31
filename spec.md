# Story Board — Product & Implementation Specification

本文档用于指导前端、后端与渲染服务的开发工作，包括技术选型、系统架构、前端页面结构、交互流程、品牌/UI 设计规范等。

---

## 1. 技术选型

### 前端
- **Framework:** Next.js 15 (App Router)
- **UI:** Tailwind CSS + shadcn/ui + Framer Motion（可选动画）
- **State Management:** Zustand（本地编辑状态） + React Query（服务端异步与轮询）
- **File Upload:** Uppy / tus（断点续传）
- **Image Editing:** Canvas / WebGL（裁剪、缩放、滤镜等基础编辑）
- **Video Preview:** ffmpeg.wasm + Media Source Extensions / WebCodecs（用于快速拼接低清预览）
- **Deployment:** Vercel

### 后端 & 存储
- **Platform:** Supabase
  - Auth：邮箱/第三方登录
  - Postgres + Row Level Security
  - Storage：对象存储（图像、缩略图、视频资源）
- **API:** Supabase Edge Functions（Deno）
- **Task Queue / Worker:** Inngest 或 QStash + Vercel Cron（长任务调度和生成任务）
- **Video Rendering:** FFmpeg（运行在 Worker 或独立渲染容器）
- **CDN:** Supabase Storage CDN + Vercel Edge Cache

### 模型与生成
- **Transition Video:** Kling API  
  输入：start_frame、end_frame、prompt、duration（默认 5s）

### Observability
- **Error Tracking:** Sentry
- **Logging:** Logflare / Better Stack

---

## 2. 系统架构 & 流程说明

### 结构概览
Client (Next.js)  
↓  
Edge Functions (API)  
↓  
Task Queue / Worker  
↓  
Kling API / FFmpeg Rendering  
↓  
Supabase Storage + CDN  
↓  
前端读取与播放  

### 核心编辑流程
1. 用户上传或生成第一张图 → 创建 Story 与初始 Frame。
2. 时间轴自动插入下一个空白 Frame（默认占位 5s）。
3. 用户点击空白 Frame 上传或生成下一帧。
4. 相邻帧之间可设置 Transition Prompt → 触发 Kling 生成过渡视频。
5. Worker 调用 Kling → 低清过渡视频回存 Storage → 前端可预览。
6. 用户可持续扩展帧，时间轴自动增长。
7. 用户点击 “Render Final Video” → 触发服务器端 FFmpeg 高清合成。
8. 渲染完成 → 输出最终视频 URL → 可下载 / 分享。

### 渲染级别
| 类型 | 目的 | 清晰度 | 延迟 | 用于 |
|----|------|------|------|------|
| 预览渲染 | 快速反馈 | 480p | 快 | 编辑过程中 |
| 最终渲染 | 发布 & 下载 | 1080p / 4K | 慢 | 导出/分享 |

---

## 3. 前端页面设计规范

### 路由结构
```
/                      – 落地页
/create                – 上传或生成首图进入创建流程
/story                 – Story 列表
/story/:id/edit        – 主编辑器
/share/:id             – 最终视频公开播放页
```

### 页面描述

#### `/create`
- 两种入口：
  - Prompt to Generate an Image
  - Upload an Image
- 成功后跳转 `/story/:id/edit`

#### `/story`
- 卡片展示用户内容
- 显示：封面、标题、时长、编辑时间、状态

#### `/story/:id/edit` 主编辑器

布局：

左侧：时间轴  
右侧：编辑 & 预览面板  

```
 ---------------------------------------------------------
| Timeline (左侧)     |   Editor / Preview Panel (右侧)   |
 ---------------------------------------------------------
```

**时间轴：**
- 显示 Frame（缩略图 + 停留时长）
- Transition 显示状态（queued / running / ready / failed）
- 交互动作：
  - 点击空白帧 → 添加新帧
  - 拖拽帧排序（自动更新相邻 Transition）
  - 删除帧会导致相邻 Transition 需重算

**右侧编辑面板 Tabs：**
| Tab | 功能 |
|----|------|
| Image | 裁剪/替换/参数调整 |
| Transition | 输入 Prompt、选择预设风格、设置时长 |
| Preview | 单段或全片预览 |
| Properties | 帧停留时间、过渡参数 |

**顶部工具条：**
- 播放/暂停
- 分辨率切换（低清 / 高清）
- 撤销 / 重做
- 保存状态展示
- Render Final Video 按钮

---

## 4. 品牌与视觉设计规范

### 品牌关键词
Cinema • Flow • Clarity • Modular

### 色彩体系（Tailwind Tokens）
| Token | Value | 描述 |
|------|-------|------|
| `--primary` | `#6B8CFF` | 主操作色 |
| `--bg-light` | `#F7F8FB` | 浅色背景 |
| `--bg-dark` | `#0F1424` | 暗色背景 |
| `--fg` | `#0B0F1A` | 文本主色 |
| `--success` | `#22C55E` | 成功状态 |
| `--warning` | `#F59E0B` | 排队/等待 |
| `--error` | `#EF4444` | 错误状态 |

### 字体
- UI / 正文：Inter / SF Pro
- 等宽：JetBrains Mono（用于标注时间/调试/属性值）

### 组件样式规范
- Button：default / secondary / ghost / destructive（均含 loading 态）
- Badge：用于 Transition 状态提示
- Popover / Dialog：用于编辑器属性面板
- Slider：用于调整时长

### 布局栅格
- 基础间距：8px
- 圆角：`rounded-2xl`
- 阴影：`shadow-lg`（hover 时增强）

---

## 5. 主编辑器交互逻辑

- 添加新帧后**自动**追加一个空白占位帧。
- 调整帧顺序 → 相关过渡标记为“需重算”。
- 生成状态变化：
  - queued → running → ready / failed
- 预览策略：
  - Transition 未准备 → 使用静态帧占位
  - 已准备 → 使用低清预览视频回放
- 最终渲染：
  - 由后台 FFmpeg 进行高清输出
  - 渲染完成 → 提示下载 / 分享链接（`/share/:id`）

---
