import Link from "next/link";
import Image from "next/image";
import styles from "@/app/page.module.css";

export default function LivePreview({ title, src, href }: { title: string; src: string; href: string }) {
  return (
    <div className={styles.livePreview}>
      <div className={styles.ipadStage}>
        <div className={styles.previewViewport}>
          <iframe
            src={src}
            title={`ตัวอย่าง${title}`}
            loading="lazy"
            sandbox="allow-same-origin"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
        <Image
          src="/landing/ipad-landscape.png"
          alt=""
          fill
          sizes="(max-width: 759px) 88vw, (max-width: 1340px) 43vw, 560px"
          className={styles.ipadFrame}
        />
      </div>
      <Link href={href} prefetch={false} target="_blank" rel="noopener noreferrer" className={styles.previewLink} aria-label={`เปิด${title}เต็มหน้า ในแท็บใหม่`}>
        เปิดดูเต็มหน้า
      </Link>
    </div>
  );
}
