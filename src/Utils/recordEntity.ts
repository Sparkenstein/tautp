import { invoke } from "@tauri-apps/api";
import { store } from "./db";

async function recordEntity(entity: any[], label: string, secret: string) {
  await store.set("entries", entity);
  await store.save();

  await invoke("add_secret", {
    label,
    secret,
  });

  return;
}

export { recordEntity };
