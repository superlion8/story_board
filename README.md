# Story Board

Story Board 是一个基于 Next.js 15 构建的时间轴式多帧故事编辑工具原型，实现了从创建首帧、时间轴编辑、过渡生成到分享页的核心前端体验。代码根据 `spec.md` 与 `design.md` 的约定落地，采用 App Router、Tailwind、shadcn 风格组件与 Zustand 本地状态管理。

## ✨ 最新优化（v0.2.0）

### 核心体验改进
- 🎯 **拖拽排序**：使用 @dnd-kit 实现时间轴帧的直观拖拽重排
- ⌨️ **键盘快捷键**：支持 ↑↓ 导航、Delete 删除、Esc 取消选择等快捷操作
- ⏳ **实时进度反馈**：过渡生成显示进度条和预估时间
- 🎓 **新手引导**：首次使用时的交互式 6 步引导流程
- ✨ **预设模板**：12 个专业过渡效果预设，一键应用
- 💡 **示例 Prompts**：8 个精选 prompt 示例，降低创作门槛
- 🛡️ **错误边界**：统一的错误处理和友好的错误提示
- 🎴 **增强卡片**：列表卡片支持悬停预览和快速操作菜单

详细优化内容请查看 [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md)

## 功能概览

- `/create`：支持 prompt 生成或上传首帧的入口页面，内置示例 prompts 和参考图上传。
- `/story`：Story 列表视图，包含筛选、搜索、卡片操作等，优化的悬停效果和快速操作。
- `/story/:id/edit`：主编辑器，左侧时间轴（支持拖拽排序）、右侧多 Tab 面板（Image / Transition / Preview / Properties），内置帧增删、排序与过渡状态管理的 Zustand Store。
- `/share/:id`：最终视频播放分享页的结构展示。
- 全局 Providers：React Query、Sonner 通知、错误边界、UI token 方案、示例数据。

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
3. **Kling 过渡**：`TransitionTab` 中补全 API 调用与状态流转，ready 状态后更新 `previewUrl`，在 Preview 面板播放。
4. **渲染导出**：接入 FFmpeg 任务接口，更新 `/share/:id` 的播放源和下载链接。
5. **样式细化**：根据品牌规范补齐动画、深色模式与响应式适配。

## 验证建议

- `npm run lint` / `npm run typecheck`：在依赖安装后可验证语法与类型。
- 手动测试：在 `/story/story-1/edit` 中尝试点击占位帧添加新帧、进入 Transition Tab 填写 prompt，观察状态标签变化。
- 组件快照：建议后续集成 Playwright/Storybook 以验证关键交互与布局。

## ⌨️ 键盘快捷键

在编辑器中使用以下快捷键提高效率：

- `↑` / `↓` - 上下选择帧
- `Delete` / `Backspace` - 删除选中的帧
- `Esc` - 取消选择
- `Ctrl/Cmd + Z` - 撤销（即将推出）
- `Ctrl/Cmd + D` - 复制帧（即将推出）
- `Ctrl/Cmd + A` - 全选（即将推出）

## 已知待补充点

- ✅ ~~拖拽排序~~ - 已完成
- ✅ ~~键盘快捷键~~ - 已完成
- ✅ ~~新手引导~~ - 已完成
- ✅ ~~预设模板~~ - 已完成
- 🔄 上传、生成、渲染均为模拟状态，需接入真实后端。
- 🔄 预览播放器为占位视图，等待 ffmpeg.wasm 或后端渲染结果接入。
- 🔄 批量操作功能（多选、批量删除）待实现。

如需更多上下文，请参考同目录的 `spec.md`、`design.md` 和 `OPTIMIZATION_SUMMARY.md`。
