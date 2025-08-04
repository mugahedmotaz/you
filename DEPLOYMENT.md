# دليل النشر على Railway

## المتطلبات المسبقة

1. **ملف yt-dlp**: تأكد من وجود ملف `bin/yt-dlp.exe` (Windows) أو `bin/yt-dlp` (Linux)
2. **Git Repository**: المشروع مُرفوع على GitHub

## خطوات النشر

### 1. التحضير المحلي

```bash
# تحديث yt-dlp (إذا لزم الأمر)
.\update-ytdlp.bat

# التأكد من عمل التطبيق محلياً
npm run dev
```

### 2. رفع الكود

```bash
# إضافة جميع الملفات (بما فيها bin/yt-dlp)
git add .
git commit -m "Update with working yt-dlp integration"
git push origin main
```

### 3. النشر على Railway

1. اذهب إلى [railway.app](https://railway.app)
2. اختر "Deploy from GitHub repo"
3. اختر المستودع
4. Railway سيستخدم `Dockerfile` تلقائياً

### 4. التحقق من النشر

- Railway سيقوم بتشغيل `scripts/ensure-ytdlp.sh` لضمان وجود yt-dlp
- إذا لم يكن موجوداً، سيتم تحميله تلقائياً
- متغير البيئة `YTDLP_PATH=/app/bin/yt-dlp` محدد في Dockerfile

## استكشاف الأخطاء

### إذا فشل النشر:

1. **تحقق من Logs**: في Railway Dashboard
2. **تأكد من وجود الملفات**:
   - `bin/yt-dlp` أو `bin/yt-dlp.exe`
   - `scripts/ensure-ytdlp.sh`
   - `Dockerfile`

### إذا لم يعمل التحميل:

1. **اختبر API**: `/api/check-ytdlp` يجب أن يرجع `{"installed": true}`
2. **تحقق من Logs**: ابحث عن رسائل خطأ من yt-dlp

## ملاحظات مهمة

- الملف `bin/yt-dlp` مضاف لـ Git (رغم أنه binary)
- `Dockerfile` يضمن تحميل yt-dlp إذا لم يكن موجوداً
- التطبيق يدعم Windows و Linux تلقائياً
