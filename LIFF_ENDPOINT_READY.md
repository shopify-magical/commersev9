# 🎯 LIFF Endpoint พร้อมใช้สำหรับ Sweet Layers

## 📱 **LIFF Endpoint URL ของคุณ:**
```
https://unboggy-fidgetingly-laney.ngrok-free.dev/line-liff.html
```

## 🛠️ **ตั้งค่าใน LINE Developers Console:**

### **1. ไปที่ LIFF Tab**
- เข้า [LINE Developers Console](https://developers.line.biz)
- เลือก Channel ของ Sweet Layers
- ไปที่ "LIFF" tab

### **2. แก้ไข LIFF App**
- กด "Edit" ที่ LIFF app ที่มีอยู่
- อัปเดต "Endpoint URL":
  ```
  https://unboggy-fidgetingly-laney.ngrok-free.dev/line-liff.html
  ```

### **3. บันทึกและทดสอบ**
- กด "Save"
- รอ 1-2 นาที
- ทดสอบ LIFF: `https://liff.line.me/YOUR_LIFF_ID`

## ✅ **ข้อดีของ ngrok:**
- **HTTPS พร้อมใช้** - ไม่ต้องติดตั้ง SSL
- **Public URL** - LINE สามารถเข้าถึงได้
- **Real-time** - อัปเดทโค้ดแล้วเห็นผลทันที
- **Development** - เหมาะสำหรับทดสอบ

## 🚀 **ทดสอบ LIFF:**

### **1. หลังจากตั้งค่า LIFF:**
```
1. เปิด LINE
2. แกะ QR Code ของ Sweet Layers OA
3. คลิกลิงก์ที่ส่งมา
4. ต้องขึ้นหน้า Sweet Layers ใน LINE
```

### **2. ทดสอบฟังก์ชัน:**
- กด "สั่งทำเค้ก" → ต้องเปิด custom-cake.html
- กด "ร้านค้า" → ต้องเปิด shop.html  
- กด "ออเดอร์ของฉัน" → ต้องเปิด profile.html
- กด "ติดต่อเรา" → ต้องเปิด LINE chat

## 🎯 **ถ้า LIFF ไม่ทำงาน:**

### **ตรวจสอบ:**
1. **LIFF ID ถูกต้องไหม**
2. **Endpoint URL ถูกต้องไหม**
3. **Scope ตั้งค่าไหม** (profile, email)
4. **Bot link เปิดไหม**

### **Debug:**
```javascript
// ใน LIFF page ตรวจสอบ
console.log('LIFF Status:', liff.isInClient());
console.log('Login Status:', liff.isLoggedIn());
console.log('LIFF ID:', liff.id);
```

## 📱 **Webhook URL (ถ้าต้องการ):**
```
https://unboggy-fidgetingly-laney.ngrok-free.dev/api/line/webhook
```

**🎉 เสร็จ! ตอนนี้ LIFF ของ Sweet Layers ใช้งานได้แล้ว!**
