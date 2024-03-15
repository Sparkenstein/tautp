import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Divider,
  Group,
  Stack,
  TextInput,
} from "@mantine/core";
import { parseOTPAuthURL } from "../../Utils/parseOtpAuthURL";
import { useInputState, useMediaQuery } from "@mantine/hooks";
import { useContext, useState, useEffect } from "react";
import { TOTP } from "totp-generator";
import { AppContext } from "../../Contexts/AppContext";
import { recordEntities, deleteEntity } from "../../Utils/recordEntity";
import { OtpObject } from "../Home";
import { useNavigate, useParams } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";

const colorshade = [4, 5, 6, 7, 8, 9];

export const colors = [
  "gray",
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "green",
  "lime",
  "yellow",
  "orange",
  "teal",
].map(
  (c) => `${c}.${colorshade[Math.floor(Math.random() * colorshade.length)]}`
);

function EntryDetails() {
  const { entries, setEntries } = useContext(AppContext);
  const [entity, setEntity] = useState<OtpObject | null>(null);
  const [label, setLabel] = useInputState(entity?.label || "");
  const [secret, setSecret] = useInputState(entity?.secret || "");
  const [issuer, setIssuer] = useInputState(entity?.issuer || "");

  const nav = useNavigate();
  const params = useParams<{ id: string }>();

  // TODO: add support for these
  const algorithm = "SHA-1";
  const digits = "6";
  const period = "30";

  const isEditing = !!entity;

  const [uri, setUri] = useState("");
  const [color, setColor] = useState(entity?.icon || "blue");

  const breakpoint = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (params.id !== undefined && entries.length > 0) {
      const e = entries.find((e) => e.id === parseInt(params.id ?? ""));
      console.log(e);
      if (e) {
        setEntity(e);
        setLabel(e.label);
        setSecret(e.secret);
        setIssuer(e.issuer);
        setColor(e.icon || "blue");
      }
    }
  }, [params.id]);

  const saveManual = async () => {
    if (isEditing) {
      const changed = entries.map((e) => {
        if (e.id === entity?.id) {
          return {
            ...e,
            label,
            issuer,
            secret,
          };
        }
        return e;
      });
      await recordEntities(changed, label, secret, true);
      setEntries(changed);
      //   onClose();
      nav("/home", { replace: true });
      return;
    }

    let newEntry: OtpObject = {
      label,
      issuer,
      algorithm,
      digits,
      period,
      id: entries.length + 1,
      secret,
      counter: "0",
      icon: color,
      otp: TOTP.generate(secret).otp,
    };
    const newEntries = [...entries, { ...newEntry }];
    await recordEntities([...newEntries], label, secret);
    setEntries(newEntries);
    // onClose();
    nav("/home", { replace: true });
  };

  const deleteEntry = async () => {
    const confirmation = await confirm(
      "Deleting entry is irreversible. Are you sure?"
    );
    if (confirmation) {
      const remaining = await deleteEntity(entity!);
      setEntries(remaining);
    }
    nav("/home", { replace: true });
    // onClose();
  };

  return (
    <Group justify="center" p="md" align="start">
      <Box pos={"absolute"} left={20}>
        <ActionIcon
          variant="transparent"
          color="gray"
          onClick={() => {
            nav("/home", { replace: true });
          }}
        >
          <IconArrowLeft />
        </ActionIcon>
      </Box>
      <Group p="xl">
        <Avatar size={breakpoint ? 320 : "xl"} color={color} radius={"md"}>
          {label[0]?.toUpperCase()}
        </Avatar>
      </Group>
      <Stack p="xl" w={breakpoint ? "40%" : "100%"}>
        {!isEditing && (
          <>
            {" "}
            <TextInput
              label="URI"
              required
              placeholder={"otpauth://totp/label?secret=secret"}
              value={uri}
              onChange={(e) => {
                setUri(e.currentTarget.value);
                const parsed = parseOTPAuthURL(e.currentTarget.value);
                setLabel(parsed.label);
                setSecret(parsed.secret);
                setIssuer(parsed.issuer);
              }}
            />
            <Divider label="or" />
          </>
        )}

        <TextInput
          label="Label"
          required
          placeholder="Label"
          value={label}
          onChange={(e) => {
            setColor(colors[Math.floor(Math.random() * colors.length)]);
            setLabel(e);
          }}
          disabled={isEditing}
        />

        <TextInput
          label="Issuer"
          placeholder="Issuer"
          value={issuer}
          onChange={setIssuer}
        />
        <TextInput
          label="Secret"
          required
          placeholder="Secret"
          value={secret}
          onChange={setSecret}
        />

        <Button onClick={saveManual} variant="light">
          Add
        </Button>
        {isEditing && (
          <Button color="red" onClick={deleteEntry} variant="light">
            Delete
          </Button>
        )}
      </Stack>
    </Group>
  );
}

export default EntryDetails;
