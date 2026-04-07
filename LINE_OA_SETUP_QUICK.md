# 🎯 คู่มือตั้งค่า LINE OA สำหรับ Sweet Layers (ทำเอง 5 นาที)

## 📱 ขั้นตอนที่ 1: สร้าง LINE Official Account

### **1.1 ดาวน์โหลดแอป**
- ดาวน์โหลด "LINE Official Account Manager"
- iOS: App Store | Android: Google Play Store

### **1.2 สร้าง Account**
1. เปิดแอป → เลือก "สร้าง"
2. เลือกประเภท "Business"
3. กรอกข้อมูล:
   - ชื่อร้าน: `Sweet Layers`
   - ประเภท: ร้านอาหาร/เบเกอรี่
   - อัปโหลดโลโก้ร้าน

---

## 🛠️ ขั้นตอนที่ 2: ตั้งค่า LINE Bot API

### **2.1 เข้า LINE Developers Console**
1. เปิด [https://developers.line.biz](https://developers.line.biz)
2. Login ด้วย LINE Account ของคุณ
3. กด "Create new provider"

### **2.2 สร้าง Provider**
```
Provider name: Sweet Layers
Email: your-email@sweetlayers.com
```

### **2.3 สร้าง Messaging API Channel**
1. กด "Create a Channel"
2. เลือก "Messaging API"
3. กรอกข้อมูล:
   - Channel name: `Sweet Layers Bot`
   - Channel description: `ร้านเค้กหวานมุม สั่งง่าย จัดส่งไว`
   - App icon: อัปโหลดโลโก้ Sweet Layers
   - Email: อีเมลธุรกิจ

---

## 🔑 ขั้นตอนที่ 3: รับคีย์ API (สำคัญ!)

### **3.1 Channel Access Token**
1. ใน Channel ที่สร้าง → ไปที่ "Messaging API" tab
2. หา "Channel access token (long-lived)"
3. กด "Issue" → คัดลอก token นี้
4. **เก็บไว้ให้ดีๆ นะครับ!**

### **3.2 Channel Secret**
1. ไปที่ "Basic settings" tab
2. หา "Channel secret"
3. กด "Show" → คัดลอก secret
4. **เก็บไว้ด้วย!**

### **3.3 Webhook URL**
1. กลับไป "Messaging API" tab
2. หา "Webhook URL"
3. ใส่: `https://unboggy-fidgetingly-laney.ngrok-free.dev/api/line/webhook`
4. เลือก "Use webhook"
5. กด "Verify" (จะ error ปกติ ยังไม่มี server)

---

## 📱 ขั้นตอนที่ 4: สร้าง LIFF App

### **4.1 สร้าง LIFF**
1. ใน Channel เดิม → ไปที่ "LIFF" tab
2. กด "Add"
3. ตั้งค่า:
   - LIFF app name: `Sweet Layers Shop`
   - Size: `Tall` (สูง)
   - Endpoint URL: `https://oourmnomam/.clm
   - Scope: `profile`, `email`
   - Bot link: `ON`

### **4.2 รับ LIFF ID**
- จะได้ LIFF ID เช่น `1657123456-ABCdefGHI`
- **เก็บไว้เหมือนกัน!**

---

## 🔧 ขั้นตอนที่ 5: อัปเดตโค้ด Sweet Layers

### **5.1 แก้ไขไฟล์ `js/line-integration.js`**
```javascript
constructor() {
  this.channelAccessToken = 'ใส่ Channel Access Token ที่ได้';
  this.channelSecret = 'ใส่ Channel Secret ที่ได้';
  this.liffId = 'ใส่ LIFF ID ที่ได้';
}
```

### **5.2 แก้ไขไฟล์ `line-liff.html`**
```javascript
const LIFF_ID = 'ใส่ LIFF ID ที่ได้';
```

### **5.3 อัปเดต Webhook**
- ใน LINE Developers Console
- ใส่ Webhook URL: `https://unboggy-fidgetingly-laney.ngrok-free.dev/api/line/webhook`
- กด "Verify" (ถ้า error ปกติ ต้องมี server รองรับ)

---

## 🎯 ขั้นตอนที่ 6: ทดสอบระบบ

### **6.1 เพิ่มเพื่อน LINE OA**
1. เปิด LINE → แกะ QR Code ใน LINE Official Account Manager
2. สแกน QR Code → เพิ่มเพื่อน @sweetlayers
3. ทดสอบพิมพ์ข้อความ

### **6.2 ทดสอบ LIFF**
1. เปิดลิงก์: `https://liff.line.me/YOUR_LIFF_ID`
2. ต้องขึ้นหน้า Sweet Layers ใน LINE
3. ทดสอบสั่งซื้อ

### **6.3 ทดสอบสั่งซื้อ**
1. สั่งซื้อผ่านเว็บ `http://localhost:8080`
2. ตรวจสอบว่าได้รับแจ้งเตือนใน LINE
3. ตรวจสอบว่าได้รับข้อความยืนยัน

---

## 🚨 ปัญหาที่อาจเจอ

### **"Webhook URL verification failed"**
- ปกติครับ! ยังไม่มี server รองรับ
- ข้ามไปก่อน ทดสอบอย่างอื่นได้

### **"LIFF doesn't load"**
- ตรวจสอบ LIFF ID ใส่ถูกไหม
- ตรวจสอส endpoint URL ถูกไหม

### **"No notifications"**
- ตรวจสอบ Channel Access Token
- ตรวจสอบว่าเพิ่มเพื่อน OA แล้ว

---

## 🎉 เสร็จแล้ว! ทำอะไรต่อ

### **เมื่อตั้งค่าเสร็จ:**
1. **แจ้งผม** - จะมาช่วย debug อีกที
2. **ทดสอบสั่งซื้อ** - ลองสั่งเค้กผ่านเว็บ
3. **ตรวจสอบแจ้งเตือน** - ดูใน LINE
4. **ปรับแต่งข้อความ** - แก้ไข template ในโค้ด

### **ถ้าอยากให้ผมช่วย:**
- ส่ง Channel Access Token มา (แค่ตัวอย่างก็ได้)
- ส่ง LIFF ID มา
- บอกว่าติดปัญหาตรงไหน

---

## 💡 คำแนะนำ

- **เก็บคีย์ให้ดี** - อย่าเผยแพร่ Channel Access Token
- **ทดสอบทีละขั้น** - ไม่ต้องรีบทำทุกอย่างพร้อมกัน
- **อ่านคู่มือ** - มีรายละเอียดใน `LINE_SETUP_GUIDE.md`

**🎯 ทำตามนี้ 5-10 นาทีก็เสร็จแล้ว! ถ้าติดปัญหาตรงไหน บอกผมได้เลยครับ!**
