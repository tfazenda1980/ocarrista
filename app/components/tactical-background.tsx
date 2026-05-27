export function TacticalBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 tactical-grid opacity-60" />
      <div className="absolute inset-0 military-map-overlay opacity-20" />
      <div className="absolute inset-0 tactical-vignette" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />
      <div className="absolute top-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/30 to-transparent animate-pulse-gold" />
      <div className="absolute -top-32 left-1/2 h-64 w-[55rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[90px]" />
      <div className="absolute bottom-[-20%] right-[-8%] h-72 w-72 rounded-full bg-gold/10 blur-[120px]" />
    </div>
  );
}
