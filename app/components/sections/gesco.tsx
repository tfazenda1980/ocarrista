"use client";

import { SectionShell } from "../section-shell";
import { IconPlatform } from "../icons";
import { gescoExternalLink } from "../../lib/gesco";
import { useT } from "../i18n/locale-provider";

export function GescoSection() {
  const { t, messages } = useT();
  const features = messages.gesco.features;

  return (
    <SectionShell
      id="gesco"
      label={t("gesco.label")}
      title={t("gesco.title")}
      description={t("gesco.description")}
      alt
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="card-tactical relative overflow-hidden border-gold/25 p-1">
          <div className="border border-gold/10 bg-surface-elevated p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-gold/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-gold/40 text-gold">
                  <IconPlatform />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold tracking-wider uppercase">
                    {t("gesco.title")}
                  </p>
                  <p className="font-mono text-[0.6rem] text-muted">{t("gesco.subtitle")}</p>
                </div>
              </div>
              <span className="flex items-center gap-2 font-mono text-[0.65rem] text-gold">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                {t("gesco.internal")}
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {[
                { cmd: "status", out: t("gesco.cmd1") },
                { cmd: "competencias --sync", out: t("gesco.cmd2") },
                { cmd: "prontidao --report", out: t("gesco.cmd3") },
              ].map((line) => (
                <div key={line.cmd} className="rounded border border-gold/10 bg-background/60 p-3">
                  <p className="text-gold">
                    <span className="text-muted">$</span> {line.cmd}
                  </p>
                  <p className="mt-1 text-muted">{line.out}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-4 font-display text-sm tracking-[0.12em] text-gold uppercase">
            {t("gesco.platform")}
          </p>
          <p className="mb-8 leading-relaxed text-muted">{t("gesco.body")}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.label}
                className="border border-gold/12 bg-surface/80 p-4 transition-colors hover:border-gold/30"
              >
                <h4 className="font-display text-xs font-semibold tracking-[0.12em] text-gold uppercase">
                  {f.label}
                </h4>
                <p className="mt-1 text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-muted/90">{t("gesco.accessNote")}</p>
          <a {...gescoExternalLink} className="btn-outline mt-4 inline-flex">
            {t("gesco.cta")}
          </a>
        </div>
      </div>
    </SectionShell>
  );
}
