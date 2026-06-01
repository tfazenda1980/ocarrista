import Link from "next/link";

type AdminAlertBarProps = {
  pendingCount: number;
};

export function AdminAlertBar({ pendingCount }: AdminAlertBarProps) {
  return (
    <div
      className="sticky top-16 z-40 border-b border-gold/30 bg-gold/10 backdrop-blur-md sm:top-[4.5rem]"
      role="status"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <p className="font-mono text-[0.65rem] tracking-wider text-gold uppercase">
          Administrador — pode navegar no site
        </p>
        {pendingCount > 0 ? (
          <Link
            href="/admin/membros?filtro=pending"
            className="font-display text-xs tracking-[0.12em] text-foreground uppercase hover:text-gold"
          >
            <span className="text-gold">{pendingCount}</span> adesão
            {pendingCount === 1 ? "" : "ões"} pendente
            {pendingCount === 1 ? "" : "s"} — rever
          </Link>
        ) : (
          <Link
            href="#admin"
            className="font-display text-xs tracking-[0.12em] text-muted uppercase hover:text-gold"
          >
            Painel de administração
          </Link>
        )}
      </div>
    </div>
  );
}
