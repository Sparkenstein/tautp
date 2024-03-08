import {
  Accordion,
  Button,
  Drawer,
  Stack,
  Switch,
  rem,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  IconMoonStars,
  IconSun,
  IconDeviceLaptop,
  IconBrush,
} from "@tabler/icons-react";

type Props = {
  drawerOpened: boolean;
  closeDrawer: () => void;
};

export const Sidebar = ({ closeDrawer, drawerOpened }: Props) => {
  const { toggleColorScheme } = useMantineColorScheme();

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
      {/* <Stack>
        
        <Button>Backup data</Button>
      </Stack> */}

      <Accordion>
        <Accordion.Item key={"UI"} value={"UI"}>
          <Accordion.Control icon={<IconDeviceLaptop />}>
            {"Appearance"}
          </Accordion.Control>
          <Accordion.Panel>
            <Switch
              size="md"
              color="dark.4"
              onLabel={moonIcon}
              offLabel={sunIcon}
              onChange={toggleColorScheme}
              label="Theme"
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      {/* planned settings:
      1. Export/Import
      2. Change master password
      3. Backup
      4. Spacing between numbers
      5. Dark mode
      6. Auto lock
    
    */}
    </Drawer>
  );
};
