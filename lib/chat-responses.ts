// lib/chat-responses.ts - Centralized chat response logic

interface ChatResponse {
  en: string;
  th: string;
}

export const getChatResponse = (input: string): ChatResponse => {
  const lowerInput = input.toLowerCase();

  // Product assistance
  if (lowerInput.includes('ยาง') || lowerInput.includes('rubber') || lowerInput.includes('product') || lowerInput.includes('สินค้า')) {
    return {
      en: 'We offer premium rubber products including latex, rubber sheets, and processed rubber. Would you like to see our product catalog?',
      th: 'เรามีสินค้ายางพาราคุณภาพสูงรวมถึงน้ำยาง, แผ่นยาง และยางแปรรูป คุณต้องการดูแคตตาล็อกสินค้าของเราไหม?',
    };
  }

  // Price assistance
  if (lowerInput.includes('ราคา') || lowerInput.includes('price') || lowerInput.includes('cost')) {
    return {
      en: 'Our rubber prices are competitive and updated daily. Current market prices range from ฿45-60 per kg depending on quality.',
      th: 'ราคายางพาราของเรามีความสามารถแข่งขันได้และอัปเดตทุกวัน ราคาตลาดปัจจุบันอยู่ที่ ฿45-60 ต่อกิโลกรัม ขึ้นอยู่กับคุณภาพ',
    };
  }

  // Delivery assistance
  if (lowerInput.includes('ส่ง') || lowerInput.includes('delivery') || lowerInput.includes('shipping')) {
    return {
      en: 'We offer nationwide delivery across Thailand. Delivery takes 2-5 business days depending on your location.',
      th: 'เรามีบริการจัดส่งทั่วประเทศไทย การจัดส่งใช้เวลา 2-5 วันทำการ ขึ้นอยู่กับพื้นที่ของคุณ',
    };
  }

  // Contact assistance
  if (lowerInput.includes('ติดต่อ') || lowerInput.includes('contact') || lowerInput.includes('help')) {
    return {
      en: 'You can contact our support team at support@rubberplus.com or call 02-XXX-XXXX for immediate assistance.',
      th: 'คุณสามารถติดต่อทีมสนับสนุนของเราได้ที่ support@rubberplus.com หรือโทร 02-XXX-XXXX เพื่อรับความช่วยเหลือทันที',
    };
  }

  // Default responses
  const defaultResponses: ChatResponse[] = [
    { en: 'Thank you for your message! How else can I help you today?', th: 'ขอบคุณสำหรับข้อความของคุณ วันนี้ผมยังช่วยอะไรได้อีกไหมคะ?' },
    { en: 'I understand. Let me help you with that.', th: 'เข้าใจแล้วค่ะ ให้ผมช่วยคุณด้วย' },
    { en: 'Great question! Is there anything specific you need?', th: 'คำถามที่ดีมากค่ะ มีอะไรที่คุณต้องการเฉพาะเจาะจงไหม?' },
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

export const quickActions = [
  { icon: 'trending-up', labelTh: 'เพิ่มผลผลิต', labelEn: 'Increase Yield', actionTh: 'วิธีเพิ่มผลผลิตยางพารา', actionEn: 'How to increase rubber yield' },
  { icon: 'shield', labelTh: 'ความปลอดภัย', labelEn: 'Safety', actionTh: 'มาตรฐานความปลอดภัย', actionEn: 'Safety standards' },
  { icon: 'users', labelTh: 'ตลาด', labelEn: 'Market', actionTh: 'ราคายางพาราวันนี้', actionEn: 'Today rubber prices' },
  { icon: 'leaf', labelTh: 'สินค้า', labelEn: 'Products', actionTh: 'ดูแคตตาล็อกสินค้า', actionEn: 'View product catalog' },
] as const;
