import { createContext, useEffect, useState } from "react";
import { OtpObject } from "../Pages/Home";
import { store } from "../utils/db";

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

  useEffect(() => {
    async function init() {
      const stored = await store.get<OtpObject[]>("entries");
      if (stored && stored.length > entries.length) {
        setEntries(stored);
      }
    }
    init();
  }, [entries]);

  return (
    <AppContext.Provider value={{ entries, setEntries }}>
      {children}
    </AppContext.Provider>
  );
};
