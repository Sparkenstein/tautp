import {
  ActionIcon,
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  Grid,
  Group,
  Modal,
  Paper,
  Progress,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  rem,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { invoke } from "@tauri-apps/api";
import { TOTP } from "totp-generator";

import { open } from "@tauri-apps/api/dialog";
import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { store } from "../../Utils/db";
import { IconMoonStars, IconSettings, IconSun } from "@tabler/icons-react";
import { Sidebar } from "../../Components/Sidebar";
import { ManualModal } from "../../Components/Modals/ManualEntryModal";
import { parseOTPAuthURL } from "../../Utils/parseOtpAuthURL";
import { QrModal } from "../../Components/Modals/QrModal";
import { useTimer } from "../../Utils/useTimer";

export type OtpObject = {
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

  const time = useTimer();

  const [search, setSearch] = useState("");

  const [entries, setEntries] = useState<OtpObject[]>([]);

  const { colorScheme } = useMantineColorScheme();

  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);

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
                title: "Error",
                message: "Invalid QR Code",
                color: "red",
              });
              return;
            }

            if (entries.find((e) => e.secret === parsed.secret)) {
              notifications.show({
                title: "Error",
                message: "Entry with same secret already exists",
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
              title: "Success",
              message: "Added",
              color: "green",
            });
          })
          .catch((e) => {
            console.error("QR error ", e);
            notifications.show({
              title: "Error",
              message: "Invalid QR Code",
              color: "red",
            });
          });
      }
    });
  };

  const afterClose = async (newEntry: OtpObject) => {
    if (!newEntry.secret || !newEntry.label) {
      notifications.show({
        title: "Error",
        message: "Invalid Entry",
        color: "red",
      });
      return;
    }
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

  const calcutatedEntries = useMemo(() => {
    return entries.map((e) => {
      return {
        ...e,
        otp: TOTP.generate(e.secret).otp.replace(/(\d)(?=(\d{3})+$)/g, "$1 "),
      };
    });
  }, [entries, time < 2]);

  return (
    <Box h="100%" bg={colorScheme === "dark" ? "dark" : "white"}>
      <Group p="md" justify="space-around" wrap="nowrap" pt="xl">
        <ActionIcon variant="light" onClick={openDrawer}>
          <IconSettings />
        </ActionIcon>
        <TextInput
          radius={"sm"}
          placeholder="Search"
          value={search}
          flex={1}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <Button rightSection={"+"} onClick={openQrModal} variant="light">
          Add New{" "}
        </Button>
      </Group>

      <Grid p="md">
        {calcutatedEntries
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
              <Paper shadow="xs" radius="md" p="xl">
                <Title>{e.otp}</Title>
                <Text>{decodeURIComponent(e.label || "")} </Text>
              </Paper>
            </Grid.Col>
          ))}
      </Grid>

      <QrModal
        onClose={closeQrModal}
        opened={qrOpened}
        openQrModal={openQr}
        openManual={openManual}
      />

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
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <Progress.Section
          color={time < 10 ? "red.9" : "teal"}
          value={(time / 30) * 100}
          style={{
            transition: `all ${time === 30 ? "10ms" : "1s"} linear`,
            // transition: "all 1s linear",
          }}
        >
          <Progress.Label>{time}s</Progress.Label>
        </Progress.Section>
      </Progress.Root>

      <Sidebar closeDrawer={closeDrawer} drawerOpened={drawerOpened} />
    </Box>
  );
}

// TODO: icons support
// TODO: view mode: compact, tiles, cards etc.
// TODO: cleanup code
// TODO: add settings
// TODO: advance config for OTP
// TODO: tap to reveal
