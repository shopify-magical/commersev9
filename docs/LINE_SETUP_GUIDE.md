# LINE Official Account Integration Setup

## 📱 การตั้งค่า LINE Official Account สำหรับ Sweet Layers

### **ขั้นตอนที่ 1: สร้าง LINE Official Account**

1. **ดาวน์โหลด LINE Official Account Manager**
   - iOS: App Store
   - Android: Google Play Store

2. **สร้าง Account ใหม่**
   - เปิดแอป → เลือก "สร้าง"
   - เลือกประเภท "Business"
   - กรอกข้อมูลร้าน "Sweet Layers"

### **ขั้นตอนที่ 2: ตั้งค่า LINE Bot API**

1. **เข้าไปที่ [LINE Developers Console](https://developers.line.biz)**
2. **Login ด้วย LINE Account**
3. **สร้าง Provider ใหม่**
   - ชื่อ: "Sweet Layers"
   - Email: อีเมลธุรกิจ

4. **สร้าง Channel**
   - เลือก "Messaging API"
   - ชื่อ Channel: "Sweet Layers Bot"
   - อัปโหลดรูปโปรไฟล์ร้าน
   - กรอกรายละเอียดร้าน

### **ขั้นตอนที่ 3: รับคีย์ API**

1. **Channel Access Token (Long-lived)**
   - ไปที่ "Messaging API" tab
   - กด "Issue" เพื่อสร้าง token
   - คัดลอก token นี้

2. **Channel Secret**
   - อยู่ใน "Basic settings" tab
   - คัดลอก secret นี้

3. **Webhook URL**
   - ตั้งค่า: `https://your-domain.com/api/line/webhook`
   - เลือก "Use webhook"

### **ขั้นตอนที่ 4: สร้าง LIFF Application**

1. **ใน LINE Developers Console**
   - เลือก Channel ของคุณ
   - ไปที่ "LIFF" tab
   - กด "Add"

2. **ตั้งค่า LIFF**
   - LIFF ID: จะถูกสร้างอัตโนมัติ
   - Size: Tall (สูง)
   - Endpoint URL: `https://your-domain.com/line-liff.html`
   - Scope: profile, email
   - Bot Link: ON

### **ขั้นตอนที่ 5: อัปเดตโค้ด Sweet Layers**

1. **แก้ไขไฟล์ `js/line-integration.js`**
   ```javascript
   constructor() {
     this.channelAccessToken = 'YOUR_CHANNEL_ACCESS_TOKEN'; // ใส่ token ที่ได้
     this.channelSecret = 'YOUR_CHANNEL_SECRET'; // ใส่ secret ที่ได้
     this.liffId = 'YOUR_LIFF_ID'; // ใส่ LIFF ID ที่ได้
   }
   ```

2. **แก้ไขไฟล์ `line-liff.html`**
   ```javascript
   const LIFF_ID = 'YOUR_LIFF_ID'; // ใส่ LIFF ID ที่ได้
   ```

3. **อัปเดต Webhook URL**
   - ใน LINE Developers Console
   - ใส่: `https://your-domain.com/api/line/webhook`

### **ขั้นตอนที่ 6: ทดสอบการทำงาน**

1. **เพิ่มเพื่อน LINE Official Account**
   - สแกน QR Code จาก LINE Official Account Manager
   - หรือค้นหา "@sweetlayers" ใน LINE

2. **ทดสอบ LIFF**
   - เปิดลิงก์: `https://liff.line.me/YOUR_LIFF_ID`
   - ต้องขึ้นหน้า Sweet Layers ใน LINE

3. **ทดสอบสั่งซื้อ**
   - สั่งซื้อสินค้าผ่านเว็บ
   - ตรวจสอบว่าได้รับแจ้งเตือนใน LINE

## 🚀 ฟีเจอร์ที่ได้หลังตั้งค่า

### **1. แจ้งเตือนออเดอร์ใหม่**
- แจ้งเตือนทันทีเมื่อมีลูกค้าสั่งซื้อ
- แสดงรายละเอียดลูกค้าและออเดอร์
- ปุ่มดูรายละเอียดและติดต่อลูกค้า

### **2. ยืนยันคำสั่งซื้อให้ลูกค้า**
- ส่งข้อความยืนยันอัตโนมัติ
- แสดงรหัสออเดอร์และสถานะ
- ปุ่มติดตามสถานะ

### **3. อัพเดทสถานะการจัดส่ง**
- แจ้งเตือนเมื่อออเดอร์ถูกจัดส่ง
- แสดงสถานะแบบ real-time
- ปุ่มติดตามออเดอร์

### **4. สั่งซื้อผ่าน LINE (LIFF)**
- สั่งซื้อสินค้าได้ใน LINE app
- ใช้ข้อมูล LINE profile โดยอัตโนมัติ
- จัดการตะกร้าใน LINE

### **5. ส่งโปรโมชั่น**
- ส่งข้อความโปรโมชั่นให้ลูกค้า
- รูปภาพสวยงามพร้อมปุ่มสั่งซื้อ
- ทำ targeted marketing

## 💡 คำแนะนำ

### **การปรับแต่งข้อความ**
- แก้ไขข้อความใน `line-integration.js`
- เพิ่มข้อมูลร้านของคุณ
- ปรับสีและสไตล์ให้ตรงกับแบรนด์

### **การจัดการลูกค้า**
- ตอบข้อความลูกค้าอย่างรวดเร็ว
- ใช้ Rich Menu สำหรับคำสั่งที่ใช้บ่อย
- ตั้งค่า Auto Reply สำหรับนอกเวลาทำการ

### **การวิเคราะห์ข้อมูล**
- ใช้ LINE Analytics ดูข้อมูลการใช้งาน
- ติดตาม conversion rate จาก LINE
- วิเคราะห์พฤติกรรมลูกค้า

## 🔧 การแก้ไขปัญหา

### **ปัญหาที่พบบ่อย**
1. **Webhook ไม่ทำงาน** - ตรวจสอบ URL และ SSL certificate
2. **LIFF ไม่โหลด** - ตรวจสอบ LIFF ID และ endpoint URL
3. **ไม่ได้รับข้อความ** - ตรวจสอบ Channel Access Token

### **การตรวจสอบสถานะ**
- ใช้ `lineIntegration.checkLINEStatus()` ตรวจสอบ connection
- ดู log ใน browser console
- ตรวจสอบ Network tab ใน developer tools

---

**เฉลิมฉลอม เมื่อตั้งค่าเสร็จ ระบบจะทำงานอัตโนมัติ 24/7 ช่วยให้คุณไม่พลาดออเดอร์ใดๆ!**
