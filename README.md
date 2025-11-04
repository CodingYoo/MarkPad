# MarkPad

一款基于 Tauri + React 开发的桌面端 Markdown 便签应用。

## 功能特性

- 📝 Markdown 编辑与实时预览
- 📂 按项目、类型、标签分类管理
- 🎨 亮色/暗色主题切换
- 💾 数据本地存储（JSON）
- 📤 备份与导出功能
- ⚡ 快捷键支持

## 技术栈

- **后端**: Tauri (Rust)
- **前端**: React + TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **Markdown**: react-markdown + remark-gfm

## 环境要求

### 开发环境
1. **Node.js**: v18+ 
2. **Rust**: 1.70+
3. **npm** 或 **yarn**

### 安装 Rust

#### Windows
访问 https://rustup.rs/ 下载并运行 `rustup-init.exe`

或使用命令：
```powershell
winget install --id Rustlang.Rustup
```

#### macOS / Linux
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

安装完成后重启终端，验证安装：
```bash
rustc --version
cargo --version
```

## 开始开发

### 1. 安装依赖
```bash
npm install
```

### 2. 运行开发服务器
```bash
npm run tauri:dev
```

第一次运行会编译 Rust 代码，需要等待几分钟。

### 3. 构建生产版本
```bash
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/`

## 开发命令

- `npm run dev` - 启动 Vite 开发服务器（仅前端）
- `npm run build` - 构建前端
- `npm run preview` - 预览构建结果
- `npm run tauri:dev` - 启动 Tauri 开发环境
- `npm run tauri:build` - 构建 Tauri 应用

## 项目结构

```
MarkPad/
├── docs/                  # 文档目录
│   └── requirements.md    # 需求文档
├── src/                   # React 源代码
│   ├── components/        # 组件
│   ├── store/            # Zustand 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 入口文件
│   └── index.css         # 全局样式
├── src-tauri/            # Tauri (Rust) 源代码
│   ├── src/
│   │   ├── main.rs       # Rust 主文件
│   │   └── lib.rs        # 库文件
│   ├── icons/            # 应用图标
│   ├── Cargo.toml        # Rust 依赖配置
│   └── tauri.conf.json   # Tauri 配置
├── public/               # 静态资源
├── index.html            # HTML 模板
├── package.json          # npm 依赖配置
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # Tailwind 配置
└── tsconfig.json         # TypeScript 配置
```

## 数据存储

便签数据存储在 `markpad-data.json` 文件中（与可执行文件同级目录）。

数据结构参见 [需求文档](./docs/requirements.md)。

## 待办事项

- [ ] 完成基础三栏布局
- [ ] 实现便签 CRUD 操作
- [ ] 实现项目/类型/标签管理
- [ ] 集成 Markdown 编辑器
- [ ] 实现搜索功能
- [ ] 实现备份/导出功能
- [ ] 添加快捷键支持
- [ ] 主题切换功能

## License

MIT
