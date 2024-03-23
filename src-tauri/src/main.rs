// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use tauri::Manager;
use tauri_plugin_log::LogTarget;

fn main() {
    tauri::Builder::default()
        // .plugin(
        //     tauri_plugin_log::Builder::default()
        //         .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
        //         .build(),
        // )
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![read_qr])
        .setup(|app| {
            let process_arg: Vec<String> = env::args().collect();
            if process_arg.contains(&"--debug".to_string()) {
                // in prod build, if --debug is passed, open devtools
                app.get_window("main").unwrap().open_devtools();
            }

            // check if debug mode is enabled, open devtools if it is
            #[cfg(debug_assertions)]
            app.get_window("main").unwrap().open_devtools();

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
