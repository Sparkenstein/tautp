import { Grid, Stack, useMantineColorScheme } from "@mantine/core";
import { Navbar } from "./Components/Navbar";
import { useTimer } from "../../Utils/useTimer";
import { ProgressBar } from "./Components/Progress";
import { MainModal } from "../../Components/Modals/MainModal";
import { useDisclosure } from "@mantine/hooks";
import { useContext, useEffect, useState } from "react";
import { store } from "../../Utils/db";
import { invoke } from "@tauri-apps/api";
import { Card } from "./Components/Card";
import { TOTP } from "totp-generator";
import { AppContext } from "../../Contexts/AppContext";

export type OtpObject = {
  id: number;
  label: string;
  issuer: string;
  secret: string;
  algorithm: string;
  digits: string;
  counter: string;
  period: string;
  otp?: string;
};

export default function Home() {
  // const [entries, setEntries] = useState<OtpObject[]>([]);

  const { entries, setEntries } = useContext(AppContext);

  const [mainModalOpen, { open, close }] = useDisclosure();
  const { colorScheme } = useMantineColorScheme();
  const time = useTimer();

  useEffect(() => {
    async function init() {
      const stored = await store.get<OtpObject[]>("entries");
      if (stored) {
        const otps = await invoke<Record<string, string>>("get_secrets", {
          entries: stored.map((s) => s.label),
        });
        const ents = stored.map((s, i) => {
          return {
            ...s,
            id: i,
            otp: TOTP.generate(otps[s.label]).otp,
          };
        });
        setEntries(ents);
      }
    }
    init();
  }, []);

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
        {entries.map((e) => (
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
// TODO: cleanup code
// TODO: add settings
// TODO: advance config for OTP
// TODO: tap to reveal
// TODO: support `note`
