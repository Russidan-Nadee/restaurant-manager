"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";
import styles from "./QRScanSection.module.css";

export default function PhonePreview() {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const update = () => {
      const width = viewport.clientWidth;
      const height = viewport.clientHeight;
      if (!width || !height) return;
      const scale = width / 393;
      viewport.style.setProperty("--preview-scale", String(scale));
      viewport.style.setProperty("--preview-height", height / scale + "px");
    };
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    update();
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.phoneOverlay} data-phone-preview aria-hidden="true" inert>
      <div className={styles.phoneBackdrop} />
      <div className={styles.phone}>
        <Image src="/landing/iphone-16-pro.png" alt="" fill sizes="(max-width: 600px) 80vw, 380px" className={styles.phoneFrame} />
        <div className={styles.phoneScreen}>
          <div className={styles.phoneStatus} aria-hidden="true"><span>9:41</span><i /><span><Signal size={12} /><Wifi size={12} /><BatteryFull size={15} /></span></div>
          <div ref={viewportRef} className={styles.phoneViewport}>
            <iframe src="/preview/order/001" title="ทดลองเลือกอาหาร โต๊ะ 001 โดยไม่ส่งออร์เดอร์จริง" loading="lazy" sandbox="allow-scripts allow-same-origin" tabIndex={-1} />
          </div>
          <div className={styles.homeIndicator} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
