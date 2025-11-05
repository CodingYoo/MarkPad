# MarkPad

[简体中文](./README.zh-CN.md) | English

A cross-platform desktop Markdown note-taking application built with Tauri + React, supporting Windows, macOS, and Linux.

## Download & Installation

Visit the [Releases](https://github.com/CodingYoo/MarkPad/releases) page to download the installer for your platform:

- **Windows**: `.msi` or `.exe` installer
- **macOS**: `.dmg` installer (supports both Intel and Apple Silicon)
- **Linux**: `.deb`, `.AppImage`, or `.rpm` installer

## Features

- 📝 Markdown editing with live preview
- 📂 Organize by project, type, and tags
- 🎨 Light/dark theme toggle
- 💾 Local persistent data storage
- 📤 Backup and export features (PDF export supported)
- ⚡ Keyboard shortcuts support
- 🔄 Cross-platform support (Windows, macOS, Linux)

## Tech Stack

- **Backend**: Tauri (Rust)
- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Markdown**: react-markdown + remark-gfm

## Requirements

### Development Environment
1. **Node.js**: v18+ 
2. **Rust**: 1.70+
3. **npm** or **yarn**

### Installing Rust

#### Windows
Visit https://rustup.rs/ to download and run `rustup-init.exe`

Or use the command:
```powershell
winget install --id Rustlang.Rustup
```

#### macOS / Linux
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, restart your terminal and verify:
```bash
rustc --version
cargo --version
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run tauri:dev
```

First run will compile Rust code, which may take a few minutes.

### 3. Build Production Version
```bash
npm run tauri:build
```

Build artifacts will be located in `src-tauri/target/release/bundle/`

## Development Commands

- `npm run dev` - Start Vite dev server (frontend only)
- `npm run build` - Build frontend
- `npm run preview` - Preview build results
- `npm run tauri:dev` - Start Tauri development environment
- `npm run tauri:build` - Build Tauri application

## Project Structure

```
MarkPad/
├── docs/                  # Documentation directory
│   └── requirements.md    # Requirements document
├── src/                   # React source code
│   ├── components/        # Components
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Entry file
│   └── index.css         # Global styles
├── src-tauri/            # Tauri (Rust) source code
│   ├── src/
│   │   ├── main.rs       # Rust main file
│   │   └── lib.rs        # Library file
│   ├── icons/            # Application icons
│   ├── Cargo.toml        # Rust dependencies
│   └── tauri.conf.json   # Tauri configuration
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # npm dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## Data Storage

Note data uses a local persistent storage solution:

- **Tauri Environment**: Data is stored in the `markpad-data.json` file in the application data directory
- **Browser Environment**: Uses localStorage as a fallback storage solution
- **Auto-save**: All data changes are automatically persisted

See [Requirements Document](./docs/requirements.md) for data structure details.

## Continuous Integration

The project uses GitHub Actions for automated multi-platform builds:

- ✅ Automatically builds for Windows, macOS (Intel + Apple Silicon), and Linux
- 📦 Automatically creates releases and uploads installers
- 🏷️ Push a tag to trigger automated build and release

View build details: [Actions](https://github.com/CodingYoo/MarkPad/actions)

## Completed Features

- [x] Basic three-column layout
- [x] Note CRUD operations
- [x] Project/type/tag management
- [x] Markdown editor integration
- [x] Search functionality
- [x] Backup/export features (PDF)
- [x] Keyboard shortcuts support
- [x] Theme switching
- [x] Multi-platform automated builds
- [x] Data persistence

## License

MIT
