import { useState } from "react";
import type { OtpObject } from "../../Pages/Home";
import { Button, Divider, Modal, Stack, TextInput } from "@mantine/core";
import { parseOTPAuthURL } from "../../Utils/parseOtpAuthURL";

export function ManualModal({
    opened,
    onClose,
    afterClose: afterClose,
  }: {
    opened: boolean;
    onClose: () => void;
    afterClose: (newEntry: OtpObject) => void;
  }) {
    const [label, setLabel] = useState("");
    const [secret, setSecret] = useState("");
    const [uri, setUri] = useState("");
  
    const saveManual = async () => {
      afterClose({
        label,
        secret,
        type: "totp",
        issuer: "",
        algorithm: "SHA-1",
        digits: "6",
        counter: "0",
        period: "30",
      });
      onClose();
      // location.reload();
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
            onChange={(e) => setLabel(e.currentTarget.value)}
          />
          <TextInput
            label="Secret"
            required
            placeholder="Secret"
            value={secret}
            onChange={(e) => setSecret(e.currentTarget.value)}
          />
  
          <Button onClick={saveManual} variant="light">
            Add
          </Button>
        </Stack>
      </Modal>
    );
  }
  