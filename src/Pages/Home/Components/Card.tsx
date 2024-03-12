import { ActionIcon, Paper, Text, Title } from "@mantine/core";
import classes from "../Home.module.css";
import { IconEdit } from "@tabler/icons-react";
import { OtpObject } from "..";
import { useDisclosure } from "@mantine/hooks";
import { ManualModal } from "../../../Components/Modals/ManualEntryModal";

type CardProps = {
  e: OtpObject;
};

export function Card({ e }: CardProps) {
  const [opened, { close, open }] = useDisclosure();
  return (
    <Paper shadow="xs" radius="md" p="xl" className={classes.card}>
      <Title>{e.otp}</Title>
      {e.issuer ? (
        <Text>
          {e.issuer} ({e.label})
        </Text>
      ) : (
        <Text>{decodeURIComponent(e.label || "")} </Text>
      )}
      <ActionIcon variant="default" className={classes.editIcon} onClick={open}>
        <IconEdit />
      </ActionIcon>

      <ManualModal opened={opened} onClose={close} entity={e} />
    </Paper>
  );
}
