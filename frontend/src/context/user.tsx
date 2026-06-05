// Current-user (selected profile) context, backed by localStorage via api.ts.
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { getStoredUserId, setStoredUserId } from "../lib/api";

interface UserContextValue {
  userId: string | null;
  setUserId: (id: string | null) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(getStoredUserId());

  const value = useMemo<UserContextValue>(
    () => ({
      userId,
      setUserId: (id) => {
        setStoredUserId(id);
        setUserIdState(id);
      },
    }),
    [userId],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}
