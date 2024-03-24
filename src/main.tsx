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
  "#ffeaf3",
  "#fdd4e1",
  "#f4a7bf",
  "#ec779c",
  "#e64f7e",
  "#e3356b",
  "#e22762",
  "#c91a52",
  "#b41149",
  "#9f003e",
];

const theme = createTheme({
  components: {
    // Button: {
    //   defaultProps: {
    //     color: "brand.9",
    //   },
    // },
  },
  primaryColor: "brand",
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
