# MarkPad - 便签应用需求文档

## 项目概述
MarkPad 是一款基于 Tauri + React 开发的桌面端便签应用，支持 Markdown 编辑，可按项目、类型、标签进行分类管理，适用于日常工作记录和知识管理。

## 技术栈

### 后端
- **Tauri**: 轻量级桌面应用框架
- **Rust**: 系统级编程语言

### 前端
- **React 18+**: UI 框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **Zustand**: 状态管理
- **react-markdown**: Markdown 渲染
- **remark-gfm**: GitHub Flavored Markdown 支持
- **lucide-react**: 图标库

## 核心功能

### 1. 便签管理
- **创建便签**: 支持快速创建新便签
- **编辑便签**: Markdown 实时编辑与预览
- **删除便签**: 支持单个/批量删除
- **搜索便签**: 全文搜索，支持标题和内容
- **置顶功能**: 重要便签可置顶显示

### 2. 分类组织
- **项目维度**: 按工作项目分类（如：项目A、项目B）
- **类型维度**: 按便签类型分类（如：待办、笔记、想法、会议记录）
- **标签系统**: 支持多标签，灵活标注（如：#紧急、#前端、#bug）

### 3. 界面布局（三栏式）
```
┌─────────────┬──────────────┬─────────────────┐
│             │              │                 │
│  左侧栏      │  中间栏       │   右侧栏        │
│  项目树      │  便签列表     │   编辑器        │
│  ├ 项目A    │  ┌─────┐     │   ┌─────────┐  │
│  ├ 项目B    │  │便签1 │     │   │Markdown │  │
│  └ 类型/标签 │  ├─────┤     │   │编辑区域  │  │
│             │  │便签2 │     │   │         │  │
│             │  └─────┘     │   └─────────┘  │
└─────────────┴──────────────┴─────────────────┘
```

#### 左侧栏 - 项目树
- 项目列表（可折叠）
- 类型筛选
- 标签云
- 快捷筛选按钮

#### 中间栏 - 便签列表
- 显示当前筛选条件下的便签
- 每个便签卡片显示：标题、创建时间、标签、置顶状态
- 支持排序：按时间、按标题
- 置顶便签优先显示

#### 右侧栏 - Markdown 编辑器
- 上下分栏：编辑区 + 预览区
- 实时渲染 Markdown
- 支持 GFM 语法（表格、任务列表等）
- 显示字数统计

### 4. 数据管理
- **存储方式**: JSON 文件（与项目同级目录）
- **备份功能**: 一键备份当前数据
- **导出功能**: 
  - 导出所有便签为 JSON
  - 导出单个便签为 Markdown 文件
- **导入功能**: 支持从备份文件恢复

### 5. 附加功能
- **主题切换**: 亮色/暗色主题
- **快捷键支持**:
  - `Ctrl+N`: 新建便签
  - `Ctrl+F`: 搜索
  - `Ctrl+S`: 保存
  - `Ctrl+B`: 备份数据
- **时间戳**: 自动记录创建/更新时间
- **自动保存**: 编辑时自动保存

## 数据结构设计

### 数据文件: `markpad-data.json`

```json
{
  "projects": [
    {
      "id": "string (uuid)",
      "name": "string",
      "color": "string (hex color)",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "types": [
    {
      "id": "string (uuid)",
      "name": "string",
      "icon": "string (lucide icon name)",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "tags": [
    {
      "id": "string (uuid)",
      "name": "string",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "notes": [
    {
      "id": "string (uuid)",
      "title": "string",
      "content": "string (markdown)",
      "projectId": "string | null",
      "typeId": "string | null",
      "tagIds": ["string"],
      "isPinned": "boolean",
      "createdAt": "string (ISO 8601)",
      "updatedAt": "string (ISO 8601)"
    }
  ],
  "settings": {
    "theme": "light | dark",
    "autoSave": "boolean",
    "autoSaveInterval": "number (ms)"
  }
}
```

## 开发计划

### Phase 1: 项目初始化
- [x] 确定技术方案
- [x] 创建项目文件夹
- [x] 编写需求文档
- [ ] 初始化 Tauri + React 项目
- [ ] 配置 TypeScript + Tailwind CSS

### Phase 2: 基础功能
- [ ] 实现数据存储层（JSON 读写）
- [ ] 实现三栏布局
- [ ] 实现便签 CRUD 操作
- [ ] 实现项目/类型/标签管理

### Phase 3: 编辑器
- [ ] 集成 react-markdown
- [ ] 实现编辑/预览功能
- [ ] 支持 GFM 语法
- [ ] 添加工具栏

### Phase 4: 高级功能
- [ ] 搜索功能
- [ ] 备份/导出/导入
- [ ] 快捷键支持
- [ ] 主题切换

### Phase 5: 优化与发布
- [ ] 性能优化
- [ ] 打包测试
- [ ] 用户文档
- [ ] 发布安装包

## 非功能需求

### 性能要求
- 启动时间 < 2s
- 便签列表滚动流畅 (60fps)
- 搜索响应时间 < 500ms

### 兼容性
- Windows 10+
- macOS 10.15+
- Linux (主流发行版)

### 安全性
- 数据本地存储，不联网
- 定期自动备份

## 未来扩展
- 云同步功能
- 便签分享
- 插件系统
- 移动端适配
- 附件管理（图片、文件）
- 便签模板
- 统计面板（使用情况分析）
