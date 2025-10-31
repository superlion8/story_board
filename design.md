# Story Board — UX & Interaction Design

本设计稿旨在将 `spec.md` 中的技术与页面建议转化为更细化的交互、信息架构与组件说明，为产品、设计与工程协作提供统一蓝图。

---

## 1. 产品目标与设计原则

- **快速创作**：最短路径完成「首帧 → 时间轴 → 过渡生成」的闭环。
- **清晰可视化**：时间轴、帧预览、过渡状态一目了然，降低长内容编辑的复杂度。
- **反馈连续**：任何生成/渲染任务均提供实时状态、可取消/重试的操作。
- **可扩展**：布局、组件、状态管理均支持未来加入多人协作、模板、AI 助手等能力。

品牌关键词沿用 `Cinema • Flow • Clarity • Modular`，配色、排版遵循 `spec.md` 的 Token 与字体约定。

---

## 2. 用户旅程概览

### 2.1 新建故事（Create Flow）

```mermaid
flowchart LR
  A[Landing CTA /create] --> B{首帧来源?}
  B -->|Prompt| C[填写 Prompt & 参数]
  B -->|Upload| D[拖拽或选择图片]
  C --> E[触发生成任务\n状态轮询]
  D --> E
  E -->|成功| F[创建 Story + Frame#0]
  F --> G[/story/:id/edit 主编辑器]
  E -->|失败| H[错误提示 + 重试]
```

### 2.2 扩展故事（Editor Flow）
1. 进入编辑器即在左侧时间轴看到 Frame#0 与自动插入的空白占位（Frame#1 placeholder）。
2. 用户点击任一空白格：
   - 选择上传 / Prompt 生成 → 完成后该占位变为真实帧，并在末尾再插一个新的占位。
3. 相邻真实帧之间出现 Transition 卡片，提示「待配置」。
4. 用户点击 Transition：
   - 填写 Prompt、选择风格、确认时长 → 触发 Kling 任务。
   - 状态变化：`idle → queued → running → ready / failed`。
5. 右侧预览 Tab 可播放单段或全片，预览中未准备的过渡使用两个静态帧过渡。

### 2.3 Story 列表与分享
- `/story` 展示网格卡片：缩略图（Frame#0）、标题、时长、最后编辑时间、渲染状态。
- 卡片 hover 行为：`编辑`、`预览`、`分享` 按钮。
- `/share/:id` 提供仅播放模式：Video Player + 描述信息 + CTA（复制链接/下载）。

---

## 3. 页面级设计说明

### 3.1 `/create`
- **结构**：双列卡片（Prompt / Upload），底部展示近期模板或示例故事。
- **上传流**：
  - 拖拽区域 + 文件列表（支持一次 1 张，完成后即跳转编辑器）。
  - 上传时显示进度条，失败可重试。
- **AI 生成流**：
  - Prompt 输入框 + 可选参数（分辨率、风格 Preset）。
  - 点击生成后进入加载态，展示「预计 10s」等提醒。
- **可访问性**：默认聚焦 Prompt 输入框；键盘 Tab 顺序遵循视觉顺序。

### 3.2 `/story`
- **顶栏**：筛选（全部/草稿/已渲染）、排序（最近更新/时长）、搜索框。
- **故事卡片（Card）**：
  - 封面图（16:9）、标题、副标题（`时长 | 帧数`）、状态 Badge。
  - 底部操作：`继续编辑`、`预览`、`下载`（仅 ready）。
  - 右上角 `···` 菜单：重命名、复制、删除。
- **空状态**：展示「创建故事」 CTA 与三步图文指引。

### 3.3 `/story/:id/edit` 主编辑器

| 区域 | 内容 | 备注 |
|------|------|------|
| 顶部工具条 | Play/Pause、时间线缩放、撤销/重做、保存状态、分辨率切换、`Render Final Video` | 保存状态展示为 `Saving… / Saved • 1m ago` |
| 左侧时间轴 | 帧列表（缩略图 + 时间标签）、Transition 卡片、添加按钮 | 支持拖拽排序；当前选中项高亮并在右侧同步 |
| 右侧面板 Tabs | `Image`（裁剪/替换）、`Transition`（Prompt、风格、参数）、`Preview`（单段/全片）、`Properties`（帧长、Loop、标记） | 默认按选中对象切换 Tab；空状态提示操作 |
| 底部状态栏 | 当前播放指示、任务队列 Badge（显示进行中的生成数量） | 可折叠 |

#### 时间轴交互细则
- 新增帧：点击占位卡 → 弹出 Drawer（上传 / Prompt）；成功后自动选中该帧。
- 拖拽排序：
  - 视觉反馈：拖拽影子 + 目标位置高亮。
  - 逻辑：更新帧顺序后，涉及的 Transition 标记 `needs-regenerate` 并提示用户确认或自动排队。
- 删除帧：
  - 二次确认（提示删除会移除相邻过渡）。
  - 删除后自动补位，在末尾添加新的空白占位。
- Transition 状态展示：
  - `queued` → 黄色 `badge` + 旋转 Icon。
  - `running` → 动态进度条（基于轮询的完成度）。
  - `ready` → 绿色 `badge` + 可播放缩略图。
  - `failed` → 红色 `badge` + 「重试」按钮。

#### 右侧 Tabs 详细
- **Image Tab**：显示当前帧的大图、基础编辑工具（裁剪、比例、滤镜预设、替换按钮）。
- **Transition Tab**：左右两侧展示 Start/End thumbnail，中间为 Prompt 输入与风格选择，下方 `Generate` / `Accept`。
- **Preview Tab**：播放范围选择器（单段 / 自定义区间 / 全片），播放器上方展示渲染状态，底部支持导出低清片段。
- **Properties Tab**：帧停留时间 `Slider`、Loop、标签（例如关键帧、场景），Transition 时长设置。

### 3.4 `/share/:id`
- 全屏播放器 + 顶部标题。
- 右侧信息栏：时长、分辨率、创建者、生成时间、描述（可选）。
- CTA：复制链接、下载高清版、回到编辑器（若拥有权限）。

---

## 4. 关键组件与状态定义

### 4.1 数据模型（前端）

```ts
type Frame = {
  id: string;
  storyId: string;
  order: number;
  asset: {
    type: 'image' | 'video';
    url: string;
    thumbnailUrl: string;
  };
  durationMs: number;
  metadata?: Record<string, unknown>;
  status: 'ready' | 'processing' | 'failed';
};

type Transition = {
  id: string;
  storyId: string;
  fromFrameId: string;
  toFrameId: string;
  prompt: string;
  durationMs: number; // 默认 5000
  status: 'idle' | 'queued' | 'running' | 'ready' | 'failed' | 'needs-regenerate';
  previewUrl?: string;
  taskId?: string;
};
```

Zustand Store 切片建议：
- `timelineSlice`: 帧顺序、选中项、拖拽状态。
- `transitionSlice`: 过渡任务、状态轮询、批量更新。
- `playerSlice`: 播放控制（当前位置、播放速度、分辨率）。
- `uiSlice`: Modal/Drawer/Toast 等。

React Query 负责：
- Story 基础信息（标题、描述、权限）。
- 生成任务轮询：`/api/stories/:id/transitions/:transitionId`.
- 渲染任务状态：`/api/stories/:id/render`.

### 4.2 任务状态与反馈

| 状态 | 展示 | 用户操作 |
|------|------|----------|
| queued | 黄色标签「Queued」+ 预计等待时间 | 支持取消 |
| running | 进度条 + 波纹动画 | 支持中断（调用后端取消任务） |
| ready | 缩略图、播放按钮 | `Accept` 将结果锁定；`Regenerate` 重新排队 |
| failed | 红色提示 + 错误信息 | `Retry`、查看日志 |
| needs-regenerate | 灰色提示「需重算」 | 点击进入 Transition Tab 填写 Prompt |

全局通知使用 Toast + 任务面板（Task Drawer）组合，确保长流程不会被忽略。

---

## 5. 渲染与导出流程

1. 用户点击 `Render Final Video` → 弹出 Modal 确认分辨率、帧率、音轨选项。
2. 触发后端渲染任务，前端将 Story 状态标记为 `rendering`。
3. 轮询任务状态：
   - `queued` → `rendering` → `ready` / `failed`。
4. 完成时推送系统通知，并在 `/story` 列表卡片显示「高清版已就绪」。
5. 失败则提供查看日志与重试入口。

短期实现可采用轮询；后续可接入 Supabase Realtime 推送。

---

## 6. Story 列表信息架构

| 字段 | 来源 | 展示 |
|------|------|------|
| `coverUrl` | Frame#0 thumbnail | 卡片背景 |
| `title` | Story meta | 卡片标题，可就地编辑 |
| `totalDuration` | 后端聚合（帧 + 过渡） | 卡片副标题 |
| `frameCount` | 计算得出 | 卡片副标题 |
| `status` | `draft | rendering | ready | failed` | Badge |
| `updatedAt` | 数据库 | 排序、显示“最后修改” |

空状态 & 权限：
- 若无故事 → 展示创建指引。
- 若为游客 → 引导注册/登录。

---

## 7. 辅助设计素材

- **时间轴缩略图尺寸**：80×45 px（保持 16:9）。
- **占位帧样式**：虚线边框 + `+ Add Frame` 文案。
- **Transition 卡片**：灰底，左侧显示起始帧缩略图叠加，右侧状态 Badge。
- **预览视频占位**：浅灰背景 + 播放按钮 + 状态文案。
- **加载骨架**：使用 Tailwind `animate-pulse`，确保长列表平滑加载。

---

## 8. 内容治理与版本控制

- 每个 Story 保留版本历史（后续扩展）：保存时复制帧与过渡配置。
- 支持草稿自动保存：在本地 IndexedDB 缓存最近编辑状态，断网后恢复。
- 提供 `Activity Log` 预留入口（未来多人协作使用）。

---

## 9. 开发里程碑建议

1. **MVP**：首帧创建 → 时间轴添加帧 → 过渡生成 → 低清预览。
2. **Batch Improvements**：帧排序、批量渲染状态同步、任务面板。
3. **Polish**：高清渲染、分享页、美化动画、辅助素材管理。
4. **Growth**：模板商店、协作、AI 提示模板库。

---

## 10. 当前待确认问题

- Kling 生成延迟：是否需要超时 fallback（例如使用静态 crossfade 代替）。
- 最终视频音频处理：是否支持背景音乐、配音。
- 账号权限：是否允许访客体验 Demo（限制帧数/导出）。
- 模型 Prompt 模板：由产品预设还是允许用户完全自定义。

确认以上问题后可进一步完善交互与 UI 细节。

