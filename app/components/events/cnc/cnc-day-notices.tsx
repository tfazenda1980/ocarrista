"use client";

import type { CncNotice } from "@/app/lib/events/cnc-types";

export function CncDayNotices({ notices }: { notices: CncNotice[] }) {
  const active = notices.filter((notice) => notice.active);
  if (active.length === 0) return null;

  return (
    <div className="max-w-2xl space-y-3" role="status" aria-live="polite">
      {active.map((notice) => (
        <div
          key={notice.id}
          className="border-2 border-gold-bright bg-gold px-4 py-3 text-background shadow-[0_0_28px_rgba(223,190,106,0.55)] sm:px-5 sm:py-4"
        >
          <p className="font-display text-[0.7rem] tracking-[0.18em] text-background/80 uppercase">
            Aviso importante
          </p>
          <p className="mt-1 text-base font-semibold leading-snug sm:text-lg">{notice.body}</p>
        </div>
      ))}
    </div>
  );
}
