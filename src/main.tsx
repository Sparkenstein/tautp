import "@mantine/core/styles.css";
import "./styles.css";

import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./Contexts/AppContext";

const App = lazy(() => import("./App"));
const Home = lazy(() => import("./Pages/Home"));

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/home",
    element: <Home />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme={"dark"}>
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
