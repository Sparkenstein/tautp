import { ActionIcon, Button, Group, TextInput } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { Sidebar } from "../../../Components/Sidebar";
import { useDisclosure } from "@mantine/hooks";

type NavbarProps = {
  openMainModal: () => void;
  search: string;
  setSearch: (s: string) => void;
};

export function Navbar({ openMainModal, search, setSearch }: NavbarProps) {
  const [drawerOpened, { open, close }] = useDisclosure();
  return (
    <Group p="md" justify="space-around" wrap="nowrap" pt="xl">
      <ActionIcon variant="light" onClick={open}>
        <IconSettings />
      </ActionIcon>
      <TextInput
        radius={"sm"}
        placeholder="Search"
        value={search}
        flex={1}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <Button rightSection={"+"} onClick={openMainModal} variant="light">
        Add New{" "}
      </Button>

      <Sidebar closeDrawer={close} drawerOpened={drawerOpened} />
    </Group>
  );
}
