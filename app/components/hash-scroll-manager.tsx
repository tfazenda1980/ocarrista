"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  restoreScrollPosition,
  saveScrollPosition,
  scrollToSection,
  scrollToSectionWhenReady,
  scrollToTop,
} from "@/app/lib/scroll-to-section";

/**
 * Navegação por âncoras na homepage: scroll ao topo da secção e botão «voltar»
 * restaura posição ou secção anterior.
 */
export function HashScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const currentHash = () => window.location.hash;

    const applyHashScroll = (behavior: ScrollBehavior) => {
      const id = currentHash().replace(/^#/, "");
      if (!id) {
        scrollToTop(behavior);
        return;
      }
      scrollToSectionWhenReady(id, behavior);
    };

    const applyQuerySection = () => {
      const section = new URLSearchParams(window.location.search).get("section");
      if (!section) return false;
      const url = `${window.location.pathname}#${section}`;
      window.history.replaceState(window.history.state, "", url);
      scrollToSectionWhenReady(section, "auto");
      return true;
    };

    const onPopState = () => {
      const hash = currentHash();
      if (restoreScrollPosition(pathname, hash)) return;
      applyHashScroll("auto");
    };

    const onHashChange = () => {
      applyHashScroll("smooth");
    };

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href?.startsWith("#") || href.length < 2) return;

      e.preventDefault();
      const id = href.slice(1);
      saveScrollPosition(pathname, currentHash());
      window.history.pushState({ ocarristaSection: id }, "", `#${id}`);
      scrollToSection(id, "smooth");
    };

    const onDocumentClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (href.startsWith("/") || !href.includes("://")) {
        saveScrollPosition(pathname, currentHash());
      }
    };

    if (!applyQuerySection()) {
      if (currentHash()) {
        applyHashScroll("auto");
      }
    }

    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick);
    document.addEventListener("click", onDocumentClick, true);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick);
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, [pathname]);

  return null;
}
