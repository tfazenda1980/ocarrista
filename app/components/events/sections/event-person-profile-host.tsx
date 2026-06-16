"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { EventData } from "../../../lib/events/types";
import {
  resolvePersonProfile,
  type EventPersonProfile,
} from "../../../lib/events/person-profile";
import { EventSpeakerProfileModal } from "./event-speaker-profile-modal";

function profileFromHash(
  event: EventData,
  hash: string,
): EventPersonProfile | null {
  if (hash.startsWith("orador-")) {
    const id = hash.replace("orador-", "");
    const profile = resolvePersonProfile(event, id);
    return profile ? { ...profile, profileLabel: "Orador · Workshop 2026" } : null;
  }

  if (hash.startsWith("moderador-")) {
    const id = hash.replace("moderador-", "");
    const profile = resolvePersonProfile(event, id);
    if (!profile) return null;
    return {
      ...profile,
      profileLabel: "Moderador · Workshop 2026",
      role: profile.role.includes("Moderador")
        ? profile.role
        : `${profile.role} · Moderador`,
    };
  }

  return null;
}

export function EventPersonProfileHost({
  event,
  children,
}: {
  event: EventData;
  children: React.ReactNode;
}) {
  const [selected, setSelected] = useState<EventPersonProfile | null>(null);

  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.slice(1);
      setSelected(profileFromHash(event, hash));
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [event]);

  function closeProfile() {
    if (
      window.location.hash.startsWith("#orador-") ||
      window.location.hash.startsWith("#moderador-")
    ) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    setSelected(null);
  }

  return (
    <>
      {children}
      <AnimatePresence>
        {selected && (
          <EventSpeakerProfileModal speaker={selected} onClose={closeProfile} />
        )}
      </AnimatePresence>
    </>
  );
}
