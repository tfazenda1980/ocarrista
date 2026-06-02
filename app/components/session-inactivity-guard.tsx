"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "../hooks/use-auth-session";

/** Termina sessão de membro ou admin após inatividade (consultor normal). */
const IDLE_MS = 2 * 60 * 1000;

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

export function SessionInactivityGuard() {
  const { session, logout } = useAuthSession();
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loggingOutRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleIdle = useCallback(async () => {
    if (loggingOutRef.current || !session.authenticated) return;
    loggingOutRef.current = true;
    clearTimer();
    await logout();
    router.refresh();
    loggingOutRef.current = false;
  }, [session.authenticated, logout, router, clearTimer]);

  const resetTimer = useCallback(() => {
    if (!session.authenticated) {
      clearTimer();
      return;
    }
    clearTimer();
    timerRef.current = setTimeout(() => {
      void handleIdle();
    }, IDLE_MS);
  }, [session.authenticated, clearTimer, handleIdle]);

  useEffect(() => {
    if (!session.authenticated) {
      clearTimer();
      return;
    }

    resetTimer();

    const onActivity = () => resetTimer();

    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, onActivity, { passive: true });
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        resetTimer();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimer();
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, onActivity);
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [session.authenticated, resetTimer, clearTimer]);

  return null;
}
