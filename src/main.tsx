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
import EntryDetails from "./Pages/New";
import { AppContextProvider } from "./Contexts/AppContext";

const App = lazy(() => import("./App"));
const Home = lazy(() => import("./Pages/Home"));
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
  "#e0fbff",
  "#cbf2ff",
  "#9ae2ff",
  "#64d2ff",
  "#3cc5fe",
  "#23bcfe",
  "#09b8ff",
  "#00a1e4",
  "#0090cd",
  "#007cb5",
];

const theme = createTheme({
  colors: {
    myColor,
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
