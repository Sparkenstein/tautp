// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use tauri::Manager;

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![get_hash, validate, read_qr])
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

#[derive(Serialize, Deserialize, Debug)]
struct User {
    username: String,
    password: String,
}

#[tauri::command]
fn validate(password: String, hash: String) -> Result<String, String> {
    let parsed_hash = PasswordHash::new(&hash).unwrap();

    let success = Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok();
    if success {
        return Ok("Success".to_string());
    } else {
        return Err("Invalid".to_string());
    }
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

#[tauri::command]
fn get_hash(password: String) -> String {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hash = argon2.hash_password(password.as_bytes(), &salt).unwrap();
    let hash_string = hash.to_string();

    hash_string
}
