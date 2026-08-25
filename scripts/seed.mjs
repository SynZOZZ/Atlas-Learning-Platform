import bcrypt from "bcryptjs";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");
const client = new pg.Client({ connectionString });
await client.connect();

const adminEmail = String(process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
const adminName = process.env.ADMIN_NAME || "Platform Owner";
const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
const passwordHash = await bcrypt.hash(adminPassword, 12);
const instructorPasswordHash = await bcrypt.hash(process.env.INSTRUCTOR_PASSWORD || "Instructor123!", 12);
const studentEmail = String(process.env.STUDENT_EMAIL || "student@example.com").toLowerCase();
const studentPasswordHash = await bcrypt.hash(process.env.STUDENT_PASSWORD || "Student123!", 12);

const courses = [
  ["course-1","Course 1","الكورس 1","Technology","التكنولوجيا","A flexible course placeholder ready for the final curriculum and learning outcomes.","مكان جاهز لإضافة المنهج ومخرجات التعلم النهائية لاحقًا.","Dr. Alex Morgan","alex@atlas.demo","201000000001",1800,"Recorded + Live","/assets/course-tech.png","All levels","8 weeks"],
  ["course-2","Course 2","الكورس 2","Business","إدارة الأعمال","A practical learning path with structured lessons, files, and live support.","مسار عملي يحتوي على دروس منظمة وملفات ودعم مباشر.","Dr. Maya Hassan","maya@atlas.demo","201000000002",1450,"Recorded","/assets/course-human.png","Beginner","6 weeks"],
  ["course-3","Course 3","الكورس 3","Creative","المجالات الإبداعية","Build a strong foundation through guided projects and instructor feedback.","ابنِ أساسًا قويًا من خلال مشروعات موجهة وملاحظات المدرس.","Nora Williams","nora@atlas.demo","201000000003",1200,"Live","/assets/course-human.png","Intermediate","5 weeks"],
  ["course-4","Course 4","الكورس 4","Technology","التكنولوجيا","Learn through concise modules, protected video, and measurable progress.","تعلم من خلال وحدات قصيرة وفيديو محمي ومتابعة واضحة للتقدم.","Omar Salem","omar@atlas.demo","201000000004",2100,"Recorded + Live","/assets/course-tech.png","Advanced","10 weeks"],
  ["course-5","Course 5","الكورس 5","Health","الصحة","Evidence-led teaching supported by files, discussions, and live sessions.","تعليم مبني على الأدلة ومدعوم بالملفات والنقاشات والمحاضرات المباشرة.","Dr. Lina Kareem","lina@atlas.demo","201000000005",1650,"Recorded","/assets/learning-hero.png","Intermediate","7 weeks"],
  ["course-6","Course 6","الكورس 6","Business","إدارة الأعمال","A focused program designed around decisions, practice, and real scenarios.","برنامج مركز مبني على القرارات والتطبيق والمواقف الواقعية.","Karim Adel","karim@atlas.demo","201000000006",1350,"Live","/assets/course-human.png","Beginner","4 weeks"],
  ["course-7","Course 7","الكورس 7","Creative","المجالات الإبداعية","Turn ideas into portfolio-ready outcomes with direct instructor guidance.","حوّل أفكارك إلى نتائج جاهزة لملف أعمالك مع توجيه مباشر من المدرس.","Sara Chen","sara@atlas.demo","201000000007",1500,"Recorded + Live","/assets/course-human.png","All levels","8 weeks"],
  ["course-8","Course 8","الكورس 8","Technology","التكنولوجيا","Master modern tools with secure resources and progress-based modules.","أتقن الأدوات الحديثة باستخدام موارد آمنة ووحدات تعتمد على التقدم.","Youssef Amin","youssef@atlas.demo","201000000008",2300,"Recorded","/assets/course-tech.png","Advanced","12 weeks"],
  ["course-9","Course 9","الكورس 9","Health","الصحة","A clear, supportive course combining independent study and live discussion.","كورس واضح وداعم يجمع بين الدراسة الذاتية والنقاش المباشر.","Dr. Hana Farid","hana@atlas.demo","201000000009",1750,"Recorded + Live","/assets/learning-hero.png","Intermediate","9 weeks"]
];

try {
  await client.query("BEGIN");
  await client.query(
    "INSERT INTO users (email,password_hash,name,role,status) VALUES ($1,$2,$3,'admin','approved') ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash,name=EXCLUDED.name,role='admin',status='approved'",
    [adminEmail, passwordHash, adminName],
  );
  for (const row of courses) {
    await client.query(
      `INSERT INTO courses (slug,title_en,title_ar,category_en,category_ar,summary_en,summary_ar,instructor_name,instructor_email,whatsapp,price,mode,image_url,level,duration,published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,TRUE)
       ON CONFLICT (slug) DO NOTHING`, row,
    );
  }
  for (const row of courses) {
    await client.query(
      "INSERT INTO users (email,password_hash,name,role,status) VALUES ($1,$2,$3,'instructor','approved') ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash,name=EXCLUDED.name,role='instructor',status='approved',updated_at=NOW()",
      [row[8], instructorPasswordHash, row[7]],
    );
  }
  await client.query(
    "INSERT INTO users (email,password_hash,name,role,status,phone,whatsapp,country,city,specialty) VALUES ($1,$2,'Demo Student','student','approved','01000000000','01000000000','Egypt','Cairo','Demo learner') ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash,name=EXCLUDED.name,role='student',status='approved',updated_at=NOW()",
    [studentEmail, studentPasswordHash],
  );
  await client.query(`INSERT INTO lessons (course_id,title,kind,asset_url,duration,sort_order)
    SELECT id,'Welcome & course roadmap','video','', '08:24',1 FROM courses WHERE slug='course-1'
    AND NOT EXISTS (SELECT 1 FROM lessons WHERE title='Welcome & course roadmap')`);
  await client.query(`INSERT INTO lessons (course_id,title,kind,asset_url,duration,sort_order)
    SELECT id,'Core learning guide','file','', 'PDF',2 FROM courses WHERE slug='course-1'
    AND NOT EXISTS (SELECT 1 FROM lessons WHERE title='Core learning guide')`);
  await client.query(`INSERT INTO lessons (course_id,title,kind,asset_url,duration,sort_order)
    SELECT id,'Live discussion room','live','', 'Thursday 19:30',3 FROM courses WHERE slug='course-1'
    AND NOT EXISTS (SELECT 1 FROM lessons WHERE title='Live discussion room')`);
  await client.query(`UPDATE lessons SET asset_url='/assets/course-tech.png',title='Course visual guide (demo)' WHERE title='Core learning guide' AND asset_url=''`);
  await client.query(`UPDATE lessons SET asset_url='https://meet.google.com/',duration='Thursday 19:30' WHERE title='Live discussion room' AND asset_url=''`);
  await client.query(`INSERT INTO enrollments (user_email,course_id,payment_status,status,progress)
    SELECT $1,id,'paid','active',35 FROM courses WHERE slug='course-1'
    ON CONFLICT (user_email,course_id) DO NOTHING`, [studentEmail]);
  await client.query(`INSERT INTO payments (user_email,course_id,amount,method,reference,status)
    SELECT $1,id,price,'test_card','DEMO-SEED','paid' FROM courses WHERE slug='course-1'
    AND NOT EXISTS (SELECT 1 FROM payments WHERE user_email=$1 AND reference='DEMO-SEED')`, [studentEmail]);
  await client.query(`INSERT INTO notifications (user_email,course_id,title,message)
    SELECT $1,id,'Welcome to Course 1','Your demo enrollment is active.' FROM courses WHERE slug='course-1'
    AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_email=$1 AND title='Welcome to Course 1')`, [studentEmail]);
  await client.query(`INSERT INTO messages (course_id,sender_email,receiver_email,body)
    SELECT c.id,$1,c.instructor_email,'Hello, I can see the course. Which lesson should I start with?' FROM courses c JOIN users u ON u.email=c.instructor_email WHERE c.slug='course-1'
    AND NOT EXISTS (SELECT 1 FROM messages WHERE sender_email=$1 AND body='Hello, I can see the course. Which lesson should I start with?')`, [studentEmail]);
  await client.query(`INSERT INTO messages (course_id,sender_email,receiver_email,body)
    SELECT c.id,c.instructor_email,$1,'Welcome! Start with the roadmap, then open the demo visual guide.' FROM courses c JOIN users u ON u.email=c.instructor_email WHERE c.slug='course-1'
    AND NOT EXISTS (SELECT 1 FROM messages WHERE receiver_email=$1 AND body='Welcome! Start with the roadmap, then open the demo visual guide.')`, [studentEmail]);
  await client.query(`INSERT INTO notifications (user_email,course_id,title,message)
    SELECT c.instructor_email,c.id,'New demo course message','Demo Student asked where to begin.' FROM courses c JOIN users u ON u.email=c.instructor_email WHERE c.slug='course-1'
    AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_email=(SELECT instructor_email FROM courses WHERE slug='course-1') AND title='New demo course message')`);
  await client.query(`INSERT INTO notifications (user_email,course_id,title,message)
    SELECT $1,id,'Instructor replied','Dr. Alex Morgan replied in Course 1.' FROM courses WHERE slug='course-1'
    AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_email=$1 AND title='Instructor replied')`, [studentEmail]);
  await client.query("COMMIT");
  console.log(`Seed complete. Admin: ${adminEmail}`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
