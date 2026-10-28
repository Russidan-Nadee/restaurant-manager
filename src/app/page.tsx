import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Armchair, Check, ChefHat, ClipboardList, CookingPot, LayoutDashboard, Plus, QrCode, Settings2, ShoppingBag, UtensilsCrossed } from "lucide-react";
import LandingMotion from "@/components/landing/LandingMotion";
import LocationSection from "@/components/landing/LocationSection";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Your name Restaurant | Good food. Great flow.",
  description: "จากเมนูบนมือถือถึงหน้าครัว เชื่อมทุกจังหวะของร้านเข้าด้วยกัน สั่งอาหาร ดูออร์เดอร์ และจัดการร้านในที่เดียว",
};

const steps = [
  { title: "เริ่มที่โต๊ะของคุณ", text: "สแกน QR ประจำโต๊ะ หรือเลือกโต๊ะผ่านหน้าเว็บ เพื่อเริ่มดูเมนูของร้าน", icon: QrCode, label: "SCAN & SIT", screen: "เลือกโต๊ะของคุณ", detail: "ทุกมื้อ เริ่มต้นตรงนี้", href: "/order" },
  { title: "เลือกจานที่อยากกิน", text: "ดูเมนูที่เปิดขาย เลือกจำนวน ตรวจรายการในตะกร้า แล้วส่งออร์เดอร์ได้จากมือถือ", icon: ShoppingBag, label: "PICK YOUR FAVOURITES", screen: "มื้อนี้ เลือกเองได้", detail: "เมนูจริงของร้าน พร้อมให้เลือก", href: "/order" },
  { title: "ส่งตรงถึงหน้าครัว", text: "ครัวเห็นโต๊ะ รายการอาหาร และจำนวนในหน้าเดียว พร้อมอัปเดตข้อมูลอัตโนมัติ", icon: ChefHat, label: "STRAIGHT TO THE KITCHEN", screen: "ครัวรับช่วงต่อ", detail: "โต๊ะ · รายการอาหาร · จำนวน", href: "/kitchen" },
  { title: "มองเห็นภาพทั้งร้าน", text: "ดูสถานะโต๊ะที่แคชเชียร์ และเข้าถึงภาพรวมออร์เดอร์กับเมนูจากหน้าผู้ดูแล", icon: LayoutDashboard, label: "EVERYTHING CONNECTED", screen: "ทุกจังหวะ เชื่อมกัน", detail: "หน้าร้านและหลังร้าน ในระบบเดียว", href: "/cashier" },
];

const features = [
  { title: "เมนูอยู่ในมือคุณ", en: "THE DIGITAL MENU", description: "เลือกโต๊ะ ดูเมนูที่เปิดขาย ปรับจำนวน และส่งออร์เดอร์ผ่านตะกร้า", icon: QrCode, href: "/order", cta: "เปิดหน้าสั่งอาหาร" },
  { title: "ครัวอ่านง่ายขึ้น", en: "THE KITCHEN BOARD", description: "รวมโต๊ะ ชื่ออาหาร และจำนวนไว้ให้อ่านได้ทันที พร้อมรีเฟรชข้อมูลอัตโนมัติ", icon: CookingPot, href: "/kitchen", cta: "เปิดหน้าครัว" },
  { title: "ทุกโต๊ะ อยู่ในสายตา", en: "THE FLOOR VIEW", description: "ดูโต๊ะว่างและโต๊ะที่มีออร์เดอร์ค้าง สถานะอ้างอิงจากออร์เดอร์ในระบบ", icon: Armchair, href: "/cashier", cta: "เปิดหน้าแคชเชียร์" },
  { title: "ภาพรวมที่ดูได้จริง", en: "THE DAILY OVERVIEW", description: "ดูจำนวนออร์เดอร์ เมนู โต๊ะ และรายการล่าสุดจากข้อมูลจริงของร้าน", icon: LayoutDashboard, href: "/admin", cta: "ดูภาพรวมร้าน" },
  { title: "เมนูเปลี่ยน ร้านก็พร้อม", en: "THE MENU STUDIO", description: "เพิ่มและแก้ไขเมนู ตั้งราคา อัปโหลดรูป และเปิด–ปิดขายได้จากหลังร้าน", icon: Settings2, href: "/admin/menu", cta: "จัดการเมนู" },
  { title: "เชื่อมจากโต๊ะถึงหลังร้าน", en: "ONE CONNECTED PLACE", description: "เข้าถึงข้อมูลโต๊ะและลิงก์หน้าสั่งอาหารของแต่ละโต๊ะจากหน้าผู้ดูแล", icon: ClipboardList, href: "/admin/tables", cta: "ดูข้อมูลโต๊ะ" },
];


export default function Home() {
  return (
    <LandingMotion>
      <a className={styles.skipLink} href="#main-content">ข้ามไปเนื้อหา</a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Your name Restaurant หน้าแรก"><span>Your name<span className={styles.brandDot}>.</span></span><small>Restaurant</small></Link>
        <nav className={styles.navigation} aria-label="เมนูหลัก">
          <a href="#experience">ประสบการณ์</a><a href="#features">ฟีเจอร์</a><a href="#visit">มาหาเรา</a>
        </nav>
        <Link href="/order" prefetch={false} className={styles.headerCta}>เริ่มสั่งอาหาร <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </header>

      <main id="main-content">
        <section className={styles.hero} data-hero aria-labelledby="hero-title">
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}><span className={styles.statusDot} /> A LITTLE LESS WAIT. A LOT MORE TASTE.</p>
            <h1 id="hero-title" className={styles.heroTitle} lang="en"><span>GOOD FOOD.</span><span>GREAT <span className={styles.outlineWord}>FLOW.</span></span></h1>
            <p className={styles.heroThai}>ความอร่อยเต็มโต๊ะ<span>ทุกอย่างลงตัว</span></p>
            <p className={styles.heroDescription}>เลือกจานโปรด ส่งตรงถึงครัว<br />เชื่อมทุกจังหวะของร้าน ให้คุณมีเวลากับมื้อดี ๆ</p>
            <div className={styles.actions}>
              <Link href="/order" prefetch={false} className={styles.primaryButton}>ดูเมนูและสั่งอาหาร <ArrowUpRight size={20} aria-hidden="true" /></Link>
              <a href="#experience" className={styles.textButton}>ดูว่าทำงานอย่างไร <ArrowDown size={17} aria-hidden="true" /></a>
            </div>
          </div>

          <div className={`${styles.floatingCard} ${styles.ticketPosition}`} aria-hidden="true"><div className={styles.ticket}>
            <div className={styles.ticketTop}><UtensilsCrossed size={23} strokeWidth={1.5} /><span>MADE TO ORDER</span></div>
            <p>ความอร่อย<br /><strong>ไม่ต้องรอนาน</strong></p><div className={styles.ticketRule} />
            <div className={styles.ticketRow}><Check size={16} /> เลือกเมนูที่ชอบ</div><div className={styles.ticketRow}><Check size={16} /> ส่งออร์เดอร์ถึงครัว</div>
            <div className={styles.barcode} /><small>FROM YOUR TABLE, WITH LOVE.</small>
          </div></div>
          <div className={`${styles.floatingCard} ${styles.tablePosition}`} aria-hidden="true"><div className={styles.tableCard}>
            <span className={styles.cardLabel}>A TABLE FOR GOOD TIMES</span><div className={styles.tableIllustration}><i /><i /><i /><i /><span><UtensilsCrossed size={35} strokeWidth={1.2} /></span></div>
            <div className={styles.tableCaption}>ทุกโต๊ะ<span>เชื่อมถึงกัน <ArrowUpRight size={15} /></span></div>
          </div></div>
          <div className={`${styles.floatingCard} ${styles.kitchenPosition}`} aria-hidden="true"><div className={styles.kitchenPill}><span><ChefHat size={23} strokeWidth={1.5} /></span><div><small>LESS CHAOS. MORE COOKING.</small><strong>จากโต๊ะ ส่งตรงถึงครัว</strong></div><span className={styles.pulseDot} /></div></div>
          <div className={styles.heroBottom}><span>YOUR NAME RESTAURANT</span><span className={styles.scrollHint}>SCROLL TO GET A TASTE <ArrowDown size={13} /></span><span>GOOD TIMES START HERE</span></div>
        </section>

        <div className={styles.marquee} aria-hidden="true"><div className={styles.marqueeTrack}>{[0, 1, 2, 3].map(index => <span key={index}>GOOD FOOD <Plus /> GOOD PEOPLE <Plus /> GREAT FLOW <Plus /></span>)}</div></div>

        <section id="experience" className={styles.experience} data-story aria-labelledby="experience-title">
          <div className={styles.experienceFrame}>
            <div className={styles.storyCopy}>
              <p className={styles.eyebrow} data-reveal>01 / THE EXPERIENCE</p>
              <h2 id="experience-title" data-reveal>มื้อที่ดี<br />เริ่มจาก<span>อะไรที่ง่ายขึ้น.</span></h2>
              <div className={styles.steps}>{steps.map((step, index) => <div className={styles.step} key={step.label} data-step={index}>
                <span className={styles.stepNumber}>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><ArrowUpRight size={19} aria-hidden="true" />
              </div>)}</div>
            </div>
            <div className={styles.storyVisual} aria-hidden="true">
              <span className={styles.orbitLabel}>FROM THE FIRST SCAN TO THE LAST BITE</span>
              <div className={styles.orbitRing} /><div className={styles.orbitRingSmall} />
              <div className={styles.storySheets}>{steps.map((step, index) => <div className={styles.storySheet} data-sheet={index} key={step.label}>
                <div className={styles.screenHeader}><span>Your name<small>Restaurant</small></span><step.icon size={25} strokeWidth={1.5} /></div>
                <div className={styles.screenDivider} /><span className={styles.screenCounter}>0{index + 1} / 04</span>
                <div className={styles.screenIcon}><step.icon size={63} strokeWidth={1} /></div>
                <h3>{step.screen}</h3><p>{step.detail}</p>
                <div className={styles.screenRows}>{[0, 1, 2].map(row => <div key={row}><span /><i /><Check size={14} /></div>)}</div>
                <span className={styles.screenButton}>{step.label}<ArrowRight size={17} /></span>
                <small className={styles.screenNote}>ภาพประกอบขั้นตอนการใช้งาน</small>
              </div>)}</div>
              <div className={styles.storyCaption}><span className={styles.statusDot} /> ONE RESTAURANT. ALL CONNECTED.</div>
            </div>
          </div>
        </section>

        <section id="features" className={styles.features} aria-labelledby="features-title">
          <div className={styles.sectionHeading} data-reveal><p className={styles.eyebrow}>02 / SMALL DETAILS. BIG DIFFERENCE.</p><h2 id="features-title">หน้าร้านลื่นไหล<br /><span>หลังร้านลงตัว.</span></h2><p>ทุกส่วนที่ร้านต้องใช้ เชื่อมไว้ในที่เดียว<br />เลือกเปิดหน้าที่ต้องการ แล้วไปต่อได้เลย</p></div>
          <div className={styles.featureList}>{features.map((feature, index) => <article className={styles.feature} key={feature.en} data-reveal>
            <div className={styles.featureTop}><span>0{index + 1}</span><feature.icon size={28} strokeWidth={1.3} aria-hidden="true" /></div><small>{feature.en}</small><h3>{feature.title}</h3><p>{feature.description}</p><Link href={feature.href} prefetch={false}>{feature.cta}<ArrowUpRight size={20} aria-hidden="true" /></Link>
          </article>)}</div>
          <div className={styles.nextUp} data-reveal><span>ON THE HORIZON</span><p>ก้าวต่อไปของร้าน</p><div><span>ชำระเงิน</span><span>สต็อกวัตถุดิบ</span><span>รายงานยอดขาย</span><span>สิทธิ์พนักงาน</span></div><small>ฟีเจอร์ในแผนพัฒนา ยังไม่เปิดใช้งาน</small></div>
        </section>

        <section className={styles.invitation} aria-labelledby="invitation-title"><div className={styles.invitationCircle} aria-hidden="true" /><p className={styles.eyebrow} data-reveal>LESS WAITING. MORE LIVING.</p><h2 id="invitation-title" data-reveal>มื้อดี ๆ<br />ไม่ควร<span>ยุ่งยาก.</span></h2><Link href="/order" prefetch={false} className={styles.lightButton}>หาเมนูโปรดของคุณ <ArrowUpRight size={21} aria-hidden="true" /></Link><span className={styles.invitationSmall}>SIT BACK. WE’LL TAKE IT FROM HERE.</span></section>


        <LocationSection />
      </main>
      <footer className={styles.footer}><div className={styles.footerTop}><Link href="/" className={styles.brand}><span>Your name<span className={styles.brandDot}>.</span></span><small>Restaurant</small></Link><p>Good food. Good people. Great flow.</p><a href="#main-content">กลับด้านบน <ArrowUpRight size={17} aria-hidden="true" /></a></div><div className={styles.footerBottom}><span>Your name Restaurant</span><nav aria-label="ทางเข้าสำหรับทีมงาน"><Link href="/kitchen" prefetch={false}>ครัว</Link><Link href="/cashier" prefetch={false}>แคชเชียร์</Link><Link href="/admin" prefetch={false}>ผู้ดูแลร้าน</Link></nav><span>MADE FOR THE WAY YOU DINE.</span></div></footer>
    </LandingMotion>
  );
}
