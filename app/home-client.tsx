"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PublicCourse, starterCourses } from "./course-data";
import { publicConfig } from "../lib/public-config";

type Locale = "en" | "ar";

const copy = {
  en: {
    navCourses: "Courses", navHow: "About Us", navProtection: "Contact", signIn: "Login",
    eyebrow: "Learn • Build • Grow", hero: "Unlock Your Potential with 4Z Academy",
    heroText: "Practical courses, expert guidance, and a secure learning experience designed to move you forward.",
    explore: "Login", talk: "Talk to an advisor", trusted: "Secure learning for serious students",
    stat1: "Recorded & live", stat2: "One trusted device", stat3: "Direct instructor access",
    browseLabel: "Featured Courses", browse: "Choose your next step.", browseText: "Explore practical courses with recorded lessons, live support, protected files, and direct access to your instructor.",
    all: "All", enroll: "View course", by: "with", currency: "EGP", studentsOnly: "Paid enrollment only", emptyCourses: "New courses are being prepared. Check back soon or contact us for the next enrollment date.",
    howLabel: "A clearer learning journey", how: "From application to achievement.",
    steps: ["Complete your profile", "Get reviewed and approved", "Choose and pay for a course", "Learn securely on one device"],
    secureLabel: "Protected by design", secure: "Your learning space. Their intellectual property. Both respected.",
    secureText: "Private streaming, expiring access, dynamic student watermarks, controlled devices, and course-specific notifications work together to reduce content misuse.",
    cta: "Ready to start learning?", ctaText: "Create your profile, get approved, and unlock the course that moves you forward.", ctaButton: "Create student profile",
  },
  ar: {
    navCourses: "الكورسات", navHow: "عن الأكاديمية", navProtection: "تواصل معنا", signIn: "تسجيل الدخول",
    eyebrow: "اتعلم • طبّق • اتطور", hero: "اكتشف إمكانياتك مع 4Z Academy",
    heroText: "كورسات عملية وتوجيه من خبراء وتجربة تعليم آمنة تساعدك تتقدم بثقة.",
    explore: "تسجيل الدخول", talk: "تواصل مع مستشار", trusted: "تعليم آمن للطلاب الجادين",
    stat1: "مسجل ومباشر", stat2: "جهاز موثوق واحد", stat3: "تواصل مباشر مع المدرس",
    browseLabel: "الكورسات المميزة", browse: "اختار خطوتك الجاية.", browseText: "كورسات عملية بفيديوهات مسجلة ودعم مباشر وملفات محمية وتواصل مباشر مع المدرس.",
    all: "الكل", enroll: "تفاصيل الكورس", by: "مع", currency: "جنيه", studentsOnly: "التسجيل بعد الدفع فقط", emptyCourses: "نعمل حاليًا على تجهيز الكورسات الجديدة. تواصل معنا لمعرفة موعد فتح التسجيل.",
    howLabel: "رحلة تعليم أوضح", how: "من التسجيل حتى الإنجاز.",
    steps: ["كمّل بيانات حسابك", "انتظر المراجعة والموافقة", "اختار الكورس وادفع الرسوم", "اتعلم بأمان على جهاز واحد"],
    secureLabel: "حماية من البداية", secure: "مساحتك التعليمية وحقوق صاحب المحتوى محفوظة.",
    secureText: "تشغيل خاص وروابط مؤقتة وعلامة مائية متحركة باسم الطالب وتحكم في الجهاز وإشعارات خاصة بكل كورس؛ كلها تعمل معًا لتقليل إساءة استخدام المحتوى.",
    cta: "جاهز تبدأ؟", ctaText: "اعمل حسابك، استنى الموافقة، وابدأ الكورس اللي ينقلك للخطوة الجاية.", ctaButton: "إنشاء حساب طالب",
  },
};

export default function HomeClient() {
  const [locale, setLocale] = useState<Locale>("en");
  const [category, setCategory] = useState("All");
  const [courses, setCourses] = useState<PublicCourse[]>(starterCourses);
  const t = copy[locale];
  const categories = useMemo(() => ["All", ...Array.from(new Set(courses.map((item) => item.categoryEn)))], [courses]);
  const visibleCourses = category === "All" ? courses : courses.filter((item) => item.categoryEn === category);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    fetch("/api/courses", { cache: "no-store" })
      .then(async (response) => await response.json() as { courses?: PublicCourse[] })
      .then((data) => {
        if (Array.isArray(data.courses)) setCourses(data.courses);
      })
      .catch(() => undefined);
  }, []);

  return (
    <main className="site-home">
      <nav className="site-nav shell">
        <Link className="academy-brand" href="/" aria-label="4Z Academy home"><img src="/assets/4z-academy-logo.png" alt="4Z Academy" /></Link>
        <div className="site-links"><a href="#courses">{t.navCourses}</a><a href="#about">{t.navHow}</a><a href="#contact">{t.navProtection}</a></div>
        <div className="nav-actions">
          <button className="language-toggle" onClick={() => setLocale(locale === "en" ? "ar" : "en")}>{locale === "en" ? "العربية" : "English"}</button>
          <Link className="portal-link" href="/workspace">{t.signIn} <span>↗</span></Link>
        </div>
      </nav>

      <section className="learning-hero shell">
        <div className="hero-copy">
          <p className="micro-label">{t.eyebrow}</p>
          <h1>{t.hero}</h1>
          <p className="hero-lead">{t.heroText}</p>
          <div className="hero-actions"><Link className="primary-action" href="/login">{t.explore} <span>↗</span></Link></div>
        </div>
      </section>

      <section className="learning-stats">
        <div className="shell"><p>01 <b>{t.stat1}</b></p><p>02 <b>{t.stat2}</b></p><p>03 <b>{t.stat3}</b></p></div>
      </section>

      <section className="course-library shell" id="courses">
        <div className="section-title"><div><p className="micro-label">{t.browseLabel}</p><h2>{t.browse}</h2></div><p>{t.browseText}</p></div>
        <div className="course-filter">
          {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item === "All" ? t.all : locale === "en" ? item : courses.find((course) => course.categoryEn === item)?.categoryAr}</button>)}
        </div>
        {visibleCourses.length ? <div className="course-grid">
          {visibleCourses.map((course, index) => <article className="course-card" key={course.id}>
            <div className="course-cover"><img src={course.imageUrl} alt="" /><div className="course-cover-title"><p>{locale === "en" ? course.categoryEn : course.categoryAr}</p><h3>{locale === "en" ? course.titleEn : course.titleAr}</h3></div><span className="course-index">{String(index + 1).padStart(2, "0")}</span><span className="course-mode">{course.mode}</span></div>
            <div className="course-body">
              <p className="course-summary">{locale === "en" ? course.summaryEn : course.summaryAr}</p>
              <p className="course-teacher">{t.by} <b>{course.instructorName}</b></p>
              <div className="course-meta"><span>{course.level}</span><span>{course.duration}</span></div>
              <div className="course-footer"><div><small>{t.studentsOnly}</small><strong>{course.price.toLocaleString()} {t.currency}</strong></div><Link href={`/courses/${course.slug}`}>{t.enroll} ↗</Link></div>
            </div>
          </article>)}
        </div> : <div className="catalog-empty"><img src="/assets/4z-academy-logo.png" alt="" /><h3>{locale === "en" ? "Courses are coming soon" : "الكورسات قريبًا"}</h3><p>{t.emptyCourses}</p><a href="#contact">{locale === "en" ? "Contact 4Z Academy" : "تواصل مع 4Z Academy"} ↗</a></div>}
      </section>

      <section className="journey" id="how">
        <div className="shell"><div className="journey-heading"><p className="micro-label light">{t.howLabel}</p><h2>{t.how}</h2></div><div className="journey-steps">{t.steps.map((step, index) => <article key={step}><span>0{index + 1}</span><h3>{step}</h3><i>↘</i></article>)}</div></div>
      </section>

      <section className="protection shell" id="about">
        <div className="protection-art"><div className="shield-ring"><img src="/assets/4z-academy-logo.png" alt="4Z Academy" /><small>SECURE LEARNING</small></div></div>
        <div className="protection-copy"><p className="micro-label">{t.secureLabel}</p><h2>{t.secure}</h2><p>{t.secureText}</p><ul><li>Signed private access</li><li>Dynamic student identity watermark</li><li>One trusted device per account</li><li>Course-scoped files and messages</li></ul></div>
      </section>

      <section className="learning-cta" id="contact"><div className="shell"><p className="micro-label light">{publicConfig.name}</p><h2>{t.cta}</h2><p>{t.ctaText}</p><div className="cta-actions"><Link href="/register">{t.ctaButton} <span>↗</span></Link><a href={`https://wa.me/${publicConfig.supportWhatsapp}`}>WhatsApp <span>↗</span></a></div></div></section>
      <footer className="site-footer-wrap"><div className="site-footer shell"><div className="footer-links"><a href="#">Home</a><a href="#courses">Courses</a><a href="#about">About Us</a><a href="#contact">Contact</a><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div><p>© 2026 {publicConfig.name}. All rights reserved.</p><Link className="academy-brand" href="/" aria-label="4Z Academy home"><img src="/assets/4z-academy-logo.png" alt="4Z Academy" /></Link></div></footer>
    </main>
  );
}
