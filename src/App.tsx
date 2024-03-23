import { useEffect, useState } from "react";
import { Button, Card, PasswordInput, Stack, Text, Title } from "@mantine/core";

import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { confirm } from "@tauri-apps/api/dialog";
import { store } from "./utils/db";

type User = {
  username: string;
  password: string;
};

function App() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  const validate = async () => {
    if (user) {
      // existing user
      const existing = await store.get<User>("user");
      if (!existing) {
        return;
      }

      if (existing.password === password) {
        navigate("/home", {
          replace: true,
        });
      } else {
        console.log("login failed");
        notifications.show({
          title: "Login failed",
          message: "Invalid password",
          color: "red",
        });
      }
    } else {
      if (password !== password2) {
        notifications.show({
          title: "Create failed",
          message: "Passwords do not match",
          color: "red",
        });
        return;
      }

      if (password.length < 8) {
        const confirmation = await confirm("Password is weak, continue?", {
          okLabel: "I know what I'm doing",
          cancelLabel: "Cancel",
        });
        if (!confirmation) {
          return;
        }
      }
      // new user
      await store.set("user", { username: "user", password });
      await store.save();
      navigate("/home", {
        replace: true,
      });
    }
  };

  useEffect(() => {
    store.get<User>("user").then((data) => {
      console.log("is user", data);
      if (data) {
        setUser(data);
      }
    });
  }, []);

  return (
    <Stack align="center" h="100%" justify="center">
      <Card shadow="sm" p="lg" w="400px">
        <Stack gap={15}>
          <Title order={4}>Welcome</Title>
          <Text c="dimmed" size="xs" mb="md">
            {user
              ? "Enter your password to continue"
              : "Enter a strong password to create an account."}
          </Text>
        </Stack>
        <Stack>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              validate();
            }}
          >
            <Stack>
              <PasswordInput
                placeholder="master password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
              {!user && (
                <PasswordInput
                  placeholder="re-enter password"
                  value={password2}
                  onChange={(e) => setPassword2(e.currentTarget.value)}
                />
              )}
              <Button type="submit" color="brand">
                {user ? "Login" : "Create"}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Stack>
  );
}

export default App;
