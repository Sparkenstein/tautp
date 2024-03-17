import { info } from "tauri-plugin-log-api";

function log(message: string) {
  info(message, {
    file: "info.log",
  });
}

export { log };
