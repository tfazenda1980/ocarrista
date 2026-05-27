import { type ReactNode } from "react";
import { MotionReveal } from "./motion-reveal";

type SectionShellProps = {
  id: string;
  label: string;
  title: string;
  description: string;
  children: ReactNode;
  alt?: boolean;
};

export function SectionShell({
  id,
  label,
  title,
  description,
  children,
  alt = false,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-20 py-20 sm:py-28 ${alt ? "bg-surface/45" : ""}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal className="mb-12 max-w-2xl sm:mb-16">
          <p className="section-label mb-3">{label}</p>
          <h2 className="display-heading mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
            {title}
          </h2>
          <div className="gold-line mb-6 w-24" />
          <p className="text-base leading-relaxed text-muted sm:text-lg">
            {description}
          </p>
        </MotionReveal>
        {children}
      </div>
    </section>
  );
}
