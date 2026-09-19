"use client";

import type { CncNotice } from "@/app/lib/events/cnc-types";

export function CncDayNotices({ notices }: { notices: CncNotice[] }) {
  const active = notices.filter((notice) => notice.active);
  if (active.length === 0) return null;

  return (
    <div className="sticky top-16 z-40 border-b border-amber-500/35 bg-amber-950/90 backdrop-blur-md sm:top-[4.25rem]">
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-3 sm:px-6">
        {active.map((notice) => (
          <p key={notice.id} className="text-sm leading-relaxed text-amber-50">
            <span className="mr-2 font-display text-[0.65rem] tracking-[0.16em] text-amber-200 uppercase">
              Aviso do dia
            </span>
            {notice.body}
          </p>
        ))}
      </div>
    </div>
  );
}
