import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
  Button,
  Card,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { useNavigate } from "react-router-dom";
import { store } from "./Utils/db";
import { notifications } from "@mantine/notifications";

type User = {
  username: string;
  hash: string;
};

function App() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  const validate = async () => {
    let hash = await invoke("get_hash", { password });
    if (user) {
      let { hash: storedHash } = user;

      try {
        let res = await invoke("validate", {
          password,
          hash: storedHash,
        });
        navigate("/home");
      } catch (e) {
        notifications.show({
          title: "Error",
          message: "Error validating password",
          color: "red",
        });
      }
    } else {
      await store.set("user", { username, hash });
      await store.save();
      navigate("/home");
    }
  };

  useEffect(() => {
    store
      .get<User>("user")
      .then((res) => {
        if (res?.username && res?.hash) {
          setUser(res);
        }
      })
      .catch((e) => {
        console.error("user error", e);
      });
  }, []);

  return (
    <Stack align="center" h="100%" justify="center">
      <Card shadow="sm" p="lg">
        <Stack gap={15}>
          <Title order={4}>Welcome</Title>
          {user ? (
            <Text c="dimmed" size="xs">
              Enter username and password to login
            </Text>
          ) : (
            <Text c="dimmed" size="xs" mb="md">
              Enter a username and password to create a new account
            </Text>
          )}
        </Stack>
        <Stack>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              validate();
            }}
          >
            <Stack>
              <TextInput
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
              />
              <PasswordInput
                placeholder="master password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
              <Button type="submit" onClick={() => validate()}>
                Sign up
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Stack>
  );
}

export default App;
