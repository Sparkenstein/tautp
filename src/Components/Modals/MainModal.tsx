import { Button, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ManualModal } from "./ManualEntryModal";
import { invoke } from "@tauri-apps/api";
import { open } from "@tauri-apps/api/dialog";
import { parseOTPAuthURL } from "../../Utils/parseOtpAuthURL";
import { TOTP } from "totp-generator";
import { useContext } from "react";
import { AppContext } from "../../Contexts/AppContext";
import { recordEntities } from "../../Utils/recordEntity";

type QrModalProps = {
  onClose: () => void;
  opened: boolean;
};

export function MainModal({ onClose, opened }: QrModalProps) {
  const { entries, setEntries } = useContext(AppContext);
  const [manualModalOpened, { close: closeManual, open: openManual }] =
    useDisclosure();

  const readQr = async () => {
    const path = (await open({
      directory: false,
      multiple: false,
    })) as string;
    const data = await invoke<string>("read_qr", { path });
    const parsed = parseOTPAuthURL(data);
    if (!parsed.secret || !parsed.label) {
      console.error("Invalid QR code");
      return;
    }
    parsed["otp"] = TOTP.generate(parsed.secret).otp;
    parsed["id"] = entries.length;
    await recordEntities([...entries, parsed], parsed.label, parsed.secret);
    setEntries([...entries, parsed]);
    onClose();
  };

  return (
    <div>
      <Modal onClose={onClose} opened={opened} title="Select method">
        <Stack p="xl">
          <Button
            onClick={() => {
              openManual();
              onClose();
            }}
            variant="light"
          >
            Add Manually
          </Button>
          <Button onClick={readQr} variant="light">
            Read QR Code
          </Button>
        </Stack>
      </Modal>

      <ManualModal opened={manualModalOpened} onClose={closeManual} />
    </div>
  );
}
