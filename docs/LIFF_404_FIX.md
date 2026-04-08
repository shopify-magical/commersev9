# 🚨 แก้ไขปัญหา LIFF 404

## 📱 **ปัญหา:**
`https://bizcommerz-cake-shop.pages.dev/line-liff.html` → 404 Page Not Found

## ค้นหา **สาเหตุ:**
ไฟล์ `line-liff.html` ยังไม่ได้ deploy ไปที่ production server

## 🛠️ **วิธีแก้ไข (เลือกอย่างใดอย่างหนึ่ง):**

### **แบบที่ 1: Deploy ใหม่ (แนะนำ)**
```bash
# ถ้าใช้ Cloudflare Pages
npx wrangler pages deploy public --project-name=bizcommerz-cake-shop

# ถ้าใช้ Vercel
vercel --prod

# ถ้าใช้ GitHub Pages
git add .
git commit -m "Add LINE LIFF page"
git push origin main
```

### **แบบที่ 2: ใช้ index.html ชั่วคราว**
ชั่วคราวสามารถใช้:
```
https://bizcommerz-cake-shop.pages.dev/?liff=true
```

แล้วแก้ไข LIFF ID ให้ใช้ index.html:
```
https://liff.line.me/2008523083-1KKafaGY?redirect=index
```

### **แบบที่ 3: สร้าง route ใน _headers**
เพิ่มในไฟล์ `_headers`:
```
/line-liff /line-liff.html 200
```

## 🎯 **ทดสอบหลังแก้ไข:**

### **1. ตรวจสอบว่าไฟล์มีอยู่:**
```
https://bizcommerz-cake-shop.pages.dev/line-liff.html
```

### **2. ทดสอบ LIFF:**
```
https://liff.line.me/2008523083-1KKafaGY
```

### **3. ถ้ายังไม่ได้:**
- ตรวจสอบว่า deploy สำเร็จหรือไม่
- ลองรอ 2-3 นาที (CDN propagation)
- ตรวจสอบว่าไฟล์อยู่ใน public folder

## 🔧 **ถ้าต้องการแก้ไขเร่งด่วน:**

1. **เปิดหน้าเว็บหลัก:**
   ```
   https://bizcommerz-cake-shop.pages.dev/
   ```

2. **ทดสอบ LINE integration ผ่านหน้าอื่น:**
   - สั่งซื้อผ่าน checkout page
   - ตรวจสอบว่าได้รับแจ้งเตือนใน LINE

3. **แก้ไข LIFF endpoint ชั่วคราว:**
   ```
   https://bizcommerz-cake-shop.pages.dev/
   ```

**แค่ deploy ไฟล์ `line-liff.html` ไปที่ production ก็แก้ได้!** 🚀
