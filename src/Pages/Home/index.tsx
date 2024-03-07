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

// type Entries = [string, Entry];

type OtpObject = {
  type: string;
  label: string;
  issuer: string;
  secret: string;
  algorithm: string;
  digits: string;
  counter: string;
  period: string;
};

export default function Home() {
  const [qrOpened, { open: openQrModal, close: closeQrModal }] =
    useDisclosure();
  const [manualOpened, { open: openManual, close: closeManual }] =
    useDisclosure();

  const [time, setTime] = useState(() => {
    let currentSeconds = Math.floor(Date.now() / 1000);
    return 30 - (currentSeconds % 30);
  });

  const [search, setSearch] = useState("");

  const [entries, setEntries] = useState<OtpObject[]>([]);

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
      const entries =
        (await store.get<Omit<OtpObject, "secret">[]>("entries")) ||
        ([] as OtpObject[]);
      if (entries.length === 0) return;
      invoke<Record<string, string>>("get_secrets", {
        entries: entries.map((e) => e.label),
      })
        .then((res) => {
          const newEntries = entries.map((e) => {
            return { ...e, secret: res[e.label] };
          });
          setEntries(newEntries);
        })
        .catch((e) => {
          console.error("get_secrets error", e);
        });
    }
    init();
  }, []);

  const openQr = () => {
    closeQrModal();

    open({
      directory: false,
      filters: [{ name: "Images", extensions: ["png"] }],
      multiple: false,
      title: "Select QR Code",
    }).then(async (res) => {
      let path = res as string;
      if (path) {
        invoke<string>("read_qr", { path })
          .then(async (res) => {
            const parsed = parseOTPAuthURL(res);
            if (!parsed.secret || !parsed.label) {
              // throw error maybe
              notifications.show({
                message: "Invalid QR Code",
                color: "red",
              });
              return;
            }

            let copy: Partial<OtpObject> = { ...parsed };
            delete copy.secret;

            const entriesWithoutSecret = entries.map(
              (e: Partial<OtpObject>) => {
                let copy = { ...e };
                delete copy.secret;
                return copy;
              }
            );

            await store.set("entries", [...entriesWithoutSecret, copy]);
            await store.save();

            setEntries([...entries, parsed]);

            await invoke("add_secret", {
              label: parsed.label,
              secret: parsed.secret,
            });
            notifications.show({
              message: "Added",
              color: "green",
            });
          })
          .catch((e) => {
            console.error("QR error ", e);
            notifications.show({
              message: "Invalid QR Code",
              color: "red",
            });
          });
      }
    });
  };

  const afterClose = async (newEntry: OtpObject) => {
    const newEntryWithoutSecret: Partial<OtpObject> = { ...newEntry };
    delete newEntryWithoutSecret.secret;

    const entriesWithoutSecret = entries.map((e: Partial<OtpObject>) => {
      let copy = { ...e };
      delete copy.secret;
      return copy;
    });
    await store.set("entries", [
      ...entriesWithoutSecret,
      newEntryWithoutSecret,
    ]);
    await store.save();

    await invoke("add_secret", {
      label: newEntry.label,
      secret: newEntry.secret,
    });

    setEntries([...entries, newEntry]);
  };

  return (
    <Box h="100%">
      <Group p="md" justify="space-around" wrap="nowrap">
        <TextInput
          radius={"sm"}
          placeholder="Search"
          w={"80%"}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <Button rightSection={"+"} onClick={openQrModal} variant="light">
          Add New{" "}
        </Button>
      </Group>

      <Grid p="md">
        {entries
          .filter((f) =>
            search ? f.label.toLowerCase().includes(search.toLowerCase()) : true
          )
          .map((e) => (
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

      <Modal onClose={closeQrModal} opened={qrOpened} title="Select method">
        <Stack p="xl">
          <Button
            onClick={() => {
              closeQrModal();
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
        afterClose={afterClose}
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
          color={time < 10 ? "red" : "blue"}
          value={(time / 30) * 100}
          style={{
            transition: `width ${time === 0 ? "10ms" : "1s"} linear`,
          }}
        >
          <Progress.Label>{time}</Progress.Label>
        </Progress.Section>
      </Progress.Root>
    </Box>
  );
}

function parseOTPAuthURL(url: string): OtpObject {
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
    issuer: params.get("issuer") || "",
    secret: params.get("secret") || "",
    algorithm: algomap[algorithm],
    digits: params.get("digits") || "6",
    counter: params.get("counter") || "0",
    period: params.get("period") || "30",
  };
  console.log(otpObject);

  if (!otpObject.secret || !otpObject.label) {
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
