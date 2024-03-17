import { invoke } from "@tauri-apps/api";
import { store } from "./db";
import { OtpObject } from "../Pages/Home";
import { getRandomId } from "./randomId";
import { log } from "./logger";

async function recordEntity(entity: OtpObject) {
  const stored = (await store.get<OtpObject[]>("entries")) || [];
  const copy = JSON.parse(JSON.stringify(entity));
  delete copy.otp;
  delete copy.secret;

  const newStored = [...stored, copy];
  await store.set("entries", newStored);
  await store.save();
  log(`Recording entity ${entity.id}.${entity.label}`);
  await invoke("add_secret", {
    label: entity.id,
    secret: entity.secret,
  });
}

async function deleteEntity(entity: OtpObject) {
  const stored = (await store.get<OtpObject[]>("entries")) || [];
  const filtered = stored.filter((e: any) => e.id !== entity.id);
  const secrets = await invoke<Record<string, string>>("get_secrets", {
    entries: filtered.map((s) => s.id),
  });
  const ents = filtered.map<OtpObject>((s) => {
    return {
      ...s,
      id: getRandomId(),
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

export { deleteEntity, recordEntity };
