import {
  Button,
  Divider,
  Drawer,
  Group,
  Stack,
  Switch,
  rem,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMoonStars, IconSun } from "@tabler/icons-react";
import { ImportModal } from "./Modals/ImportModal";

type Props = {
  drawerOpened: boolean;
  closeDrawer: () => void;
};

export const Sidebar = ({ closeDrawer, drawerOpened }: Props) => {
  const { toggleColorScheme } = useMantineColorScheme();

  const [importOpen, { close: closeImport, open: openImport }] =
    useDisclosure();

  const theme = useMantineTheme();

  const sunIcon = (
    <IconSun
      style={{ width: rem(16), height: rem(16) }}
      stroke={2.5}
      color={theme.colors.yellow[4]}
    />
  );

  const moonIcon = (
    <IconMoonStars
      style={{ width: rem(16), height: rem(16) }}
      stroke={2.5}
      color={theme.colors.blue[6]}
    />
  );

  return (
    <Drawer
      offset={8}
      radius={"md"}
      //   size={"xs"}
      opened={drawerOpened}
      onClose={closeDrawer}
      title="Settings"
    >
      <Stack>
        <Switch
          size="md"
          color="dark.4"
          onLabel={moonIcon}
          offLabel={sunIcon}
          onChange={toggleColorScheme}
          label="Theme"
        />
        <Divider />
        <Group>
          <Button onClick={openImport}>Import</Button>
        </Group>
      </Stack>
      {/* planned settings:
      1. Export/Import
      2. Change master password
      3. Backup
      4. Spacing between numbers
      5. Dark mode
      6. Auto lock
    
    */}

      <ImportModal isOpen={importOpen} onClose={closeImport} />
    </Drawer>
  );
};
