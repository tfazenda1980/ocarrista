import Link from "next/link";

type StickyBackLinkProps = {
  href: string;
  /** Texto acessível e visível em ecrãs maiores */
  label: string;
  /** Com barra de anos do workshop (header + edition bar) */
  variant?: "default" | "workshop" | "stacked";
};

export function StickyBackLink({
  href,
  label,
  variant = "default",
}: StickyBackLinkProps) {
  const variantClass =
    variant === "workshop"
      ? "back-nav-fixed--workshop"
      : variant === "stacked"
        ? "back-nav-fixed--stacked"
        : "";

  return (
    <Link
      href={href}
      className={`back-nav-fixed group ${variantClass}`}
      aria-label={label}
    >
      <span className="back-nav-fixed-arrow" aria-hidden>
        ←
      </span>
      <span className="back-nav-fixed-label">{label}</span>
    </Link>
  );
}
