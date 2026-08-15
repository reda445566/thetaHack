# 🚀 دليل نشر مشروع ORACLE على Vercel (Vercel Deployment Guide)

تم إعداد المشروع بالكامل ليعمل كـ **مشروع موحد (Monorepo)** على منصة **Vercel** بضغطة زر واحدة بدون الحاجة لربط عدة مشاريع منفصلة!

---

## 📋 الإعدادات المجهزة تلقائياً

1. **إعدادات Vercel الموحدة (`vercel.json`)**:
   - `/(.*)` ➔ تحويل لـ React Frontend.
   - `/api/(.*)` ➔ تحويل لـ Express Backend.
   - `/decide` و `/health` ➔ تحويل لـ Python FastAPI AI Engine.

2. **مدخل محرك الذكاء الاصطناعي (`ai/api/index.py`)**:
   - تم إعداد مدخل Vercel Serverless Function لتشغيل FastAPI محاطاً بـ `@vercel/python`.

3. **التعرف التلقائي على البيئة في الكود**:
   - الواجهة تتعرف تلقائياً على عنوان الباك إند المباشر.

---

## 🛠️ خطوات النشر على Vercel (طريقتان)

### الطريقة الأولى: عبر Vercel Dashboard و GitHub (الأسهل والأفضل ⭐)

1. **ارفع الكود إلى حسابك على GitHub**:
   ```bash
   git add .
   git commit -m "إعداد النشر الموحد على Vercel"
   git push origin main
   ```

2. **افتح موقع Vercel**:
   - سجل الدخول في [Vercel.com](https://vercel.com).
   - اضغط على **"Add New..."** ثم اختار **"Project"**.
   - اختار مستودع المشروع الخاص بك من GitHub.

3. **إضافة متغيرات البيئة (Environment Variables)**:
   في صفحة النشر على Vercel، افتح قسم **Environment Variables** وأضف مفاتيح الذكاء الاصطناعي التي تستخدمها:
   - `NVIDIA_API_KEY` = `nvapi-...` (أو `ZAI_API_KEY` / `OPENAI_API_KEY` / `OPENROUTER_API_KEY`)

4. **اضغط Deploy**:
   - سيقوم Vercel ببناء الفرونت إند، الباك إند، ومحرك الـ AI تلقائياً وإعطائك رابط مباشر شغال (مثال: `https://thetahack.vercel.app`).

---

### الطريقة الثانية: باستخدام Vercel CLI من التيرمينال

1. شغّل الأمر التالي من المجلد الرئيسي للمشروع:
   ```bash
   npx vercel
   ```
2. اتبع التعليمات في التيرمينال (اضغط `Enter` للموافقات الافتراضية).
3. للنشر المباشر للإنتاج (Production):
   ```bash
   npx vercel --prod
   ```
