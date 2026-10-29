import type { Metadata } from "next";
import Link from "next/link";
import { Check, Globe2, Heart, MessageCircle, Palette, Plus, Store, UtensilsCrossed } from "lucide-react";
import LandingMotion from "@/components/landing/LandingMotion";
import LocationSection from "@/components/landing/LocationSection";
import LivePreview from "@/components/landing/LivePreview";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "รับทำเว็บไซต์ร้านอาหาร จ่ายครั้งเดียว | Your name Restaurant",
  description: "เว็บไซต์ร้านอาหารในแบบของคุณ พร้อมเมนูบนมือถือ สั่งอาหารผ่าน QR และหลังร้านสำหรับจัดการเมนู รับทำเป็นรายร้าน ค่าทำเว็บจ่ายครั้งเดียว",
};

const showcase = [
  { title: "หน้าเว็บที่เป็นร้านคุณ", text: "ชื่อร้าน สี รูปอาหาร และเรื่องราว ที่ทำให้ลูกค้ารู้จักคุณตั้งแต่หน้าแรก", preview: "/?preview=1", href: "/" },
  { title: "จัดการโต๊ะและบิลในหน้าแคชเชียร์", text: "ดูสถานะโต๊ะ รายการอาหาร และยอดรวม พร้อมยืนยันรับเงินจากหน้าแคชเชียร์", preview: "/cashier", href: "/cashier" },
  { title: "ออร์เดอร์ส่งถึงหน้าครัว", text: "เห็นโต๊ะ รายการอาหาร และจำนวนชัดเจนในหน้าเดียว", preview: "/kitchen", href: "/kitchen" },
  { title: "หลังร้านที่ดูแลเองได้", text: "เพิ่มเมนู เปลี่ยนราคา อัปโหลดรูป และจัดการโต๊ะได้จากหลังร้าน", preview: "/admin/menu", href: "/admin/menu" },
];

const audiences = [
  { title: "ร้านที่กำลังเปิดใหม่", text: "เตรียมพื้นที่ออนไลน์ให้ลูกค้ารู้จักร้าน ตั้งแต่ก่อนเปิดประตูต้อนรับวันแรก", label: "A FRESH START", caption: "ก้าวแรกของร้าน เริ่มให้เป็นคุณ", icon: Store },
  { title: "ร้านที่มีลูกค้าประจำแล้ว", text: "มีลิงก์ของร้านไว้ส่งต่อ ให้ลูกค้าเก่าแนะนำร้านกับคนใหม่ได้ง่ายขึ้น", label: "A LOCAL FAVOURITE", caption: "ร้านโปรด ที่ส่งต่อกันได้", icon: Heart },
  { title: "ร้านที่ใช้โซเชียลเป็นหลัก", text: "มีพื้นที่รวมข้อมูลร้าน แล้วใช้ลิงก์เดียวเชื่อมต่อจากทุกช่องทางที่คุณใช้อยู่", label: "BEYOND THE FEED", caption: "จากหน้าโซเชียล สู่พื้นที่ของร้าน", icon: MessageCircle },
  { title: "ร้านที่อยากให้คนจำแบรนด์ได้", text: "ถ่ายทอดบุคลิกของร้านผ่านชื่อ สี และภาพ ให้ลูกค้าจดจำร้านในแบบที่คุณตั้งใจ", label: "A BRAND OF YOUR OWN", caption: "บุคลิกของร้าน ที่มองเห็นได้", icon: Palette },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ preview?: string | string[] }> }) {
  const isPreview = (await searchParams).preview === "1";
  return (
    <LandingMotion>
      <a className={styles.skipLink} href="#main-content">ข้ามไปเนื้อหา</a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Your name Restaurant หน้าแรก"><span>Your name<span className={styles.brandDot}>.</span></span><small>Restaurant</small></Link>
        <nav className={styles.navigation} aria-label="เมนูหลัก">
          <a href="#features">สิ่งที่จะได้รับ</a><a href="#experience">เหมาะกับใคร</a>
        </nav>
        <button type="button" className={styles.headerCta}>ติดต่อทำเว็บ</button>
      </header>

      <main id="main-content">
        <section className={styles.hero} data-hero aria-labelledby="hero-title">
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}><span className={styles.statusDot} /> BUILT FOR YOUR RESTAURANT. MADE TO BE YOURS.</p>
            <h1 id="hero-title" className={styles.heroTitle} lang="en"><span>YOUR NAME.</span><span>YOUR <span className={styles.outlineWord}>WEB.</span></span></h1>
            <p className={styles.heroThai}>เว็บไซต์ร้านอาหาร<span>ในแบบของคุณ</span></p>
            <p className={styles.heroDescription}>รับทำเว็บเป็นรายร้าน ใช้ชื่อ สี และภาพของร้านคุณ<br />ค่าทำเว็บจ่ายครั้งเดียว ตามขอบเขตงานที่ตกลง</p>
            <div className={styles.actions}>
              <Link href="/order" prefetch={false} className={styles.primaryButton}>ลองเว็บตัวอย่าง</Link>
              <a href="#features" className={styles.textButton}>ดูสิ่งที่จะได้รับ</a>
            </div>
          </div>

          <div className={`${styles.floatingCard} ${styles.ticketPosition}`} aria-hidden="true"><div className={styles.ticket}>
            <div className={styles.ticketTop}><Globe2 size={23} strokeWidth={1.5} /><span>MAKE IT YOURS</span></div>
            <p>เว็บหนึ่งร้าน<br /><strong>ตัวตนของคุณ</strong></p><div className={styles.ticketRule} />
            <div className={styles.ticketRow}><Check size={16} /> ชื่อ สี และรูปของร้าน</div><div className={styles.ticketRow}><Check size={16} /> ค่าทำเว็บจ่ายครั้งเดียว</div>
            <div className={styles.barcode} /><small>A WEBSITE WITH YOUR NAME ON IT.</small>
          </div></div>
          <div className={`${styles.floatingCard} ${styles.tablePosition}`} aria-hidden="true"><div className={styles.tableCard}>
            <span className={styles.cardLabel}>YOUR BRAND GOES HERE</span><div className={styles.tableIllustration}><i /><i /><i /><i /><span><UtensilsCrossed size={35} strokeWidth={1.2} /></span></div>
            <div className={styles.tableCaption}>ชื่อร้านของคุณ<span>สไตล์ที่เป็นคุณ</span></div>
          </div></div>
          <div className={`${styles.floatingCard} ${styles.kitchenPosition}`} aria-hidden="true"><div className={styles.kitchenPill}><span><Globe2 size={23} strokeWidth={1.5} /></span><div><small>YOUR RESTAURANT, ONLINE.</small><strong>ให้ลูกค้ารู้จักร้านคุณ</strong></div><span className={styles.pulseDot} /></div></div>
          <div className={styles.heroBottom}><span>WEBSITES FOR RESTAURANT OWNERS</span><span className={styles.scrollHint}>SCROLL TO MEET YOUR NEXT WEBSITE</span><span>ONE RESTAURANT. YOUR IDENTITY.</span></div>
        </section>

        {!isPreview && <>
        <div className={styles.marquee} aria-hidden="true"><div className={styles.marqueeTrack}>{[0, 1, 2, 3].map(index => <span key={index}>YOUR BRAND <Plus /> YOUR MENU <Plus /> YOUR WEBSITE <Plus /></span>)}</div></div>

        <section id="features" className={styles.features} aria-labelledby="features-title">
          <div className={styles.sectionHeading} data-reveal><h2 id="features-title">เว็บของคุณ<br /><span>มาพร้อมอะไรบ้าง.</span></h2></div>
          <div className={styles.benefitGrid}>{showcase.map(item => <article className={styles.benefit} key={item.title}>
            <div data-reveal><LivePreview title={item.title} src={item.preview} href={item.href} /></div>
            <div className={styles.benefitCopy} data-reveal><div><h3>{item.title}</h3><p>{item.text}</p></div></div>
          </article>)}</div>
        </section>

        <section id="experience" className={styles.experience} data-story aria-labelledby="experience-title">
          <div className={styles.experienceFrame}>
            <div className={styles.storyCopy}>

              <h2 id="experience-title" data-reveal>ร้านแบบไหน<span>ก็เป็นตัวเองได้.</span></h2>
              <div className={styles.steps}>{audiences.map((item, index) => <div className={styles.step} key={item.label} data-step={index}>
                <span className={styles.stepNumber}>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div>
              </div>)}</div>

            </div>
            <div className={styles.storyVisual} aria-hidden="true">

              <div className={styles.orbitRing} /><div className={styles.orbitRingSmall} />
              <div className={styles.storySheets}>{audiences.map((item, index) => <div className={`${styles.storySheet} ${styles.audienceSheet}`} data-sheet={index} key={item.label}>
                <div className={styles.screenHeader}><span>Your name<small>Restaurant</small></span><item.icon size={25} strokeWidth={1.5} /></div>
                <div className={styles.screenDivider} /><span className={styles.screenCounter}>0{index + 1} / 04</span>
                <div className={styles.audienceIllustration}><span /><span /><item.icon size={78} strokeWidth={1.1} /></div>
                <p className={styles.audienceLabel}>{item.label}</p>
                <h3>{item.title}</h3>
                <p className={styles.audienceCaption}>{item.caption}</p>
                <span className={styles.screenButton}>YOUR NEXT CHAPTER</span>
              </div>)}</div>

            </div>
          </div>
        </section>

        <LocationSection />

        <section id="contact" className={styles.invitation} aria-labelledby="invitation-title"><div className={styles.invitationCircle} aria-hidden="true" /><p className={styles.eyebrow} data-reveal>YOUR NEXT CHAPTER STARTS HERE.</p><h2 id="invitation-title" data-reveal>ร้านของคุณ.<br />เว็บ<span>ของคุณ.</span></h2><p className={styles.invitationDescription}>เริ่มจากเล่าให้ฟัง ว่าอยากให้เว็บของร้านเป็นแบบไหน</p><button type="button" className={styles.lightButton}>ติดต่อทำเว็บ</button><span className={styles.invitationSmall}>MADE FOR YOUR RESTAURANT. MADE TO BE YOURS.</span></section>
        </>}
      </main>
      {!isPreview && <footer className={styles.footer}><div className={styles.footerTop}><Link href="/" className={styles.brand}><span>Your name<span className={styles.brandDot}>.</span></span><small>Restaurant</small></Link><p>Your restaurant. Your identity. Your website.</p><a href="#main-content">กลับด้านบน</a></div><div className={styles.footerBottom}><span>Your name Restaurant</span><nav aria-label="เว็บตัวอย่าง"><Link href="/order" prefetch={false}>ลองสั่งอาหาร</Link><Link href="/kitchen" prefetch={false}>ตัวอย่างครัว</Link><Link href="/admin" prefetch={false}>ตัวอย่างหลังร้าน</Link></nav><span>BUILT AROUND YOUR BUSINESS.</span></div></footer>}
    </LandingMotion>
  );
}
