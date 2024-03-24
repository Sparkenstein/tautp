import { Grid, Stack, useMantineColorScheme } from "@mantine/core";
import { Navbar } from "./components/Navbar";
import { useTimer } from "../../utils/useTimer";
import { ProgressBar } from "./components/Progress";
import { MainModal } from "../../components/Modals/MainModal";
import { useDisclosure, useIdle } from "@mantine/hooks";
import { useContext, useEffect, useMemo } from "react";
import { Card } from "./components/Card";
import { TOTP } from "totp-generator";
import { AppContext } from "../../contexts/AppContext";
import { useNavigate } from "react-router-dom";

export type OtpObject = {
  id: string;
  label: string;
  issuer: string;
  secret: string;
  algorithm: string;
  digits: number;
  counter: number;
  period: number;
  icon?: string;
  otp?: string;
};

export default function Home() {
  const { entries } = useContext(AppContext);

  const nav = useNavigate();

  const idle = useIdle(import.meta.env.DEV ? 5000000 : 50 * 1000, {
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
      bg={colorScheme === "dark" ? "dark.9" : "white"}
      style={{
        overflow: "auto",
      }}
    >
      <Navbar
        openMainModal={open}
        search={""}
        setSearch={() => {}}
        time={time}
      />

      <MainModal onClose={close} opened={mainModalOpen} />

      <Grid p="md" align="stretch" justify="start" style={{ height: "100%" }}>
        {memoisedEntries.map((e) => (
          <Grid.Col
            key={e.id}
            span={{
              base: 12,
              sm: 6,
              md: 4,
              lg: 3,
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
