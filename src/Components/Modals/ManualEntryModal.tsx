import { memo, useContext, useState } from "react";
import type { OtpObject } from "../../Pages/Home";
import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { deleteEntity, recordEntity } from "../../Utils/recordEntity";
import { AppContext } from "../../Contexts/AppContext";
import { TOTP } from "totp-generator";
import { confirm } from "@tauri-apps/api/dialog";

type ManualModalProps = {
  opened: boolean;
  onClose: () => void;
  entity?: OtpObject;
};

export function ManualModalBase({ opened, onClose, entity }: ManualModalProps) {
  const { entries, setEntries } = useContext(AppContext);
  const [label, setLabel] = useInputState(entity?.label || "");
  const [secret, setSecret] = useInputState(entity?.secret || "");
  const [issuer, setIssuer] = useInputState(entity?.issuer || "");

  // TODO: add support for these
  const algorithm = "SHA-1";
  const digits = "6";
  const period = "30";

  const isEditing = !!entity;

  // const [uri, setUri] = useState("");

  const saveManual = async () => {
    if (isEditing) {
      const changed = entries.map((e) => {
        if (e.id === entity?.id) {
          return {
            ...e,
            label,
            issuer,
            secret,
          };
        }
        return e;
      });
      await recordEntity(changed, label, secret, true);
      setEntries(changed);
      onClose();
      return;
    }

    let newEntry: OtpObject = {
      label,
      issuer,
      algorithm,
      digits,
      period,
      id: entries.length,
      secret,
      counter: "0",
      otp: TOTP.generate(secret).otp,
    };
    await recordEntity([...entries, newEntry], label, secret);
    setEntries([...entries, newEntry]);
    onClose();
  };

  const deleteEntry = async () => {
    const confirmation = await confirm(
      "Deleting entry is irreversible. Are you sure?"
    );
    if (confirmation) {
      const remaining = await deleteEntity(entity!);
      setEntries(remaining);
    }
    onClose();
  };

  return (
    <Modal onClose={onClose} opened={opened} title="Add Manually">
      <Stack p="xl">
        {/* <TextInput
          label="URI"
          required
          placeholder={"otpauth://totp/label?secret=secret"}
          value={uri}
          onChange={(e) => {
            setUri(e.currentTarget.value);
            const parsed = parseOTPAuthURL(e.currentTarget.value);
            setLabel(parsed.label);
            setSecret(parsed.secret || "");
          }}
        />
        <Divider label="or" /> */}
        <TextInput
          label="Label"
          required
          placeholder="Label"
          value={label}
          onChange={setLabel}
          disabled={isEditing}
        />

        <TextInput
          label="Issuer"
          placeholder="Issuer"
          value={issuer}
          onChange={setIssuer}
        />
        <TextInput
          label="Secret"
          required
          placeholder="Secret"
          value={secret}
          onChange={setSecret}
        />

        <Button onClick={saveManual} variant="light">
          Add
        </Button>
        {isEditing && (
          <Button color="red" onClick={deleteEntry} variant="light">
            Delete
          </Button>
        )}
      </Stack>
    </Modal>
  );
}

export const ManualModal = memo(ManualModalBase, (prev, next) => {
  return prev.opened === next.opened;
});
