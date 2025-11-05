# PDF导出功能 - 技术实现说明

## 实现方案

采用 **Rust后端 + headless_chrome** 方案实现高质量PDF导出。

### 技术优势

✅ **真正的矢量PDF** - 不是图片，文字可选择、可复制
✅ **文件体积小** - 比图片PDF小5-10倍
✅ **完美渲染** - 使用Chrome引擎，100%还原Markdown效果
✅ **支持所有特性** - 表格、代码块、图片、数学公式等
✅ **实时进度显示** - 5个阶段的进度反馈

## 架构设计

```
前端 (TypeScript)
  ↓ 调用 invoke('export_pdf')
Rust后端
  ↓ 1. Markdown → HTML (pulldown-cmark)
  ↓ 2. HTML → 临时文件
  ↓ 3. Headless Chrome加载HTML
  ↓ 4. Chrome Print to PDF API
  ↓ 5. 保存PDF文件
输出 (PDF文件)
```

## 进度阶段

| 阶段 | 进度 | 说明 |
|------|------|------|
| html | 20% | 生成HTML文档 |
| browser | 40% | 启动浏览器引擎 |
| load | 60% | 加载文档内容 |
| pdf | 80% | 生成PDF文件 |
| complete | 100% | 导出完成 |

## 使用方法

1. 在笔记编辑器中点击"更多选项"按钮（三个点）
2. 选择"导出为 PDF"
3. 选择保存位置和文件名
4. 等待进度条完成（通常2-5秒）
5. PDF文件生成完毕

## 技术栈

- **前端**
  - React + TypeScript
  - Tauri API (invoke, event)
  - 自定义进度条组件

- **后端**
  - Rust
  - headless_chrome 1.0.9 - 控制无头Chrome
  - pulldown-cmark 0.11 - Markdown转HTML
  - tauri 2.0 - 应用框架

## PDF配置

- 纸张：A4 (210mm × 297mm)
- 方向：竖向
- 边距：10.16mm (0.4英寸)
- 比例：100%
- 背景：包含背景色和图片
- 页眉页脚：无

## 样式特性

生成的PDF包含完整的样式：
- 中文字体优化（PingFang SC, Microsoft YaHei）
- 代码高亮背景
- 表格边框
- 引用块样式
- 图片边框和圆角
- 响应式布局

## 与旧方案对比

| 特性 | html2canvas + jsPDF | headless_chrome |
|------|---------------------|-----------------|
| 文件类型 | 图片PDF | 矢量PDF |
| 文字可选 | ❌ | ✅ |
| 文件大小 | 大 (5-20MB) | 小 (100-500KB) |
| 清晰度 | 受限 | 完美 |
| 渲染速度 | 慢 | 快 |
| 稳定性 | 一般 | 优秀 |

## 故障排除

### 如果PDF导出失败：

1. **检查Chrome依赖**
   - headless_chrome需要系统上有Chrome或Chromium
   - Windows通常自带，无需额外安装

2. **检查权限**
   - 确保应用有写入目标目录的权限

3. **查看日志**
   - 开发模式下，控制台会显示详细日志

### 常见错误

- `Failed to launch browser` - Chrome启动失败，检查系统是否有Chrome
- `Failed to navigate` - HTML加载失败，检查临时目录权限
- `Failed to write file` - 写入失败，检查目标路径权限

## 未来改进

- [ ] 添加PDF页眉页脚选项
- [ ] 支持自定义页边距
- [ ] 支持横向/纵向选择
- [ ] 支持水印
- [ ] 支持目录生成
- [ ] 支持批量导出

## 开发者备注

修改PDF样式：编辑 `src-tauri/src/main.rs` 中的 `generate_html_template` 函数的 `<style>` 部分。

修改PDF设置：编辑 `export_pdf` 函数中的 `PrintToPdfOptions` 结构体。
