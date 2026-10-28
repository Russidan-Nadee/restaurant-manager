"use client";

import { useState } from "react";
import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import styles from "./page.module.css";

export default function MenuItemImage({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const canShowImage = imageUrl && /^https?:\/\//i.test(imageUrl) && imageUrl !== failedUrl;

  return (
    <div className={styles.foodMedia}>
      {canShowImage ? (
        <Image
          className={styles.foodImage}
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 360px) 100vw, (max-width: 600px) 50vw, 480px"
          unoptimized
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <div className={styles.foodPlaceholder} role="img" aria-label={"รูปอาหารยังไม่พร้อมสำหรับ " + name}>
          <UtensilsCrossed size={32} strokeWidth={1.3} aria-hidden="true" />
          <span>รูปอาหารยังไม่พร้อม</span>
        </div>
      )}
    </div>
  );
}
