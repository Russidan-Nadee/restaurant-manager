"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import styles from "@/app/page.module.css";

export default function LandingMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1000px) and (min-height: 680px)");
    const hero = root.querySelector<HTMLElement>("[data-hero]");
    const story = root.querySelector<HTMLElement>("[data-story]");
    const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
    const sheets = Array.from(root.querySelectorAll<HTMLElement>("[data-sheet]"));
    let frame = 0;
    let enabled = false;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));

    const update = () => {
      frame = 0;
      if (!enabled || document.hidden) return;
      if (hero) {
        const bounds = hero.getBoundingClientRect();
        const progress = clamp(-bounds.top / Math.max(1, bounds.height));
        hero.style.setProperty("--hero-progress", String(progress));
        hero.dataset.inView = String(bounds.bottom > 0 && bounds.top < window.innerHeight);
      }
      if (story) {
        const bounds = story.getBoundingClientRect();
        const progress = desktop.matches ? clamp((86 - bounds.top) / Math.max(1, bounds.height - window.innerHeight)) : 0;
        const active = Math.min(3, Math.floor(progress * 4));
        story.dataset.activeStep = String(active);
        steps.forEach((step, index) => { step.dataset.current = String(index === active); });
        sheets.forEach((sheet, index) => {
          sheet.style.setProperty("--sheet-offset", String(index - active));
          sheet.dataset.current = String(index === active);
          sheet.dataset.past = String(index < active);
        });
      }
    };
    const schedule = () => { if (!frame && enabled && !document.hidden) frame = window.requestAnimationFrame(update); };
    const configure = () => {
      enabled = !paused && !preference.matches;
      root.dataset.motion = enabled ? "on" : "off";
      root.dataset.desktopMotion = String(enabled && desktop.matches);
      if (!enabled) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        hero?.style.removeProperty("--hero-progress");
      } else schedule();
    };
    const visibility = () => {
      root.dataset.pageHidden = String(document.hidden);
      if (document.hidden && frame) { window.cancelAnimationFrame(frame); frame = 0; }
      else schedule();
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(element => observer.observe(element));
    configure();
    visibility();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    preference.addEventListener("change", configure);
    desktop.addEventListener("change", configure);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", configure);
      desktop.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", visibility);
      delete root.dataset.motion;
      delete root.dataset.desktopMotion;
    };
  }, [paused]);

  return <div className={styles.page} ref={rootRef}>{children}<button type="button" className={styles.motionToggle} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}<span>{paused ? "เปิดแอนิเมชัน" : "พักแอนิเมชัน"}</span></button></div>;
}
