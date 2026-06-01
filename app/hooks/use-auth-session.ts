"use client";

import { useCallback, useEffect, useState } from "react";

export type AuthSession = {
  authenticated: boolean;
  role?: "admin" | "user";
  name?: string | null;
  email?: string | null;
  gescoAccess?: boolean;
};

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession>({ authenticated: false });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = (await res.json()) as AuthSession;
      setSession(data);
    } catch {
      setSession({ authenticated: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession({ authenticated: false });
  }, []);

  return { session, loading, refresh, logout };
}
