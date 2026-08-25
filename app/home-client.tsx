"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PublicCourse, starterCourses } from "./course-data";
import { publicConfig } from "../lib/public-config";

type Locale = "en" | "ar";

const copy = {
  en: {
    navCourses: "Courses", navHow: "How it works", navProtection: "Content protection", signIn: "Student portal",
    eyebrow: "Learn with focus. Grow with proof.", hero: "Education that stays with you.",
    heroText: "Recorded depth, live guidance, and a learning space built around your progress—not distractions.",
    explore: "Explore courses", talk: "Talk to an advisor", trusted: "Secure learning for serious students",
    stat1: "Recorded & live", stat2: "One trusted device", stat3: "Direct instructor access",
    browseLabel: "Course library", browse: "Find the right next step.", browseText: "Nine flexible course spaces are ready now. Every title, instructor, price, and curriculum can be updated from the control room.",
    all: "All", enroll: "View course", by: "with", currency: "EGP", studentsOnly: "Paid enrollment only",
    howLabel: "A clearer learning journey", how: "From application to achievement.",
    steps: ["Complete your profile", "Get reviewed and approved", "Choose and pay for a course", "Learn securely on one device"],
    secureLabel: "Protected by design", secure: "Your learning space. Their intellectual property. Both respected.",
    secureText: "Private streaming, expiring access, dynamic student watermarks, controlled devices, and course-specific notifications work together to reduce content misuse.",
    cta: "Ready to start learning?", ctaText: "Create your profile, get approved, and unlock the course that moves you forward.", ctaButton: "Create student profile",
  },
  ar: {
    navCourses: "الكورسات", navHow: "طريقة الاستخدام", navProtection: "حماية المحتوى", signIn: "بوابة الطالب",
    eyebrow: "تعلم بتركيز. وتقدم بنتائج حقيقية.", hero: "تعليم يفضل معاك.",
    heroText: "محتوى مسجل بعمق، وتوجيه مباشر، ومساحة تعليم مبنية حول تقدمك بعيدًا عن التشتت.",
    explore: "استكشف الكورسات", talk: "تواصل مع مستشار", trusted: "تعليم آمن للطلاب الجادين",
    stat1: "مسجل ومباشر", stat2: "جهاز موثوق واحد", stat3: "تواصل مباشر مع المدرس",
    browseLabel: "مكتبة الكورسات", browse: "اختار خطوتك الجاية.", browseText: "تسعة أماكن جاهزة للكورسات حاليًا، ويمكن تعديل الاسم والمدرس والسعر والمنهج بالكامل من لوحة التحكم.",
    all: "الكل", enroll: "تفاصيل الكورس", by: "مع", currency: "جنيه", studentsOnly: "التسجيل بعد الدفع فقط",
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
        if (Array.isArray(data.courses) && data.courses.length) setCourses(data.courses);
      })
      .catch(() => undefined);
  }, []);

  return (
    <main className="site-home">
      <nav className="site-nav shell">
        <Link className="academy-brand" href="/"><span>{publicConfig.shortName[0]}</span> {publicConfig.shortName} <small>LEARNING</small></Link>
        <div className="site-links"><a href="#courses">{t.navCourses}</a><a href="#how">{t.navHow}</a><a href="#protection">{t.navProtection}</a></div>
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
          <div className="hero-actions"><a className="primary-action" href="#courses">{t.explore} <span>↓</span></a><a className="quiet-action" href={`https://wa.me/${publicConfig.supportWhatsapp}`}>{t.talk} ↗</a></div>
          <div className="trust-note"><i>●</i><span>{t.trusted}</span></div>
        </div>
        <div className="hero-media">
          <img src="/assets/learning-hero.png" alt="Student learning online in a modern study space" />
          <div className="live-chip"><i /> LIVE SESSION <b>19:30</b></div>
          <div className="progress-chip"><span>COURSE PROGRESS</span><strong>68%</strong><i><b /></i></div>
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
        <div className="course-grid">
          {visibleCourses.map((course, index) => <article className="course-card" key={course.id}>
            <div className="course-cover"><img src={course.imageUrl} alt="" /><span className="course-index">{String(index + 1).padStart(2, "0")}</span><span className="course-mode">{course.mode}</span></div>
            <div className="course-body">
              <p className="course-category">{locale === "en" ? course.categoryEn : course.categoryAr}</p>
              <h3>{locale === "en" ? course.titleEn : course.titleAr}</h3>
              <p className="course-summary">{locale === "en" ? course.summaryEn : course.summaryAr}</p>
              <p className="course-teacher">{t.by} <b>{course.instructorName}</b></p>
              <div className="course-meta"><span>{course.level}</span><span>{course.duration}</span></div>
              <div className="course-footer"><div><small>{t.studentsOnly}</small><strong>{course.price.toLocaleString()} {t.currency}</strong></div><Link href={`/courses/${course.slug}`}>{t.enroll} ↗</Link></div>
            </div>
          </article>)}
        </div>
      </section>

      <section className="journey" id="how">
        <div className="shell"><div className="journey-heading"><p className="micro-label light">{t.howLabel}</p><h2>{t.how}</h2></div><div className="journey-steps">{t.steps.map((step, index) => <article key={step}><span>0{index + 1}</span><h3>{step}</h3><i>↘</i></article>)}</div></div>
      </section>

      <section className="protection shell" id="protection">
        <div className="protection-art"><div className="shield-ring"><span>ATLAS</span><b>✦</b><small>SECURE LEARNING</small></div></div>
        <div className="protection-copy"><p className="micro-label">{t.secureLabel}</p><h2>{t.secure}</h2><p>{t.secureText}</p><ul><li>Signed private access</li><li>Dynamic student identity watermark</li><li>One trusted device per account</li><li>Course-scoped files and messages</li></ul></div>
      </section>

      <section className="learning-cta"><div className="shell"><p className="micro-label light">{publicConfig.name}</p><h2>{t.cta}</h2><p>{t.ctaText}</p><Link href="/register">{t.ctaButton} <span>↗</span></Link></div></section>
      <footer className="site-footer shell"><Link className="academy-brand" href="/"><span>{publicConfig.shortName[0]}</span> {publicConfig.shortName} <small>LEARNING</small></Link><p>© 2026 {publicConfig.name}</p><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href={`https://wa.me/${publicConfig.supportWhatsapp}`}>WhatsApp</a></div></footer>
    </main>
  );
}
