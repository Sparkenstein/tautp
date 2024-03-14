import { Store } from "tauri-plugin-store-api";

export const store = new Store("totp.dat"); //FIXME: rename to dat

async function init() {
  if (!(await store.length())) {
    await store.set("entries", []);
    await store.save();
  }
}

init();
