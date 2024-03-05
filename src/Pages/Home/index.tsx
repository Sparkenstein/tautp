import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Modal,
  Progress,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { invoke } from "@tauri-apps/api";
import { TOTP } from "totp-generator";

import { open } from "@tauri-apps/api/dialog";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { store } from "../../Utils/db";

type Entries = {
  secret: string;
  label: string;
};

// type Entries = [string, Entry];

export default function Home() {
  const [opened, { open: openModal, close: closeModal }] = useDisclosure();
  const [manualOpened, { open: openManual, close: closeManual }] =
    useDisclosure();

  const [time, setTime] = useState(() => {
    let currentSeconds = Math.floor(Date.now() / 1000);
    return 30 - (currentSeconds % 30);
  });

  const [entries, setEntries] = useState<Entries[]>([]);

  useEffect(() => {
    let currentSeconds = Math.floor(Date.now() / 1000);
    let time = 30 - (currentSeconds % 30);
    const interval = setInterval(() => {
      currentSeconds = Math.floor(Date.now() / 1000);
      time = 30 - (currentSeconds % 30);
      setTime(time);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    async function init() {
      const entries = (await store.get<Entries[]>("entries")) || [];
      setEntries(entries);
    }
    init();
  }, []);

  const openQr = () => {
    closeModal();

    open({
      directory: false,
      filters: [{ name: "Images", extensions: ["png"] }],
      multiple: false,
      title: "Select QR Code",
    }).then(async (res) => {
      let path = res as string;
      if (path) {
        invoke<string>("read_qr", { path }).then(async (res) => {
          const parsed = parseOTPAuthURL(res);
          if (!parsed.secret || !parsed.label) {
            // throw error maybe
            notifications.show({
              message: "Invalid QR Code",
              color: "red",
            });
            return;
          }

          if (entries.find((e) => e.secret === parsed.secret)) {
            notifications.show({
              message: "Entry already exists",
              color: "red",
            });
            return;
          }

          await store.set("entries", [
            ...entries,
            { secret: parsed.secret, label: parsed.label },
          ]);
          await store.save();

          setEntries([
            ...entries,
            { secret: parsed.secret, label: parsed.label },
          ]);
        });
      }
    });
  };

  return (
    <Box h="100%">
      <Group p="md" justify="space-around" wrap="nowrap">
        <TextInput radius={"sm"} placeholder="Search" w={"80%"} />
        <Button rightSection={"+"} onClick={openModal} variant="light">
          Add New{" "}
        </Button>
      </Group>

      <Grid p="md">
        {entries.map((e) => (
          <Grid.Col
            span={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3,
              xl: 2,
            }}
            key={e.label}
          >
            <Card>
              <Title>
                {TOTP.generate(e.secret).otp.replace(
                  /(\d)(?=(\d{3})+$)/g,
                  "$1 "
                )}
              </Title>
              <Text>{decodeURIComponent(e.label || "")} </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Modal onClose={closeModal} opened={opened} title="Select method">
        <Stack p="xl">
          <Button
            onClick={() => {
              closeModal();
              openManual();
            }}
            variant="light"
          >
            Add Manually
          </Button>
          <Button onClick={openQr} variant="light">
            Read QR Code
          </Button>
        </Stack>
      </Modal>

      <ManualModal
        opened={manualOpened}
        afterClose={(newEntry: Entries) => {
          setEntries([...entries, newEntry]);
          store.set("entries", [...entries, newEntry]);
        }}
        onClose={closeManual}
      />

      <Progress.Root
        size={"xl"}
        radius={0}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Progress.Section
          color={time < 10 ? "red" : time < 20 ? "orange" : "blue"}
          value={(time / 30) * 100}
        >
          <Progress.Label>{time}</Progress.Label>
        </Progress.Section>
      </Progress.Root>
    </Box>
  );
}

function parseOTPAuthURL(url: string) {
  const urlObject = new URL(url);
  const params = new URLSearchParams(urlObject.search);

  const algomap: Record<string, string> = {
    SHA1: "SHA-1",
    SHA256: "SHA-256",
    SHA512: "SHA-512",
  };

  let algorithm = params.get("algorithm") || "SHA1";

  let otpObject = {
    type: urlObject.pathname.split("/")[2],
    label: urlObject.pathname.split("/")[3],
    issuer: params.get("issuer"),
    secret: params.get("secret"),
    algorithm: algomap[algorithm],
    digits: params.get("digits") || "6",
    counter: params.get("counter") || "0",
    period: params.get("period") || "30",
  };

  if (!otpObject.secret || !otpObject.issuer) {
    throw new Error("Invalid OTPAuth URL");
  }

  return otpObject;
}

function ManualModal({
  opened,
  onClose,
  afterClose: afterClose,
}: {
  opened: boolean;
  onClose: () => void;
  afterClose: (newEntry: Entries) => void;
}) {
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState("");
  const [uri, setUri] = useState("");

  const saveManual = async () => {
    afterClose({ label, secret });
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
