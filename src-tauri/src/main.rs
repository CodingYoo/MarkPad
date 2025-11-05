// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::fs;
use std::path::PathBuf;
use base64::{Engine as _, engine::general_purpose};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct ImageInfo {
    filename: String,
    path: String,
    size: u64,
    created_at: u64,
}

// 获取应用数据目录（安装目录下的data文件夹）
fn get_app_data_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
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
            delete_image
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
