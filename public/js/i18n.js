/**
 * Language System - TH/EN Toggle
 * Drop-in replacement for i18n
 */

const translations = {
  th: {
    home: 'หน้าแรก',
    shop: 'สินค้า',
    about: 'เกี่ยวกับ',
    contact: 'ติดต่อ',
    cart: 'ตะกร้า',
    profile: 'โปรไฟล์',
    login: 'เข้าสู่ระบบ',
    logout: 'ออกจากระบบ',
    search: 'ค้นหา...',
    addToCart: 'เพิ่มลงตะกร้า',
    buyNow: 'ซื้อเลย',
    total: 'รวม',
    checkout: 'ชำระเงิน',
    continueShopping: 'ซื้อต่อ',
    outOfStock: 'สินค้าหมด',
    bestSeller: 'ขายดี',
    new: 'ใหม่',
    sale: 'ลดราคา',
    currency: 'THB',
    freeShipping: 'ฟรีค่าจัดส่ง',
    minimumOrder: 'ขั้นต่ำ',
    filterBy: 'กรอง',
    sortBy: 'เรียง',
    price: 'ราคา',
    category: 'หมวดหมู่',
    allProducts: 'สินค้าทั้งหมด',
    contactUs: 'ติดต่อเรา',
    sendMessage: 'ส่งข้อความ',
    yourName: 'ชื่อ-นามสกุล',
    email: 'อีเมล',
    phone: 'เบอร์โทรศัพท์',
    message: 'ข้อความ',
    submit: 'ส่ง',
    success: 'สำเร็จ',
    error: 'เกิดข้อผิดพลาด',
    processing: 'กำลังดำเนินการ...',
    thankYou: 'ขอบคุณที่สั่งซื้อ',
    orderReceived: 'ได้รับคำสั่งซื้อแล้ว',
    trackOrder: 'ติดตามสถานะ',
    deliveryAddress: 'ที่อยู่จัดส่ง',
    paymentMethod: 'วิธีการชำระเงิน',
    promptPay: 'พร้อมเพย์',
    cod: 'เก็บเงินปลายทาง',
    cash: 'เงินสด',
    orderSummary: 'สรุปคำสั่งซื้อ',
    items: 'รายการ',
    shipping: 'ค่าจัดส่ง',
    grandTotal: 'ยอดรวม',
    placeOrder: 'สั่งซื้อ',
    viewAll: 'ดูทั้งหมด',
    quickOrder: 'สั่งซื้อเร็ว',
    featured: 'สินค้าแนะนำ',
    promo: 'โปรโมชัน',
    blog: 'ข่าวสาร',
    news: 'ข่าวสารและกิจกรรม',
    viewDetails: 'ดูรายละเอียด',
    readMore: 'อ่านต่อ',
    back: 'กลับ',
    next: 'ถัดไป',
    previous: 'ก่อนหน้า',
    close: 'ปิด',
    menu: 'เมนู',
    account: 'บัญชี',
    orders: 'คำสั่งซื้อ',
    addresses: 'ที่อยู่',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    confirm: 'ยืนยัน',
    delete: 'ลบ',
    edit: 'แก้ไข',
    add: 'เพิ่ม',
    update: 'อัปเดต',
    privacyPolicy: 'นโยบายความเป็นส่วนตัว',
    terms: 'เงื่อนไขการใช้งาน',
    cookiePolicy: 'นโยบายคุกกี้',
    copyright: 'สงวนลิขสิทธิ์',
    poweredBy: 'พัฒนาโดย',
    guest: 'แขก',
    welcome: 'ยินดีต้อนรับ',
    welcomeBack: 'ยินดีต้อนรับกลับ',
  },
  en: {
    home: 'Home',
    shop: 'Shop',
    about: 'About',
    contact: 'Contact',
    cart: 'Cart',
    profile: 'Profile',
    login: 'Login',
    logout: 'Logout',
    search: 'Search...',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    total: 'Total',
    checkout: 'Checkout',
    continueShopping: 'Continue Shopping',
    outOfStock: 'Out of Stock',
    bestSeller: 'Best Seller',
    new: 'New',
    sale: 'Sale',
    currency: 'THB',
    freeShipping: 'Free Shipping',
    minimumOrder: 'Min. order',
    filterBy: 'Filter',
    sortBy: 'Sort by',
    price: 'Price',
    category: 'Category',
    allProducts: 'All Products',
    contactUs: 'Contact Us',
    sendMessage: 'Send Message',
    yourName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    message: 'Message',
    submit: 'Submit',
    success: 'Success',
    error: 'Error',
    processing: 'Processing...',
    thankYou: 'Thank You',
    orderReceived: 'Order Received',
    trackOrder: 'Track Order',
    deliveryAddress: 'Delivery Address',
    paymentMethod: 'Payment Method',
    promptPay: 'PromptPay',
    cod: 'Cash on Delivery',
    cash: 'Cash',
    orderSummary: 'Order Summary',
    items: 'Items',
    shipping: 'Shipping',
    grandTotal: 'Grand Total',
    placeOrder: 'Place Order',
    viewAll: 'View All',
    quickOrder: 'Quick Order',
    featured: 'Featured',
    promo: 'Promotions',
    blog: 'Blog',
    news: 'News & Events',
    viewDetails: 'View Details',
    readMore: 'Read More',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    menu: 'Menu',
    account: 'Account',
    orders: 'Orders',
    addresses: 'Addresses',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    update: 'Update',
    privacyPolicy: 'Privacy Policy',
    terms: 'Terms of Service',
    cookiePolicy: 'Cookie Policy',
    copyright: 'All Rights Reserved',
    poweredBy: 'Powered by',
    guest: 'Guest',
    welcome: 'Welcome',
    welcomeBack: 'Welcome Back',
  }
};

class I18n {
  constructor() {
    this.lang = localStorage.getItem('lang') || 'th';
  }

  get(key) {
    return translations[this.lang][key] || translations['th'][key] || key;
  }

  set(lang) {
    if (translations[lang]) {
      this.lang = lang;
      localStorage.setItem('lang', lang);
      this.updateUI();
    }
  }

  toggle() {
    this.set(this.lang === 'th' ? 'en' : 'th');
  }

  updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.get(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.get(key);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.get(key);
    });

    document.documentElement.lang = this.lang;
  }

  getLang() {
    return this.lang;
  }
}

const i18n = new I18n();

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => i18n.updateUI());
} else {
  i18n.updateUI();
}