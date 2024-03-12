import { invoke } from "@tauri-apps/api";
import { store } from "./db";
import { OtpObject } from "../Pages/Home";

async function recordEntity(
  entity: OtpObject[],
  label: string,
  secret: string,
  isEditing?: boolean
) {
  await store.set("entries", entity);
  await store.save();

  if (isEditing) {
    await invoke("remove_secret", {
      label,
    });
    console.log("removed secret", label);
  }

  await invoke("add_secret", {
    label,
    secret,
  });

  return;
}

async function deleteEntity(entity: OtpObject) {
  const stored = (await store.get<OtpObject[]>("entries")) || [];
  const filtered = stored.filter((e: any) => e.id !== entity.id);
  await store.set("entries", filtered);
  await store.save();

  await invoke("remove_secret", {
    label: entity.label,
  });

  return filtered;
}

export { recordEntity, deleteEntity };
