/** Compensa header fixo (alinhar com scroll-mt-20 das secções). */
export const SECTION_SCROLL_OFFSET = 88;

export function scrollToSection(
  id: string,
  behavior: ScrollBehavior = "auto",
): boolean {
  const el = document.getElementById(id);
  if (!el) return false;

  const top =
    el.getBoundingClientRect().top + window.scrollY - SECTION_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

export function scrollToTop(behavior: ScrollBehavior = "auto") {
  window.scrollTo({ top: 0, behavior });
}

const STORAGE_PREFIX = "ocarrista-scroll:";

export function scrollStorageKey(pathname: string, hash: string) {
  return `${STORAGE_PREFIX}${pathname}${hash || ""}`;
}

export function saveScrollPosition(pathname: string, hash: string) {
  try {
    sessionStorage.setItem(
      scrollStorageKey(pathname, hash),
      String(window.scrollY),
    );
  } catch {
    /* ignore */
  }
}

export function restoreScrollPosition(
  pathname: string,
  hash: string,
): boolean {
  try {
    const raw = sessionStorage.getItem(scrollStorageKey(pathname, hash));
    if (raw == null) return false;
    window.scrollTo({ top: Number(raw), behavior: "auto" });
    return true;
  } catch {
    return false;
  }
}

/** Espera secção existir no DOM (ex.: Loja após login). */
export function scrollToSectionWhenReady(
  id: string,
  behavior: ScrollBehavior = "auto",
  maxAttempts = 40,
): void {
  let attempts = 0;
  const tick = () => {
    if (scrollToSection(id, behavior)) return;
    attempts += 1;
    if (attempts < maxAttempts) requestAnimationFrame(tick);
  };
  tick();
}
