import { Clock3, MapPin, Phone } from "lucide-react";
import { restaurantLocation as location } from "./location";
import styles from "@/app/page.module.css";

function googleMapsUrl(value: string, embed = false): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    const validHost = url.hostname === "www.google.com" || url.hostname === "maps.google.com";
    const validPath = embed ? /^\/maps\/embed(?:\/|$)/.test(url.pathname) : /^\/maps(?:\/|$)/.test(url.pathname);
    return url.protocol === "https:" && validHost && validPath ? url.href : undefined;
  } catch { return undefined; }
}

export default function LocationSection() {
  const embedUrl = googleMapsUrl(location.googleMapsEmbedUrl, true);
  const directionsUrl = googleMapsUrl(location.googleMapsDirectionsUrl);
  const phoneUrl = /^tel:\+?[\d -]+$/.test(location.phoneHref) ? location.phoneHref : undefined;

  return <section id="visit" className={styles.visit} aria-labelledby="visit-title">
    <div className={styles.visitCopy} data-reveal><h2 id="visit-title">Google Map<span>ร้านของคุณ</span></h2><p className={styles.visitIntro}>เว็บของร้านใส่แผนที่ เวลาเปิด–ปิด และช่องทางติดต่อได้<br />ด้านข้างคือตัวอย่างส่วนข้อมูลร้านบนเว็บไซต์ของคุณ</p>
      <dl className={styles.contactDetails}>
        <div><dt><MapPin size={19} aria-hidden="true" /> ที่อยู่ร้าน</dt><dd>{location.address || "รอเพิ่มที่อยู่จริงของร้าน"}</dd></div>
        <div><dt><Clock3 size={19} aria-hidden="true" /> เวลาทำการ</dt><dd>{location.openingHours || "รอระบุวันและเวลาเปิด–ปิด"}</dd></div>
        <div><dt><Phone size={19} aria-hidden="true" /> ติดต่อร้าน</dt><dd>{phoneUrl && location.phoneDisplay ? <a href={phoneUrl}>{location.phoneDisplay}</a> : location.phoneDisplay || "รอเพิ่มหมายเลขติดต่อ"}</dd></div>
      </dl>
      {directionsUrl ? <a className={styles.primaryButton} href={directionsUrl} target="_blank" rel="noopener noreferrer">ดูตัวอย่างการนำทาง</a> : null}
    </div>
    <div className={styles.mapFrame} data-reveal>{embedUrl ? <iframe title="แผนที่ Your name Restaurant บน Google Maps" src={embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /> : <div className={styles.mapPlaceholder} role="img" aria-label="แผนที่จำลองสำหรับวาง Google Maps ยังไม่ใช่ตำแหน่งจริงของร้าน">
      <svg className={styles.mapArtwork} viewBox="0 0 640 620" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="640" height="620" fill="#e9e7dc" /><g fill="#dfe3d2"><rect x="30" y="35" width="160" height="120" rx="20"/><rect x="440" y="370" width="170" height="190" rx="26"/><rect x="55" y="400" width="100" height="115" rx="14"/></g><g stroke="#f9f8f1" strokeWidth="23"><path d="M-30 180 680 60M-30 370 680 250M-30 560 680 440M120-30 250 650M380-30 510 650M-40 280 680 570"/></g><path d="M590-30C370 125 560 330 290 650" stroke="#cadbdc" strokeWidth="51"/><path d="M-30 365 680 245" stroke="#fffdf7" strokeWidth="29"/><g fill="#d9d6ca"><rect x="230" y="110" width="96" height="65" rx="9" transform="rotate(-10 230 110)"/><rect x="272" y="214" width="89" height="56" rx="8" transform="rotate(-10 272 214)"/><rect x="82" y="220" width="80" height="62" rx="8" transform="rotate(-10 82 220)"/><rect x="270" y="404" width="74" height="66" rx="8" transform="rotate(-10 270 404)"/></g><path d="m147 620 115-298 58-12" stroke="#c7342b" strokeWidth="4" strokeDasharray="7 8" strokeLinecap="round"/></svg>
      <span className={styles.mapBadge}>แผนที่จำลอง</span><div className={styles.mapMarker}><span className={styles.mapPulse}/><span className={styles.mapPin}><MapPin size={32} strokeWidth={1.5} aria-hidden="true" /></span><div>Your name Restaurant<small>SEE YOU AT THE TABLE.</small></div></div><div className={styles.mapBottom}><span>YOUR NEXT GOOD MEAL</span><span>พื้นที่สำหรับ Google Maps</span></div>
    </div>}</div>
  </section>;
}
