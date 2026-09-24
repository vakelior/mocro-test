# مُوكْرُو (MOCRO)

منصة أخبار عربية — منصة أخبار تغطي السياسة والاقتصاد والرياضة والثقافة والتكنولوجيا والأخبار المحلية والعالمية والصحة.

## التقنية

- **الاستضافة**: Cloudflare Pages (`mocro.pages.dev` / `mocro.co`)
- **الواجهة**: HTML + CSS + JavaScript (Vanilla — بدون إطار عمل)
- **قاعدة البيانات**: Supabase (PostgreSQL) — المقالات، الأقسام، الكتّاب
- **الخطوط**: Al-Jazeera Arabic (عبر Google Fonts)

## البنية

```
/
├── index.html          # الصفحة الرئيسية (shell)
├── article.html        # صفحة المقال (SPA shell)
├── category.html       # صفحة القسم (SPA shell)
├── assets/
│   ├── css/            # التنسيقات (tokens, base, components, layout, pages, fonts)
│   └── js/             # السكربتات (config, api, main, shared, home, article, category, search)
├── favicon.svg
├── manifest.json
├── og-image.png
├── robots.txt
├── sitemap.xml
└── news-sitemap.xml
```

## العناوين النظيفة (Clean URLs)

الموقع يستخدم عناوين نظيفة عبر روتينغ خاص بـ Cloudflare Pages Functions:

- `/article/:slug` — صفحة مقال
- `/category/:slug` — صفحة قسم
- روابط قديمة `?slug=` تُعاد توجيهها تلقائياً إلى العناوين النظيفة

## الإعداد المحلي

1. انسخ المستودع: `git clone https://github.com/vakelior/mocro-test.git`
2. افتح `assets/js/config.js` وحدّث بيانات Supabase إذا لزم:
   - `SUPABASE_URL`
   - `SUPABASE_ANON`
3. انشر على Cloudflare Pages من المستودع مباشرة (لنشر الـ Functions الراوتنج)
