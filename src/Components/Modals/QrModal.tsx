import { Button, Modal, Stack } from "@mantine/core";

type QrModalProps = {
  onClose: () => void;
  opened: boolean;
  openQrModal: () => void;
  openManual: () => void;
};

export function QrModal({
  onClose,
  opened,
  openQrModal,
  openManual,
}: QrModalProps) {
  return (
    <Modal onClose={onClose} opened={opened} title="Select method">
      <Stack p="xl">
        <Button
          onClick={() => {
            onClose();
            openManual();
          }}
          variant="light"
        >
          Add Manually
        </Button>
        <Button onClick={openQrModal} variant="light">
          Read QR Code
        </Button>
      </Stack>
    </Modal>
  );
}
