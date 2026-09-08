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

export const starterCourses: PublicCourse[] = [];
