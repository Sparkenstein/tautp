import { createContext, useState } from "react";
import { OtpObject } from "../Pages/Home";

type AppContext = {
  entries: OtpObject[];
  setEntries: (entries: OtpObject[]) => void;
};

export const AppContext = createContext<AppContext>({
  entries: [],
  setEntries: () => {},
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [entries, setEntries] = useState<OtpObject[]>([]);

  return (
    <AppContext.Provider value={{ entries, setEntries }}>
      {children}
    </AppContext.Provider>
  );
};
