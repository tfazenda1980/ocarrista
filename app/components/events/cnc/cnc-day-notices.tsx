"use client";

import type { CncNotice } from "@/app/lib/events/cnc-types";

export function CncDayNotices({ notices }: { notices: CncNotice[] }) {
  const active = notices.filter((notice) => notice.active);
  if (active.length === 0) return null;

  return (
    <div
      className="border-b-2 border-gold-bright bg-gold text-background shadow-[0_8px_28px_rgba(223,190,106,0.45)]"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto max-w-6xl space-y-2 px-4 py-2.5 sm:px-6 sm:py-3">
        {active.map((notice) => (
          <p key={notice.id} className="text-sm font-semibold leading-snug sm:text-base">
            <span className="mr-2 font-display text-[0.65rem] tracking-[0.16em] text-background/75 uppercase">
              Aviso importante
            </span>
            {notice.body}
          </p>
        ))}
      </div>
    </div>
  );
}
