import {
  ActionIcon,
  Avatar,
  Box,
  CopyButton,
  Group,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import classes from "../Home.module.css";
import { IconCheck, IconCopy, IconEdit } from "@tabler/icons-react";
import { OtpObject } from "..";
import { clipboard } from "@tauri-apps/api";
import { useNavigate } from "react-router-dom";

type CardProps = {
  e: OtpObject;
};

export function Card({ e }: CardProps) {
  const nav = useNavigate();
  // const [opened, { close, open }] = useDisclosure();
  return (
    <Paper shadow="xs" radius="md" p="xl" className={classes.card}>
      {/* show otp in group of 2's */}
      <Group gap="lg">
        <Avatar radius="md" size={"xl"} color={e.icon}>
          {e.label[0].toUpperCase()}
        </Avatar>
        <Box flex={1}>
          <Title>{e.otp?.replace(/(\d)(?=(\d{2})+(?!\d))/g, "$1 ")}</Title>
          {e.issuer ? (
            <Text>
              {decodeURIComponent(e.issuer)} (
              {decodeURIComponent(e.label || "")})
            </Text>
          ) : (
            <Text>{decodeURIComponent(e.label || "")} </Text>
          )}
        </Box>
      </Group>
      <ActionIcon
        variant="light"
        className={classes.editIcon}
        onClick={() => nav(`/edit/${e.id}`, { replace: true })}
      >
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
    </Paper>
  );
}
