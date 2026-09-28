"use client";

import { MotionReveal } from "../../motion-reveal";
import type { ImgcEventData, ImgcLink, ImgcLinkCategory } from "@/app/lib/events/imgc-types";
import { useT } from "../../i18n/locale-provider";

const CATEGORY_ORDER: ImgcLinkCategory[] = ["tomar", "transport", "stay", "other"];

function groupLinks(links: ImgcLink[]) {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: links.filter((link) => link.category === category),
  })).filter((group) => group.items.length > 0);
}

export function ImgcDiscoverTomar({ event }: { event: ImgcEventData }) {
  const { t } = useT();
  const groups = groupLinks(event.links);

  const titleFor = (category: ImgcLinkCategory) => {
    if (category === "tomar") return t("imgc.linkTomar");
    if (category === "transport") return t("imgc.linkTransport");
    if (category === "stay") return t("imgc.linkStay");
    return t("imgc.linkOther");
  };

  return (
    <section id="tomar" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">{t("imgc.tomarLabel")}</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            {t("imgc.tomarTitle")}
          </h2>
          <div className="gold-line mb-6 w-24" />
          <p className="mb-12 max-w-2xl text-sm leading-relaxed text-muted">{t("imgc.tomarIntro")}</p>
        </MotionReveal>

        {groups.length === 0 ? (
          <p className="text-sm text-muted">{t("imgc.tomarEmpty")}</p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            {groups.map((group, gi) => (
              <MotionReveal key={group.category} delay={gi * 0.06}>
                <h3 className="font-display mb-4 text-lg tracking-wide text-gold uppercase">
                  {titleFor(group.category)}
                </h3>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item.id} className="card-tactical p-5">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-display text-sm tracking-wide text-foreground uppercase hover:text-gold"
                      >
                        {item.title} →
                      </a>
                      {item.description && (
                        <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </MotionReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
