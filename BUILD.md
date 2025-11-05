# 构建说明

## 本地构建

### Windows
```bash
npm install
npm run tauri:build
```
生成的文件位于：
- MSI安装包：`src-tauri/target/release/bundle/msi/MarkPad_0.1.0_x64_en-US.msi`
- 可执行文件：`src-tauri/target/release/markpad.exe`

### macOS
```bash
npm install
npm run tauri:build
```
生成的文件位于：
- DMG安装包：`src-tauri/target/release/bundle/dmg/MarkPad_0.1.0_*.dmg`
- APP应用：`src-tauri/target/release/bundle/macos/MarkPad.app`

### Linux
```bash
npm install
npm run tauri:build
```
生成的文件位于：
- DEB包：`src-tauri/target/release/bundle/deb/markpad_0.1.0_amd64.deb`
- AppImage：`src-tauri/target/release/bundle/appimage/markpad_0.1.0_amd64.AppImage`

## 全平台自动构建（推荐）

本项目已配置GitHub Actions，可自动构建所有平台的安装包。

### 使用方法

#### 方式1：通过Git标签触发（推荐）
1. 提交代码到GitHub
2. 创建并推送标签：
```bash
git tag v0.1.0
git push origin v0.1.0
```
3. GitHub Actions会自动开始构建
4. 构建完成后，在GitHub的Releases页面下载对应平台的安装包

#### 方式2：手动触发
1. 访问GitHub仓库的Actions标签页
2. 选择"Build and Release"工作流
3. 点击"Run workflow"按钮
4. 等待构建完成，在Artifacts中下载构建文件

### 构建产物

GitHub Actions会自动构建以下平台的安装包：

- **Windows**
  - `MarkPad_0.1.0_x64_en-US.msi` - MSI安装包

- **macOS**
  - `MarkPad_0.1.0_aarch64.dmg` - Apple Silicon (M1/M2/M3)
  - `MarkPad_0.1.0_x64.dmg` - Intel芯片

- **Linux**
  - `markpad_0.1.0_amd64.deb` - Debian/Ubuntu
  - `markpad_0.1.0_amd64.AppImage` - 通用Linux

## 开发模式

```bash
npm install
npm run tauri:dev
```

## 数据存储位置

应用数据存储在安装目录下的 `data` 文件夹：
```
[应用目录]/data/
├── markpad-data.json    # 笔记数据
└── images/              # 图片文件
```

## 系统要求

### Windows
- Windows 10 或更高版本

### macOS
- macOS 10.15 (Catalina) 或更高版本

### Linux
- Ubuntu 20.04 或更高版本
- 其他发行版需要安装对应的依赖

## 故障排除

### Windows打包失败
- 确保已安装Visual Studio Build Tools
- 确保Rust已正确安装

### macOS打包失败
- 需要在macOS系统上构建
- 建议使用GitHub Actions自动构建

### Linux打包失败
- 安装必要的依赖：
```bash
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```
