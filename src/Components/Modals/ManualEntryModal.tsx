import { useContext, useState } from "react";
import type { OtpObject } from "../../Pages/Home";
import { Button, Divider, Modal, Stack, TextInput } from "@mantine/core";
import { parseOTPAuthURL } from "../../Utils/parseOtpAuthURL";
import { useInputState } from "@mantine/hooks";
import { recordEntity } from "../../Utils/recordEntity";
import { AppContext } from "../../Contexts/AppContext";
import { TOTP } from "totp-generator";

type ManualModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function ManualModal({ opened, onClose }: ManualModalProps) {
  const { entries, setEntries } = useContext(AppContext);
  const [label, setLabel] = useInputState("");
  const [secret, setSecret] = useInputState("");
  const [issuer, setIssuer] = useInputState("");

  // TODO: add support for these
  const algorithm = "SHA-1";
  const digits = "6";
  const period = "30";

  const [uri, setUri] = useState("");

  const saveManual = async () => {
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

  return (
    <Modal onClose={onClose} opened={opened} title="Add Manually">
      <Stack p="xl">
        <TextInput
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
        <Divider label="or" />
        <TextInput
          label="Label"
          required
          placeholder="Label"
          value={label}
          onChange={setLabel}
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
      </Stack>
    </Modal>
  );
}
