import "@mantine/core/styles.css";
import "./styles.css";

import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { RouterProvider, createBrowserRouter } from "react-router-dom";

const App = lazy(() => import("./App"));
const Home = lazy(() => import("./Pages/Home"));
const Signup = lazy(() => import("./Pages/Signup"));
const Login = lazy(() => import("./Pages/Login"));

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
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
      <RouterProvider router={browserRouter} />
    </MantineProvider>
  </React.StrictMode>
);
