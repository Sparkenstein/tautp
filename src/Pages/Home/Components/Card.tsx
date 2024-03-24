import {
  ActionIcon,
  Avatar,
  CopyButton,
  Flex,
  Group,
  Paper,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import classes from "../Home.module.css";
import { IconCheck, IconCopy, IconEdit } from "@tabler/icons-react";
import { OtpObject } from "..";
import { clipboard } from "@tauri-apps/api";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToggle } from "@mantine/hooks";

type CardProps = {
  e: OtpObject;
};

export function Card({ e }: CardProps) {
  const nav = useNavigate();

  const [isBlur, toggle] = useToggle([false, true]);

  const blur = () => {
    toggle();
  };

  useEffect(() => {
    document.addEventListener("blur", blur);

    return () => {
      document.removeEventListener("blur", blur);
    };
  }, []);

  return (
    <Paper
      withBorder
      shadow="xs"
      radius="md"
      p="xl"
      className={classes.card}
      h="100%"
      style={{
        overflow: "hidden",
      }}
    >
      {/* show otp in group of 2's */}
      <Group gap="lg" wrap="nowrap">
        <Avatar radius="md" size={"xl"} color={e.icon}>
          {e.issuer ? e.issuer[0].toUpperCase() : e.label[0].toUpperCase()}
        </Avatar>
        <Flex wrap="nowrap" direction={"column"}>
          <Title
            textWrap="nowrap"
            className={isBlur ? classes.blur : undefined}
          >
            {e.otp?.replace(/(\d)(?=(\d{2})+(?!\d))/g, "$1 ")}
          </Title>
          {e.issuer ? (
            <>
              <Text fw="bolder" size="16px" pt="5px">
                {decodeURIComponent(e.issuer)}
              </Text>
              <Tooltip label={e.label} position="bottom">
                <Text size="sm">{decodeURIComponent(e.label || "")}</Text>
              </Tooltip>
            </>
          ) : (
            <Tooltip label={e.label} position="bottom">
              <Text>{decodeURIComponent(e.label || "")} </Text>
            </Tooltip>
          )}
        </Flex>
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
