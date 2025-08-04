# استخدم صورة رسمية حديثة لـ Node.js
FROM node:20

# تثبيت Python (مطلوب لـ yt-dlp)
RUN apt-get update \
    && apt-get install -y python3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# نسخ ملفات المشروع
COPY . .

# ضمان وجود yt-dlp
RUN chmod +x /app/scripts/ensure-ytdlp.sh && /app/scripts/ensure-ytdlp.sh

# تعيين متغير البيئة لمسار yt-dlp
ENV YTDLP_PATH=/app/bin/yt-dlp

# تثبيت جميع الحزم (بما فيها dev)
RUN npm install

# بناء مشروع Next.js
RUN npm run build

# تشغيل التطبيق
CMD ["npm", "start"]
