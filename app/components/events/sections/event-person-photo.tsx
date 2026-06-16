"use client";

import { useState } from "react";

function PersonInitials({ name }: { name: string }) {
  const parts = name.split(" ").filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : name.slice(0, 2);
  return (
    <span className="font-display text-2xl font-bold text-gold uppercase">
      {initials}
    </span>
  );
}

export function EventPersonPhoto({
  image,
  name,
  className = "h-full w-full object-cover object-[center_12%] transition-transform duration-500 group-hover:scale-[1.03]",
}: {
  image?: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return <PersonInitials name={name} />;
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={name}
        className={className}
        onError={() => setFailed(true)}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-transparent"
        aria-hidden
      />
    </>
  );
}
