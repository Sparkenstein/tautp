// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;

use keyring::Entry;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            read_qr,
            get_user,
            create_user,
            validate_user,
            add_secret,
            get_secrets
        ])
        .setup(|app| {
            // check if debug mode is enabled, open devtools if it is
            if cfg!(debug_assertions) {
                app.get_window("main").unwrap().open_devtools();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn read_qr(path: String) -> String {
    let image = image::open(path).unwrap();
    let decoder = bardecoder::default_decoder();
    let result = decoder.decode(&image);
    let mut ret = String::new();

    for code in result {
        match code {
            Ok(code) => {
                println!("Decoded QR code: {:?}", code);
                ret.push_str(&code)
            }
            Err(e) => {
                println!("Error decoding QR code: {:?}", e);
                return "".to_string();
            }
        }
    }

    ret
}
const SERVICE_NAME: &str = "tautp";
const ENTRY_NAME: &str = "master_user";

#[tauri::command]
fn get_user() -> String {
    let entry = Entry::new(SERVICE_NAME, ENTRY_NAME).unwrap();
    match entry.get_password() {
        Ok(_) => "success".to_string(),
        Err(_) => "".to_string(),
    }
}

#[tauri::command]
fn create_user(password: String) -> String {
    let entry = Entry::new(SERVICE_NAME, ENTRY_NAME).unwrap();
    match entry.set_password(&password) {
        Ok(_) => "success".to_string(),
        Err(_) => "error".to_string(),
    }
}

#[tauri::command]
fn validate_user(password: String) -> String {
    let entry = Entry::new(SERVICE_NAME, ENTRY_NAME).unwrap();
    match entry.get_password() {
        Ok(p) => {
            if p == password {
                "success".to_string()
            } else {
                "error".to_string()
            }
        }
        Err(_) => "error".to_string(),
    }
}

#[tauri::command]
fn add_secret(label: String, secret: String) -> String {
    let entry = Entry::new(SERVICE_NAME, &label).unwrap();
    match entry.set_password(&secret) {
        Ok(_) => "success".to_string(),
        Err(_) => "error".to_string(),
    }
}

#[tauri::command]
fn get_secrets(entries: Vec<String>) -> Result<HashMap<String, String>, String> {
    let mut secrets = HashMap::new();
    for entry in entries {
        let e = Entry::new(SERVICE_NAME, &entry).unwrap();
        match e.get_password() {
            Ok(p) => {
                secrets.insert(entry, p);
            }
            Err(_) => return Err("error".to_string()),
        }
    }
    Ok(secrets)
}
