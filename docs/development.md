# MarkPad 开发指南

## 已完成的工作

### ✅ 项目初始化
- [x] 创建项目结构
- [x] 配置 React + TypeScript + Vite
- [x] 配置 Tailwind CSS
- [x] 配置 Tauri 框架
- [x] 安装所有依赖

### ✅ 核心架构
- [x] TypeScript 类型定义（types/index.ts）
- [x] Zustand 状态管理（store/index.ts）
- [x] 工具函数（utils/index.ts）

### ✅ UI 组件
- [x] 三栏布局
- [x] 左侧栏 - 项目树/类型/标签筛选（Sidebar.tsx）
- [x] 中间栏 - 便签列表（NoteList.tsx）
- [x] 右侧栏 - Markdown 编辑器（Editor.tsx）
- [x] 主题切换功能（亮色/暗色）
- [x] 自定义滚动条样式
- [x] Markdown 渲染样式

## 功能特性

### 当前可用功能
1. ✅ **便签管理**
   - 创建新便签
   - 编辑便签（标题、内容）
   - 删除便签
   - 置顶便签
   - 自动保存（500ms 延迟）

2. ✅ **分类组织**
   - 按项目筛选
   - 按类型筛选
   - 按标签筛选（支持多选）
   - 全文搜索

3. ✅ **Markdown 编辑**
   - 实时编辑
   - 预览切换
   - 支持 GFM 语法
   - 字数统计

4. ✅ **界面功能**
   - 三栏响应式布局
   - 亮色/暗色主题切换
   - 便签置顶显示
   - 时间格式化显示

5. ✅ **数据持久化**
   - 自动保存到本地 JSON 文件
   - 启动时自动加载数据
   - 数据位置：AppData/markpad/markpad-data.json

6. ✅ **项目/类型/标签管理**
   - 项目管理对话框（颜色选择）
   - 类型管理对话框（图标选择）
   - 标签管理对话框
   - 增删改操作

7. ✅ **数据管理**
   - 导出数据（JSON）
   - 导入数据（JSON）
   - 备份数据（带时间戳）

### 待实现功能
- [ ] 快捷键支持（Ctrl+N, Ctrl+F, Ctrl+S 等）
- [ ] 便签详情面板（批量编辑项目、类型、标签）
- [ ] 导出单个便签为 Markdown 文件
- [ ] 设置面板（自动保存间隔、主题等）
- [ ] 便签统计（总数、分类统计）
- [ ] 便签归档功能
- [ ] 便签排序选项（按时间、标题等）

## 运行项目

### 前提条件
确保已安装以下环境：
- Node.js 18+
- Rust 1.70+（运行 Tauri 必需）

### 安装 Rust
如果尚未安装 Rust，请访问：https://rustup.rs/

Windows：
```powershell
winget install --id Rustlang.Rustup
```

macOS/Linux：
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 开发模式

#### 方式一：仅运行前端（用于快速开发）
```bash
cd E:\CodingYoo\cp-bio\code\MarkPad
npm run dev
```
在浏览器中打开：http://localhost:1420

#### 方式二：运行 Tauri 应用（完整桌面应用）
```bash
cd E:\CodingYoo\cp-bio\code\MarkPad
npm run tauri:dev
```
第一次运行会编译 Rust 代码，需要 5-10 分钟

### 构建生产版本
```bash
npm run tauri:build
```
构建产物位于：`src-tauri/target/release/bundle/`

## 项目结构

```
MarkPad/
├── docs/                       # 文档
│   ├── requirements.md         # 需求文档
│   └── development.md          # 开发指南（本文件）
├── src/                        # React 源代码
│   ├── components/             # UI 组件
│   │   ├── Sidebar.tsx         # 左侧项目树
│   │   ├── NoteList.tsx        # 中间便签列表
│   │   ├── Editor.tsx          # 右侧编辑器
│   │   └── index.ts            # 组件导出
│   ├── store/                  # 状态管理
│   │   └── index.ts            # Zustand store
│   ├── types/                  # TypeScript 类型
│   │   └── index.ts            # 类型定义
│   ├── utils/                  # 工具函数
│   │   └── index.ts            # 工具函数
│   ├── App.tsx                 # 主应用组件
│   ├── main.tsx                # 入口文件
│   └── index.css               # 全局样式
├── src-tauri/                  # Tauri (Rust) 代码
│   ├── src/
│   │   ├── main.rs             # Rust 主文件
│   │   └── lib.rs              # 库文件
│   ├── icons/                  # 应用图标
│   ├── Cargo.toml              # Rust 依赖
│   └── tauri.conf.json         # Tauri 配置
├── public/                     # 静态资源
├── index.html                  # HTML 模板
├── package.json                # npm 依赖
├── vite.config.ts              # Vite 配置
├── tailwind.config.js          # Tailwind 配置
├── postcss.config.js           # PostCSS 配置
├── tsconfig.json               # TypeScript 配置
└── README.md                   # 项目说明

```

## 技术细节

### 状态管理（Zustand）
所有应用状态都在 `src/store/index.ts` 中管理：
- 便签数据（notes）
- 项目列表（projects）
- 类型列表（types）
- 标签列表（tags）
- 筛选条件（filter）
- 当前选中便签（currentNoteId）
- 设置（settings）

### 组件通信
通过 Zustand store 实现组件间通信，无需 props drilling。

### 自动保存
编辑器使用 useEffect + setTimeout 实现防抖自动保存（500ms）。

### 主题切换
通过 Tailwind 的 `dark:` 变体实现，在根元素添加/移除 `dark` class。

### Markdown 渲染
使用 `react-markdown` + `remark-gfm` 支持 GitHub Flavored Markdown。

## 已完成的新功能（v0.2.0）

### ✅ 数据持久化
- Rust 端实现文件读写命令（save_data, load_data, export_data, import_data）
- React Hook 实现自动保存和加载（useDataPersistence）
- 数据存储位置：`AppData/markpad/markpad-data.json`
- 防抖优化（1秒延迟）

### ✅ 管理对话框
- Modal 通用组件（支持 ESC 关闭）
- ProjectModal：项目管理（增删改 + 8种颜色选择）
- TypeModal：类型管理（增删改 + 5种图标选择）
- TagModal：标签管理（增删改）
- 侧边栏集成快捷按钮

### ✅ 数据管理菜单
- 顶部栏添加数据管理按钮
- 导出功能（选择保存路径）
- 导入功能（选择文件）
- 备份功能（自动添加时间戳）

## 下一步开发建议

### 优先级 1：用户体验优化
1. 添加快捷键支持
   - Ctrl+N: 新建便签
   - Ctrl+F: 聚焦搜索框
   - Ctrl+S: 手动保存（虽然有自动保存）
   - Ctrl+B: 备份数据
2. 便签详情编辑面板
   - 快速修改便签的项目/类型/标签
   - 批量编辑功能

### 优先级 2：功能增强
1. 导出单个便签为 Markdown 文件
2. 便签统计面板
3. 便签归档/回收站
4. 设置面板（自定义主题、自动保存间隔等）

### 优先级 3：高级功能
1. 便签模板
2. 附件支持（图片、文件）
3. 便签分享功能
4. 全局搜索优化（高亮显示）

## 常见问题

### Q: 为什么没有图标？
A: 需要在 `src-tauri/icons/` 目录下添加应用图标。可以使用在线工具生成各种尺寸的图标。

### Q: 如何添加 Tauri 命令？
A: 在 `src-tauri/src/main.rs` 中定义 Rust 函数，用 `#[tauri::command]` 标注，并在 `invoke_handler` 中注册。

### Q: 数据存储在哪里？
A: 数据存储在系统应用数据目录：
- Windows: `C:\Users\<用户名>\AppData\Roaming\markpad\markpad-data.json`
- macOS: `~/Library/Application Support/markpad/markpad-data.json`
- Linux: `~/.local/share/markpad/markpad-data.json`

### Q: 如何调试？
A: 
- 前端：`npm run dev` 后在浏览器开发者工具调试
- Tauri：`npm run tauri:dev` 会自动打开 DevTools（开发模式）

### Q: 数据导入会覆盖现有数据吗？
A: 是的，导入会完全替换当前数据。建议导入前先备份当前数据。

### Q: 如何查看数据文件位置？
A: 可以在 Tauri 命令中调用 `get_data_path` 获取完整路径（未来可在设置中显示）。

## 贡献指南

1. 遵循现有代码风格
2. 组件使用函数式组件 + Hooks
3. 使用 TypeScript 严格模式
4. CSS 使用 Tailwind 工具类
5. 提交前确保无 TypeScript 错误

## License
MIT
