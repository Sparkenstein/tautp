import { store } from "./db";
import { OtpObject } from "../pages/Home";

async function renameEntity(changedEntity: OtpObject) {
  const stored = (await store.get<OtpObject[]>("entries")) || [];
  const changed = stored.map((e) => {
    if (e.id === changedEntity.id) {
      return changedEntity;
    }
    return e;
  });

  await store.set("entries", changed);
  await store.save();

  return changed;
}

async function recordEntity(entity: OtpObject) {
  const stored = (await store.get<OtpObject[]>("entries")) || [];
  const copy = JSON.parse(JSON.stringify(entity));
  delete copy.otp;

  const newStored = [...stored, copy];
  await store.set("entries", newStored);
  await store.save();

  return newStored;
}

async function deleteEntity(entity: OtpObject) {
  const stored = (await store.get<OtpObject[]>("entries")) || [];
  const filtered = stored.filter((e: any) => e.id !== entity.id);

  await store.set("entries", filtered);
  await store.save();

  return filtered;
}

export { deleteEntity, recordEntity, renameEntity };
