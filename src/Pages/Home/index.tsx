import { Grid, Stack, useMantineColorScheme } from "@mantine/core";
import { Navbar } from "./Components/Navbar";
import { useTimer } from "../../Utils/useTimer";
import { ProgressBar } from "./Components/Progress";
import { MainModal } from "../../Components/Modals/MainModal";
import { useDisclosure, useIdle } from "@mantine/hooks";
import { useContext, useEffect, useMemo, useState } from "react";
import { store } from "../../Utils/db";
import { invoke } from "@tauri-apps/api";
import { Card } from "./Components/Card";
import { TOTP } from "totp-generator";
import { AppContext } from "../../Contexts/AppContext";
import { useNavigate } from "react-router-dom";

export type OtpObject = {
  id: number;
  label: string;
  issuer: string;
  secret?: string;
  algorithm: string;
  digits: string;
  counter: string;
  period: string;
  otp?: string;
};

export default function Home() {
  // const [entries, setEntries] = useState<OtpObject[]>([]);

  const { entries, setEntries } = useContext(AppContext);

  const nav = useNavigate();

  const idle = useIdle(10 * 1000, {
    initialState: false,
  });

  const [mainModalOpen, { open, close }] = useDisclosure();
  const { colorScheme } = useMantineColorScheme();
  const time = useTimer();

  useEffect(() => {
    if (idle) {
      console.log("idle");
      nav("/", { replace: true });
    }
  }, [idle]);

  useEffect(() => {
    async function init() {
      const stored = await store.get<OtpObject[]>("entries");
      if (stored) {
        const secrets = await invoke<Record<string, string>>("get_secrets", {
          entries: stored.map((s) => s.label),
        });
        const ents = stored.map((s, i) => {
          return {
            ...s,
            id: i,
            secret: secrets[s.label],
          };
        });
        setEntries(ents);
      }
    }
    init();
  }, []);

  const memoisedEntries = useMemo(() => {
    return entries.map((e) => {
      if (!e.secret) return e;
      return {
        ...e,
        otp: TOTP.generate(e.secret).otp,
      };
    });
  }, [entries, time < 2]);

  return (
    <Stack
      h="100%"
      bg={colorScheme === "dark" ? "dark" : "white"}
      style={{
        overflow: "auto",
      }}
    >
      <Navbar openMainModal={open} search={""} setSearch={() => {}} />

      <MainModal onClose={close} opened={mainModalOpen} />

      <ProgressBar time={time} />

      <Grid p="md">
        {memoisedEntries.map((e) => (
          <Grid.Col
            key={e.id}
            span={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3,
              xl: 2,
            }}
          >
            <Card e={e}></Card>
          </Grid.Col>
        ))}
      </Grid>

      {/*  */}
    </Stack>
  );
}

// TODO: icons support
// TODO: view mode: compact, tiles, cards etc.
// TODO: add settings
// TODO: advance config for OTP
// TODO: tap to reveal
// TODO: support `note`
// TODO: lock user after 3 failed attempts
