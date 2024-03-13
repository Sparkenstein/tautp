import { invoke } from "@tauri-apps/api";
import { store } from "./db";
import { OtpObject } from "../Pages/Home";

async function recordEntities(
  entities: OtpObject[],
  label: string,
  secret: string,
  isEditing?: boolean
) {
  const deepCopy: OtpObject[] = JSON.parse(JSON.stringify(entities));
  const cleaned = deepCopy.map((e) => {
    delete e.otp;
    delete e.secret;
    return e;
  });
  await store.set("entries", cleaned);
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

export { recordEntities, deleteEntity };
