"use client";

import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import PhonePreview from "./PhonePreview";
import styles from "./QRScanSection.module.css";

export default function QRScanSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      section.dataset.active = String(entry.isIntersecting);
    }, { threshold: 0.05 });
    observer.observe(section);
    const overlay = section.querySelector<HTMLElement>("[data-phone-preview]");
    const iframe = overlay?.querySelector("iframe");
    let frame = 0;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const update = () => {
      frame = 0;
      if (document.hidden || !stageRef.current) return;
      const viewport = window.innerHeight;
      const bounds = section.getBoundingClientRect();
      const qr = stageRef.current.getBoundingClientRect();
      const enter = clamp((viewport * 0.55 - (qr.top + qr.height / 2)) / (viewport * 0.3));
      const leave = clamp((bounds.bottom - viewport * 0.25) / (viewport * 0.45));
      const reveal = Math.min(enter, leave);
      section.style.setProperty("--phone-reveal", reveal.toFixed(4));
      section.dataset.phoneVisible = String(reveal > 0);
      const interactive = reveal >= 0.98;
      section.dataset.phoneInteractive = String(interactive);
      if (overlay) {
        overlay.inert = !interactive;
        overlay.setAttribute("aria-hidden", String(!interactive));
      }
      if (iframe) iframe.tabIndex = interactive ? 0 : -1;
    };
    const schedule = () => {
      if (!frame && !document.hidden) frame = window.requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, []);

  return (
    <section id="customer-flow" ref={sectionRef} className={styles.section} aria-labelledby="customer-flow-title">
      <div className={styles.layout}>
        <div className={styles.copy} data-reveal>
          <h2 id="customer-flow-title">สิ่งที่ลูกค้าของคุณ<span>จะได้เห็น.</span></h2>
          <p className={styles.lead}>จาก QR บนโต๊ะ สู่เมนูบนมือถือ</p>
          <p className={styles.description}>เปิดเมนู เลือกอาหาร และส่งออร์เดอร์ได้จากมือถือของตัวเอง</p>
        </div>
        <div className={styles.stage} ref={stageRef}>
          <div className={styles.halo} aria-hidden="true" />
          <div className={styles.plate}>
            <div className={styles.brand} aria-hidden="true">Your name<span>Restaurant</span></div>
            <div className={styles.scanner} role="img" aria-label="ภาพจำลอง QR Code พร้อมแสงสแกนวนลูป">
              <div className={styles.code} aria-hidden="true">
                <QRCodeSVG value="Your name Restaurant | QR ordering demonstration" size={256} level="M" marginSize={4} bgColor="#ffffff" fgColor="#142033" />
              </div>
              <span className={styles.corner} data-corner="tl" aria-hidden="true" />
              <span className={styles.corner} data-corner="tr" aria-hidden="true" />
              <span className={styles.corner} data-corner="bl" aria-hidden="true" />
              <span className={styles.corner} data-corner="br" aria-hidden="true" />
              <div className={styles.scanWindow} aria-hidden="true"><span className={styles.scanBeam} /></div>
            </div>
            <p className={styles.scanLabel}>SCAN TO ORDER</p>
            <p className={styles.demoLabel}>ตัวอย่าง QR Code</p>
          </div>
          <span className={styles.caption}>ประสบการณ์สั่งอาหาร เริ่มต้นที่โต๊ะของคุณ</span>
        </div>
      </div>
      <div className={styles.scrollRunway} aria-hidden="true" />
      <PhonePreview />
    </section>
  );
}
