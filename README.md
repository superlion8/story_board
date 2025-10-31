# Story Board

Story Board 是一个基于 Next.js 15 构建的时间轴式多帧故事编辑工具原型，实现了从创建首帧、时间轴编辑、过渡生成到分享页的核心前端体验。代码根据 `spec.md` 与 `design.md` 的约定落地，采用 App Router、Tailwind、shadcn 风格组件与 Zustand 本地状态管理。

## 功能概览

- `/create`：支持 prompt 生成或上传首帧的入口页面，模拟任务提交与断点上传逻辑。
- `/story`：Story 列表视图，包含筛选、搜索、卡片操作等。
- `/story/:id/edit`：主编辑器，左侧时间轴、右侧多 Tab 面板（Image / Transition / Preview / Properties），内置帧增删、排序与过渡状态管理的 Zustand Store。
- `/share/:id`：最终视频播放分享页的结构展示。
- 全局 Providers：React Query、Sonner 通知、UI token 方案、示例数据。

所有数据目前使用 `src/lib/mock-data.ts` 中的静态样例，方便后续对接 Supabase API 与 Kling 任务队列。

## 本地开发

```bash
npm install
npm run dev
```

项目默认监听 `http://localhost:3000`。若需要使用 `pnpm` 或 `yarn`，请将脚本命令替换为对应工具。

### 环境变量

以下变量需在本地 `.env.local` 或 Vercel Project Settings 中配置：

- `GEMINI_API_KEY`：Google Gemini API key，用于调用 `gemini-2.5-flash` 生成首帧图像。
- `KLING_ACCESS_KEY`：Kling 平台 Access Key，用于 JWT 鉴权。
- `KLING_SECRET_KEY`：Kling 平台 Secret Key，与 Access Key 一起签名 JWT。
- `KLING_API_BASE`（可选）：覆盖默认 `https://api-singapore.klingai.com` 的 API 域名。

### 代码结构

| 目录 | 说明 |
| ---- | ---- |
| `src/app` | Next.js App Router 路由与布局 |
| `src/components/ui` | 公共 UI 组件（Button、Tabs、Card、Badge 等） |
| `src/features` | 按业务切分的复合组件（Create、Story List、Timeline、Story Editor、Share） |
| `src/lib` | 类型定义、mock 数据、工具方法、Zustand Store |
| `public/demo` | 演示用的帧缩略图占位图 |

## 后续接入建议

1. **数据接入**：将 `demoStories` 替换为 Supabase 数据；在 `storyClient` 中使用 React Query 调用真实 API，并添加乐观更新。
2. **上传与生成**：整合 Uppy/tus 处理首帧上传，`PromptForm` 触达后端生成队列，通过轮询/Realtime 更新状态。
3. **Kling 过渡**：`TransitionTab` 中补全 API 调用与状态流转，ready 状态后更新 `previewUrl`，在 `PreviewTab` 播放。
4. **渲染导出**：接入 FFmpeg 任务接口，更新 `/share/:id` 的播放源和下载链接。
5. **样式细化**：根据品牌规范补齐动画、深色模式与响应式适配。

## 验证建议

- `npm run lint` / `npm run typecheck`：在依赖安装后可验证语法与类型。
- 手动测试：在 `/story/story-1/edit` 中尝试点击占位帧添加新帧、进入 Transition Tab 填写 prompt，观察状态标签变化。
- 组件快照：建议后续集成 Playwright/Storybook 以验证关键交互与布局。

## 已知待补充点

- 上传、生成、渲染均为模拟状态，需接入真实后端。
- 未实现拖拽排序，当前使用左右按钮调整顺序。
- 预览播放器为占位视图，等待 ffmpeg.wasm 或后端渲染结果接入。

如需更多上下文，请参考同目录的 `spec.md` 与 `design.md`。
