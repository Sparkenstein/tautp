import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Button, Card, PasswordInput, Stack, Text, Title } from "@mantine/core";

import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { confirm } from "@tauri-apps/api/dialog";

type User = {
  username: string;
  hash: string;
};

function App() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  const validate = async () => {
    if (user) {
      // existing user
      const res = await invoke("validate_user", { password });
      if (res === "success") {
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
      const res = await invoke("create_user", { password });
      if (res === "success") {
        navigate("/home", { replace: true });
      } else {
        console.log("create failed");
        notifications.show({
          title: "Create failed",
          message: "Invalid password",
          color: "red",
        });
      }
    }
  };

  useEffect(() => {
    invoke<User | "">("get_user").then((user) => {
      if (user) setUser(user);
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
              <Button type="submit">{user ? "Login" : "Create"}</Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Stack>
  );
}

export default App;
