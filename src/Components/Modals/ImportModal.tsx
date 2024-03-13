import { Button, Divider, Modal, Radio, Stack, Text } from "@mantine/core";
import { memo, useState } from "react";

type ImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const importOptions = [
  "Aegis",
  "Authy",
  "Google Authenticator",
  "Microsoft Authenticator",
];

function ImportModalBase({ isOpen, onClose }: ImportModalProps) {
  const [from, setFrom] = useState(importOptions[0]);

  const importData = () => {
    console.log(`Importing data from ${from}`);
    onClose();
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Import data from">
      <Radio.Group value={from} onChange={setFrom}>
        <Stack>
          {importOptions.map((option) => (
            <Radio
              key={option}
              value={option.toLowerCase().replace(" ", "-")}
              label={option}
            ></Radio>
          ))}
          <Divider />
          <Button onClick={importData}>Import</Button>
        </Stack>
      </Radio.Group>
    </Modal>
  );
}

export const ImportModal = memo(ImportModalBase, (prev, next) => {
  return prev.isOpen === next.isOpen;
});
