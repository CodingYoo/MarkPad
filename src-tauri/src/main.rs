// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
use base64::{Engine as _, engine::general_purpose};
use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri::Emitter;
use headless_chrome::{Browser, LaunchOptions};
use headless_chrome::types::PrintToPdfOptions;
use pulldown_cmark::{Parser, Options, html};

#[derive(Serialize, Deserialize)]
struct ImageInfo {
    filename: String,
    path: String,
    size: u64,
    created_at: u64,
}

// 获取应用数据目录（安装目录下的data文件夹）
fn get_app_data_dir(_app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    // 获取应用可执行文件所在目录
    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    let app_dir = exe_path
        .parent()
        .ok_or("Failed to get app directory")?
        .to_path_buf();
    
    // 在应用目录下创建data文件夹
    let data_dir = app_dir.join("data");
    fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    
    Ok(data_dir)
}

#[tauri::command]
fn get_data_path(app_handle: tauri::AppHandle) -> Result<String, String> {
    let data_dir = get_app_data_dir(&app_handle)?;
    let data_file = data_dir.join("markpad-data.json");
    Ok(data_file.to_string_lossy().to_string())
}

#[tauri::command]
fn save_data(app_handle: tauri::AppHandle, data: String) -> Result<(), String> {
    let data_dir = get_app_data_dir(&app_handle)?;
    let data_file = data_dir.join("markpad-data.json");
    fs::write(data_file, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_data(app_handle: tauri::AppHandle) -> Result<String, String> {
    let data_dir = get_app_data_dir(&app_handle)?;
    let data_file = data_dir.join("markpad-data.json");
    
    if !data_file.exists() {
        return Ok(String::new());
    }
    
    fs::read_to_string(data_file).map_err(|e| e.to_string())
}

#[tauri::command]
fn export_data(data: String, path: String) -> Result<(), String> {
    let export_path = PathBuf::from(path);
    fs::write(export_path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn import_data(path: String) -> Result<String, String> {
    let import_path = PathBuf::from(path);
    fs::read_to_string(import_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_image(app_handle: tauri::AppHandle, image_data: String, extension: String) -> Result<String, String> {
    let data_dir = get_app_data_dir(&app_handle)?;
    let images_dir = data_dir.join("images");
    fs::create_dir_all(&images_dir).map_err(|e| e.to_string())?;
    
    // Generate unique filename
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis();
    let filename = format!("{}.{}", timestamp, extension);
    let file_path = images_dir.join(&filename);
    
    // Decode base64 and save
    let base64_data = if image_data.contains("base64,") {
        image_data.split("base64,").nth(1).unwrap_or(&image_data)
    } else {
        &image_data
    };
    
    let image_bytes = general_purpose::STANDARD
        .decode(base64_data)
        .map_err(|e| e.to_string())?;
    
    fs::write(&file_path, image_bytes).map_err(|e| e.to_string())?;
    
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn get_images(app_handle: tauri::AppHandle) -> Result<Vec<ImageInfo>, String> {
    let data_dir = get_app_data_dir(&app_handle)?;
    let images_dir = data_dir.join("images");
    
    if !images_dir.exists() {
        return Ok(Vec::new());
    }
    
    let mut images = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&images_dir) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    let filename = entry.file_name().to_string_lossy().to_string();
                    let path = entry.path().to_string_lossy().to_string();
                    
                    // Extract timestamp from filename (format: timestamp.ext)
                    let timestamp = filename.split('.').next()
                        .and_then(|s| s.parse::<u64>().ok())
                        .unwrap_or(0);
                    
                    images.push(ImageInfo {
                        filename,
                        path,
                        size: metadata.len(),
                        created_at: timestamp,
                    });
                }
            }
        }
    }
    
    // Sort by timestamp, newest first
    images.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    
    Ok(images)
}

#[tauri::command]
fn delete_image(path: String) -> Result<(), String> {
    let image_path = PathBuf::from(path);
    fs::remove_file(image_path).map_err(|e| e.to_string())?;
    Ok(())
}

// 将Markdown转换为HTML
fn markdown_to_html(markdown: &str) -> String {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_FOOTNOTES);
    
    let parser = Parser::new_ext(markdown, options);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    html_output
}

// 生成完整的HTML文档
fn generate_html_template(title: &str, content: &str) -> String {
    let content_html = markdown_to_html(content);
    
    format!(r#"<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        @page {{
            size: A4;
            margin: 20mm;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
        }}
        
        h1 {{
            font-size: 28px;
            font-weight: 600;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-top: 0;
            margin-bottom: 20px;
        }}
        
        h2 {{
            font-size: 24px;
            font-weight: 600;
            margin-top: 32px;
            margin-bottom: 16px;
        }}
        
        h3 {{
            font-size: 20px;
            font-weight: 600;
            margin-top: 24px;
            margin-bottom: 12px;
        }}
        
        h4 {{
            font-size: 18px;
            font-weight: 600;
            margin-top: 20px;
            margin-bottom: 10px;
        }}
        
        p {{
            margin-bottom: 16px;
        }}
        
        a {{
            color: #0066cc;
            text-decoration: none;
        }}
        
        a:hover {{
            text-decoration: underline;
        }}
        
        code {{
            background-color: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }}
        
        pre {{
            background-color: #f3f4f6;
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 16px 0;
        }}
        
        pre code {{
            background: none;
            padding: 0;
        }}
        
        blockquote {{
            border-left: 4px solid #ddd;
            padding-left: 16px;
            margin: 16px 0;
            color: #666;
        }}
        
        ul, ol {{
            margin: 16px 0;
            padding-left: 32px;
        }}
        
        li {{
            margin: 8px 0;
        }}
        
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
            border: 1px solid #e5e7eb;
        }}
        
        th {{
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }}
        
        td {{
            border: 1px solid #e5e7eb;
            padding: 12px;
        }}
        
        img {{
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            display: block;
            margin: 16px 0;
        }}
        
        hr {{
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 32px 0;
        }}
        
        /* 任务列表样式 */
        input[type="checkbox"] {{
            margin-right: 8px;
        }}
        
        /* 删除线 */
        del {{
            color: #999;
        }}
        
        /* 打印优化 */
        @media print {{
            body {{
                padding: 0;
            }}
            
            a {{
                color: inherit;
                text-decoration: none;
            }}
        }}
    </style>
</head>
<body>
    <h1>{title}</h1>
    <div class="content">
        {content_html}
    </div>
</body>
</html>"#,
        title = title,
        content_html = content_html
    )
}

#[tauri::command]
async fn export_pdf(
    app_handle: tauri::AppHandle,
    window: tauri::Window,
    title: String,
    content: String,
    output_path: String,
) -> Result<(), String> {
    // 发送进度：开始生成HTML
    window.emit("pdf-export-progress", serde_json::json!({
        "stage": "html",
        "message": "生成HTML文档...",
        "progress": 20
    })).map_err(|e| e.to_string())?;
    
    let html_content = generate_html_template(&title, &content);
    
    // 创建临时HTML文件
    let data_dir = get_app_data_dir(&app_handle)?;
    let temp_html_path = data_dir.join("temp_export.html");
    fs::write(&temp_html_path, html_content).map_err(|e| e.to_string())?;
    
    // 发送进度：启动浏览器
    window.emit("pdf-export-progress", serde_json::json!({
        "stage": "browser",
        "message": "启动浏览器引擎...",
        "progress": 40
    })).map_err(|e| e.to_string())?;
    
    // 启动headless Chrome
    let browser = Browser::new(LaunchOptions {
        headless: true,
        ..Default::default()
    }).map_err(|e| format!("Failed to launch browser: {}", e))?;
    
    let tab = browser.new_tab().map_err(|e| e.to_string())?;
    
    // 发送进度：加载文档
    window.emit("pdf-export-progress", serde_json::json!({
        "stage": "load",
        "message": "加载文档内容...",
        "progress": 60
    })).map_err(|e| e.to_string())?;
    
    // 加载HTML文件
    let url = format!("file://{}", temp_html_path.to_string_lossy());
    tab.navigate_to(&url).map_err(|e| e.to_string())?;
    tab.wait_until_navigated().map_err(|e| e.to_string())?;
    
    // 等待页面完全加载
    std::thread::sleep(std::time::Duration::from_millis(500));
    
    // 发送进度：生成PDF
    window.emit("pdf-export-progress", serde_json::json!({
        "stage": "pdf",
        "message": "生成PDF文件...",
        "progress": 80
    })).map_err(|e| e.to_string())?;
    
    // 打印为PDF
    let pdf_data = tab.print_to_pdf(Some(PrintToPdfOptions {
        landscape: Some(false),
        display_header_footer: Some(false),
        print_background: Some(true),
        scale: Some(1.0),
        paper_width: Some(8.27),  // A4 width in inches
        paper_height: Some(11.69), // A4 height in inches
        margin_top: Some(0.4),
        margin_bottom: Some(0.4),
        margin_left: Some(0.4),
        margin_right: Some(0.4),
        prefer_css_page_size: Some(false),
        ..Default::default()
    })).map_err(|e| e.to_string())?;
    
    // 保存PDF文件
    fs::write(&output_path, pdf_data).map_err(|e| e.to_string())?;
    
    // 清理临时文件
    let _ = fs::remove_file(temp_html_path);
    
    // 发送进度：完成
    window.emit("pdf-export-progress", serde_json::json!({
        "stage": "complete",
        "message": "导出完成！",
        "progress": 100
    })).map_err(|e| e.to_string())?;
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_data_path,
            save_data,
            load_data,
            export_data,
            import_data,
            save_image,
            get_images,
            delete_image,
            export_pdf
        ])
        .setup(|_app| {
            #[cfg(debug_assertions)]
            {
                let window = _app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
