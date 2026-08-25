export type PublicCourse = {
  id: number;
  slug: string;
  titleEn: string;
  titleAr: string;
  categoryEn: string;
  categoryAr: string;
  summaryEn: string;
  summaryAr: string;
  instructorName: string;
  whatsapp?: string;
  price: number;
  mode: "Recorded" | "Live" | "Recorded + Live";
  imageUrl: string;
  level: string;
  duration: string;
};

export const starterCourses: PublicCourse[] = [
  { id: 1, slug: "course-1", titleEn: "Course 1", titleAr: "الكورس 1", categoryEn: "Technology", categoryAr: "التكنولوجيا", summaryEn: "A flexible course placeholder ready for the final curriculum and learning outcomes.", summaryAr: "مكان جاهز لإضافة المنهج ومخرجات التعلم النهائية لاحقًا.", instructorName: "Dr. Alex Morgan", price: 1800, mode: "Recorded + Live", imageUrl: "/assets/course-tech.png", level: "All levels", duration: "8 weeks" },
  { id: 2, slug: "course-2", titleEn: "Course 2", titleAr: "الكورس 2", categoryEn: "Business", categoryAr: "إدارة الأعمال", summaryEn: "A practical learning path with structured lessons, files, and live support.", summaryAr: "مسار عملي يحتوي على دروس منظمة وملفات ودعم مباشر.", instructorName: "Dr. Maya Hassan", price: 1450, mode: "Recorded", imageUrl: "/assets/course-human.png", level: "Beginner", duration: "6 weeks" },
  { id: 3, slug: "course-3", titleEn: "Course 3", titleAr: "الكورس 3", categoryEn: "Creative", categoryAr: "المجالات الإبداعية", summaryEn: "Build a strong foundation through guided projects and instructor feedback.", summaryAr: "ابنِ أساسًا قويًا من خلال مشروعات موجهة وملاحظات المدرس.", instructorName: "Nora Williams", price: 1200, mode: "Live", imageUrl: "/assets/course-human.png", level: "Intermediate", duration: "5 weeks" },
  { id: 4, slug: "course-4", titleEn: "Course 4", titleAr: "الكورس 4", categoryEn: "Technology", categoryAr: "التكنولوجيا", summaryEn: "Learn through concise modules, protected video, and measurable progress.", summaryAr: "تعلم من خلال وحدات قصيرة وفيديو محمي ومتابعة واضحة للتقدم.", instructorName: "Omar Salem", price: 2100, mode: "Recorded + Live", imageUrl: "/assets/course-tech.png", level: "Advanced", duration: "10 weeks" },
  { id: 5, slug: "course-5", titleEn: "Course 5", titleAr: "الكورس 5", categoryEn: "Health", categoryAr: "الصحة", summaryEn: "Evidence-led teaching supported by files, discussions, and live sessions.", summaryAr: "تعليم مبني على الأدلة ومدعوم بالملفات والنقاشات والمحاضرات المباشرة.", instructorName: "Dr. Lina Kareem", price: 1650, mode: "Recorded", imageUrl: "/assets/learning-hero.png", level: "Intermediate", duration: "7 weeks" },
  { id: 6, slug: "course-6", titleEn: "Course 6", titleAr: "الكورس 6", categoryEn: "Business", categoryAr: "إدارة الأعمال", summaryEn: "A focused program designed around decisions, practice, and real scenarios.", summaryAr: "برنامج مركز مبني على القرارات والتطبيق والمواقف الواقعية.", instructorName: "Karim Adel", price: 1350, mode: "Live", imageUrl: "/assets/course-human.png", level: "Beginner", duration: "4 weeks" },
  { id: 7, slug: "course-7", titleEn: "Course 7", titleAr: "الكورس 7", categoryEn: "Creative", categoryAr: "المجالات الإبداعية", summaryEn: "Turn ideas into portfolio-ready outcomes with direct instructor guidance.", summaryAr: "حوّل أفكارك إلى نتائج جاهزة لملف أعمالك مع توجيه مباشر من المدرس.", instructorName: "Sara Chen", price: 1500, mode: "Recorded + Live", imageUrl: "/assets/course-human.png", level: "All levels", duration: "8 weeks" },
  { id: 8, slug: "course-8", titleEn: "Course 8", titleAr: "الكورس 8", categoryEn: "Technology", categoryAr: "التكنولوجيا", summaryEn: "Master modern tools with secure resources and progress-based modules.", summaryAr: "أتقن الأدوات الحديثة باستخدام موارد آمنة ووحدات تعتمد على التقدم.", instructorName: "Youssef Amin", price: 2300, mode: "Recorded", imageUrl: "/assets/course-tech.png", level: "Advanced", duration: "12 weeks" },
  { id: 9, slug: "course-9", titleEn: "Course 9", titleAr: "الكورس 9", categoryEn: "Health", categoryAr: "الصحة", summaryEn: "A clear, supportive course combining independent study and live discussion.", summaryAr: "كورس واضح وداعم يجمع بين الدراسة الذاتية والنقاش المباشر.", instructorName: "Dr. Hana Farid", price: 1750, mode: "Recorded + Live", imageUrl: "/assets/learning-hero.png", level: "Intermediate", duration: "9 weeks" },
];
