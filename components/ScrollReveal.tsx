"use client";

import { useEffect, useRef } from "react";

/**
 * ScrollReveal — wraps children in an observed container.
 * Adds class "revealed" to each .reveal-item child when it enters viewport.
 * CSS in globals.css handles the actual transition.
 */
export default function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || typeof IntersectionObserver === "undefined") {
      // Fallback: just show everything
      container?.querySelectorAll<HTMLElement>(".reveal-item").forEach((el) => {
        el.classList.add("revealed");
      });
      return;
    }

    const items = container.querySelectorAll<HTMLElement>(".reveal-item");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
