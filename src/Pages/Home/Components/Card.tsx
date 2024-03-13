import { ActionIcon, CopyButton, Paper, Text, Title } from "@mantine/core";
import classes from "../Home.module.css";
import { IconCheck, IconCopy, IconEdit } from "@tabler/icons-react";
import { OtpObject } from "..";
import { useDisclosure } from "@mantine/hooks";
import { ManualModal } from "../../../Components/Modals/ManualEntryModal";
import { clipboard } from "@tauri-apps/api";

type CardProps = {
  e: OtpObject;
};

export function Card({ e }: CardProps) {
  const [opened, { close, open }] = useDisclosure();
  return (
    <Paper shadow="xs" radius="md" p="xl" className={classes.card}>
      {/* show otp in group of 2's */}
      <Title>{e.otp?.replace(/(\d)(?=(\d{2})+(?!\d))/g, "$1 ")}</Title>
      {e.issuer ? (
        <Text>
          {decodeURIComponent(e.issuer)} ({decodeURIComponent(e.label || "")})
        </Text>
      ) : (
        <Text>{decodeURIComponent(e.label || "")} </Text>
      )}
      <ActionIcon variant="light" className={classes.editIcon} onClick={open}>
        <IconEdit />
      </ActionIcon>

      <CopyButton value={e.otp!} timeout={2000}>
        {({ copied, copy }) => (
          <ActionIcon
            variant="light"
            className={classes.copyIcon}
            color={copied ? "teal" : undefined}
            onClick={() => {
              copy();
              clipboard.writeText(e.otp!);
            }}
          >
            {copied ? <IconCheck /> : <IconCopy />}
          </ActionIcon>
        )}
      </CopyButton>

      <ManualModal opened={opened} onClose={close} entity={e} />
    </Paper>
  );
}
