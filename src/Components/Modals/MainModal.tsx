import { Button, Drawer, Modal, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { invoke } from "@tauri-apps/api";
import { open } from "@tauri-apps/api/dialog";
import { parseOTPAuthURL } from "../../Utils/parseOtpAuthURL";
import { TOTP } from "totp-generator";
import { memo, useContext } from "react";
import { AppContext } from "../../Contexts/AppContext";
import { recordEntity } from "../../Utils/recordEntity";
import { useNavigate } from "react-router-dom";
import { randomColor } from "../../Utils/randomColor";
import { getRandomId } from "../../Utils/randomId";

type QrModalProps = {
  onClose: () => void;
  opened: boolean;
};

export function MainModalBase({ onClose, opened }: QrModalProps) {
  const { entries, setEntries } = useContext(AppContext);
  // const [manualModalOpened, { close: closeManual, open: openManual }] =
  //   useDisclosure();
  const nav = useNavigate();

  const readQr = async () => {
    const path = (await open({
      directory: false,
      multiple: false,
    })) as string;
    if (!path) {
      onClose();
      return;
    }
    const data = await invoke<string>("read_qr", { path });
    const parsed = parseOTPAuthURL(data);
    if (!parsed.secret || !parsed.label) {
      console.error("Invalid QR code");
      return;
    }
    parsed["otp"] = TOTP.generate(parsed.secret).otp;
    parsed["id"] = getRandomId();
    parsed["icon"] = randomColor();
    await recordEntity(parsed);
    setEntries([...entries, parsed]);
    onClose();
  };

  return (
    <Opener onClose={onClose} opened={opened}>
      <Stack p="xl">
        <Button
          onClick={() => {
            onClose();
            nav("/new", { replace: true });
            // openManual();
          }}
          variant="light"
        >
          Add Manually
        </Button>
        <Button onClick={readQr} variant="light">
          Read QR Code
        </Button>
      </Stack>
    </Opener>
  );
}

function Opener({
  children,
  onClose,
  opened,
}: {
  children: React.ReactNode;
  onClose: () => void;
  opened: boolean;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!isDesktop) {
    return (
      <Drawer
        onClose={onClose}
        opened={opened}
        title="Select method"
        position="bottom"
        size={240}
        transitionProps={{
          transition: "slide-up",
        }}
      >
        {children}
      </Drawer>
    );
  }

  return (
    <Modal
      onClose={onClose}
      opened={opened}
      title="Select method"
      transitionProps={{
        transition: "slide-down",
      }}
    >
      {children}
    </Modal>
  );
}

export const MainModal = memo(MainModalBase, (prev, next) => {
  return prev.opened === next.opened;
});
