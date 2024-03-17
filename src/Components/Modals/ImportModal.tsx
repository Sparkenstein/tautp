import { Button, Divider, Modal, Radio, Stack } from "@mantine/core";
import { open } from "@tauri-apps/api/dialog";
import { memo, useState } from "react";
import { AegisImporter } from "../../Utils/importers";

type ImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ImportOptions =
  | "Aegis"
  | "Authy"
  | "Google Authenticator"
  | "Microsoft Authenticator";

const importOptions: ImportOptions[] = [
  "Aegis",
  "Authy",
  "Google Authenticator",
  "Microsoft Authenticator",
];

function ImportModalBase({ isOpen, onClose }: ImportModalProps) {
  const [from, setFrom] = useState<ImportOptions>("Aegis");
  const [path, setPath] = useState<string>("");

  const importData = () => {
    switch (from) {
      case "Aegis":
        AegisImporter(path);
        break;
    }
    onClose();
  };

  const selectFile = async () => {
    const path = await open({
      multiple: false,
      directory: false,
    });
    if (path) {
      setPath(path as string);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Import data from"
      keepMounted={false}
    >
      <Radio.Group value={from} onChange={(e) => setFrom(e as ImportOptions)}>
        <Stack>
          {importOptions.map((option) => (
            <Radio key={option} value={option} label={option}></Radio>
          ))}
          <Divider />
          <Button onClick={selectFile}>Select import file</Button>
          <Divider />
          <Button disabled={!path} onClick={importData}>
            Import
          </Button>
        </Stack>
      </Radio.Group>
    </Modal>
  );
}

export const ImportModal = memo(ImportModalBase, (prev, next) => {
  return prev.isOpen === next.isOpen;
});
