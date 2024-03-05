import { Store } from "tauri-plugin-store-api";

export const store = new Store("settings.json"); //FIXME: rename to dat

if (!(await store.length())) {
  await store.set("entries", []);
  await store.set("user", {});
  await store.save();
}
