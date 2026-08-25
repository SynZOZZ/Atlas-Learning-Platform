"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicCourse, starterCourses } from "../../course-data";
import { publicConfig } from "../../../lib/public-config";

export default function CourseDetailClient({ slug }: { slug: string }) {
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [course, setCourse] = useState<PublicCourse | undefined>(() => starterCourses.find((item) => item.slug === slug));

  useEffect(() => {
    fetch("/api/courses", { cache: "no-store" }).then(async (response) => await response.json() as { courses?: PublicCourse[] }).then((payload) => {
      const live = payload.courses?.find((item) => item.slug === slug);
      if (live) setCourse(live);
    }).catch(() => undefined);
  }, [slug]);

  useEffect(() => { document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"; document.documentElement.lang = locale; }, [locale]);
  if (!course) return <main className="course-not-found"><h1>Course not found.</h1><Link href="/">Return home</Link></main>;
  const ar = locale === "ar";
  const whatsapp = course.whatsapp || publicConfig.supportWhatsapp;

  return <main className="course-detail">
    <nav className="site-nav shell"><Link className="academy-brand" href="/"><span>{publicConfig.shortName[0]}</span> {publicConfig.shortName} <small>LEARNING</small></Link><div className="site-links"><Link href="/#courses">{ar ? "الكورسات" : "Courses"}</Link><a href={`https://wa.me/${whatsapp}`}>{ar ? "تواصل مع المدرس" : "Ask the instructor"}</a></div><div className="nav-actions"><button className="language-toggle" onClick={() => setLocale(ar ? "en" : "ar")}>{ar ? "English" : "العربية"}</button><Link className="portal-link" href="/workspace">{ar ? "بوابة الطالب" : "Student portal"} <span>↗</span></Link></div></nav>
    <section className="course-detail-hero shell"><div className="detail-copy"><Link className="detail-back" href="/#courses">← {ar ? "كل الكورسات" : "All courses"}</Link><p className="micro-label">{ar ? course.categoryAr : course.categoryEn}</p><h1>{ar ? course.titleAr : course.titleEn}</h1><p className="detail-lead">{ar ? course.summaryAr : course.summaryEn}</p><div className="instructor-line"><span>{course.instructorName.slice(0, 2).toUpperCase()}</span><div><small>{ar ? "المدرس" : "YOUR INSTRUCTOR"}</small><b>{course.instructorName}</b></div></div><div className="detail-actions"><Link className="workspace-primary" href={`/workspace?course=${course.id}`}>{ar ? "سجل وادفع" : "Enroll & pay"} <span>↗</span></Link><a className="whatsapp-action" href={`https://wa.me/${whatsapp}`}>WhatsApp ↗</a></div></div><div className="detail-cover"><img src={course.imageUrl} alt="" /><span>{course.mode}</span><div><small>{ar ? "رسوم الكورس" : "COURSE FEE"}</small><strong>{course.price.toLocaleString()} {ar ? "جنيه" : "EGP"}</strong></div></div></section>
    <section className="detail-strip"><div className="shell"><p><small>{ar ? "المستوى" : "LEVEL"}</small><b>{course.level}</b></p><p><small>{ar ? "المدة" : "DURATION"}</small><b>{course.duration}</b></p><p><small>{ar ? "طريقة الدراسة" : "DELIVERY"}</small><b>{course.mode}</b></p><p><small>{ar ? "الوصول" : "ACCESS"}</small><b>{ar ? "بعد الدفع" : "After payment"}</b></p></div></section>
    <section className="detail-content shell"><div><p className="micro-label">{ar ? "داخل الكورس" : "INSIDE THE COURSE"}</p><h2>{ar ? "تعلم منظم ومحمي." : "Structured. Supported. Protected."}</h2><p>{ar ? "الفيديوهات المسجلة والبث المباشر والملفات والنقاشات موجودة في مساحة واحدة، ولا تظهر إلا للطلاب المسجلين بعد تأكيد الدفع." : "Recorded lessons, live rooms, files, and conversations stay together. Course material becomes visible only after payment is confirmed."}</p></div><ol><li><span>01</span><b>{ar ? "فيديو بجودات متعددة" : "Adaptive-quality video"}</b></li><li><span>02</span><b>{ar ? "محاضرات مباشرة" : "Live instructor sessions"}</b></li><li><span>03</span><b>{ar ? "ملفات للعرض فقط" : "View-only resources"}</b></li><li><span>04</span><b>{ar ? "رسائل مرتبطة بالكورس" : "Course-specific messaging"}</b></li></ol></section>
    <footer className="site-footer shell"><Link className="academy-brand" href="/"><span>{publicConfig.shortName[0]}</span> {publicConfig.shortName} <small>LEARNING</small></Link><p>© 2026 {publicConfig.name}</p></footer>
  </main>;
}
