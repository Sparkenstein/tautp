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
  const secrets = await invoke<Record<string, string>>("get_secrets", {
    entries: filtered.map((s) => s.label),
  });
  const ents = filtered.map((s, i) => {
    return {
      ...s,
      id: i,
      secret: secrets[s.label],
    };
  });
  await store.set("entries", ents);
  await store.save();

  await invoke("remove_secret", {
    label: entity.label,
  });

  return ents;
}

export { recordEntities, deleteEntity };
