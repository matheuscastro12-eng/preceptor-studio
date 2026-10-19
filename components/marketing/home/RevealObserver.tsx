"use client";

import { useEffect } from "react";

/*
 * Um único IntersectionObserver para todos os [data-rv] da home. Marca a raiz
 * com .js-ready no mount: o CSS só esconde os blocos depois disso, para que
 * nada suma quando o JavaScript não roda.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.querySelector(".lp2");
    if (!root) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".lp2 [data-rv]"));

    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    root.classList.add("js-ready");

    return () => obs.disconnect();
  }, []);

  return null;
}
