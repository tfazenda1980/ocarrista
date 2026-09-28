"use client";

import { useEffect, useState } from "react";
import { useT } from "../i18n/locale-provider";

type CountdownProps = {
  targetDate: string;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calcTimeLeft(target: number): TimeLeft | null {
  const diff = target - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function EventCountdown({ targetDate }: CountdownProps) {
  const { t } = useT();
  const target = new Date(targetDate).getTime();
  const [left, setLeft] = useState<TimeLeft | null>(() => calcTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setLeft(calcTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!left) {
    return (
      <p className="font-display text-sm tracking-[0.2em] text-gold uppercase">
        {t("common.countdownDone")}
      </p>
    );
  }

  const units = [
    { label: t("common.days"), value: left.days },
    { label: t("common.hours"), value: left.hours },
    { label: t("common.minutes"), value: left.minutes },
    { label: t("common.seconds"), value: left.seconds },
  ];

  return (
    <div className="flex flex-wrap gap-3 sm:gap-4">
      {units.map((u) => (
        <div
          key={u.label}
          className="event-countdown-unit min-w-[4.5rem] border border-gold/25 bg-background/60 px-3 py-2 text-center backdrop-blur-sm sm:min-w-[5rem] sm:px-4 sm:py-3"
        >
          <span className="font-display block text-2xl font-bold text-gold sm:text-3xl">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="font-mono text-[0.55rem] tracking-wider text-muted uppercase">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
