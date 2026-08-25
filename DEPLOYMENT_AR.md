# دليل التشغيل والنشر

## أولًا: التشغيل على جهازك للتجربة

المطلوب على Windows:

1. Docker Desktop.
2. متصفح Chrome أو Edge.
3. مساحة خالية لا تقل عن 5 GB.

بعد فك الضغط شغّل `start-windows.bat`. سيُنشئ البرنامج قاعدة PostgreSQL، الجداول، حسابات التجربة، وتسعة كورسات تلقائيًا. افتح `http://localhost:3000`.

هذا مناسب للتجربة والعرض فقط. لن يكون متاحًا للطلاب خارج جهازك.

## ثانيًا: رابط تجريبي بدون Local

ارفع نفس الحزمة على VPS تجريبي، ثم استخدم IP السيرفر أو Subdomain مثل `demo.example.com`. بهذه الطريقة تختبر المنصة من أي جهاز بدون تشغيل اللابتوب.

## ثالثًا: النشر التجاري

1. شراء VPS بنظام Ubuntu ودومين.
2. تثبيت Docker وDocker Compose على السيرفر.
3. رفع الحزمة إلى `/opt/atlas-learning`.
4. نسخ `.env.example` إلى `.env` وتغيير كلمات المرور والمفاتيح. غيّر `POSTGRES_PASSWORD` واكتب نفس القيمة داخل `DATABASE_URL_DOCKER` (مع URL encoding إذا كانت تحتوي رموزًا خاصة).
5. ضبط `DOMAIN` على الدومين الحقيقي.
6. توجيه DNS A Record إلى IP السيرفر.
7. تشغيل:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

8. التأكد من `https://your-domain.com/api/health`.

## النسخ الاحتياطي

شغّل `scripts/backup.sh` على Linux أو `backup-windows.bat` على Windows. السكربت يحفظ قاعدة البيانات وملفات الكورسات المحمية. احتفظ بالنسخ خارج السيرفر أيضًا.

## تحديث الكود

خذ نسخة احتياطية، استبدل ملفات الكود، ثم شغّل نفس أمر Docker. لا تحذف Docker volumes لأنها تحتوي على قاعدة البيانات والملفات.
