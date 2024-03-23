import "@mantine/core/styles.css";
import "./styles.css";

import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import {
  MantineColorsTuple,
  MantineProvider,
  createTheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import EntryDetails from "./pages/New";
import { AppContextProvider } from "./contexts/AppContext";

const App = lazy(() => import("./App"));
const Home = lazy(() => import("./pages/Home"));
// const EntryDetails = lazy(() => import("./Pages/New")); // FIME: This is not working

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  { path: "/new", element: <EntryDetails /> },
  { path: "/edit/:id", element: <EntryDetails /> },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Main />
);

const myColor: MantineColorsTuple = [
  "#f2f0ff",
  "#e0dff2",
  "#bfbdde",
  "#9b98ca",
  "#7d79ba",
  "#6a65b0",
  "#605bac",
  "#504c97",
  "#464388",
  "#3b3979",
];

const theme = createTheme({
  components: {
    // Button: {
    //   defaultProps: {
    //     color: "brand.9",
    //   },
    // },
  },
  primaryColor: "pink",
  colors: {
    brand: myColor,
  },
});

function Main() {
  return (
    <React.StrictMode>
      <MantineProvider defaultColorScheme={"dark"} theme={theme}>
        <Notifications
          styles={{
            root: {
              top: 20,
              right: 20,
              zIndex: 1000,
              position: "fixed",
            },
          }}
        />
        <AppContextProvider>
          <RouterProvider router={browserRouter} />
        </AppContextProvider>
      </MantineProvider>
    </React.StrictMode>
  );
}
