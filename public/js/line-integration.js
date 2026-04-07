/**
 * LINE Official Account Integration for Sweet Layers
 * เชื่อมต่อระบบสั่งซื้อกับ LINE Bot
 */

class LINEIntegration {
  constructor() {
    this.channelAccessToken = 'f2d21879e9a8f2fdad6625c726a2f5bd'; // Channel Access Token (Long-lived)
    this.channelSecret = '65f763d0af5e321d166cdeff84198182'; // Channel Secret ที่ได้
    this.userId = null;
    this.liffId = '2008523083-1KKafaGY'; // LIFF ID ที่ได้
  }

  // 1. เชื่อมต่อกับ LINE Official Account
  async connectLINE() {
    try {
      // ตรวจสอบว่าอยู่ใน LINE หรือไม่
      if (window.liff) {
        await window.liff.init({ liffId: this.liffId });
        
        if (window.liff.isLoggedIn()) {
          this.userId = window.liff.getDecodedIDToken().sub;
          console.log('LINE User ID:', this.userId);
          return true;
        } else {
          // ถ้ายังไม่ login ให้ทำการ login
          window.liff.login();
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('LINE Connection Error:', error);
      return false;
    }
  }

  // 2. ส่งข้อความแจ้งเตือนออเดอร์ใหม่
  async sendOrderNotification(orderData) {
    const message = {
      type: 'flex',
      altText: `🎂 มีออเดอร์ใหม่จาก ${orderData.customer}`,
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🎂 ออเดอร์ใหม่',
              weight: 'bold',
              color: '#2A6B52',
              size: 'xl'
            }
          ],
          backgroundColor: '#FDF9F5'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `ลูกค้า: ${orderData.customer}`,
              margin: 'md'
            },
            {
              type: 'text',
              text: `เบอร์: ${orderData.phone}`,
              margin: 'md'
            },
            {
              type: 'text',
              text: `ยอดรวม: ฿${orderData.total}`,
              margin: 'md'
            },
            {
              type: 'text',
              text: `การชำระ: ${orderData.payment}`,
              margin: 'md'
            },
            {
              type: 'text',
              text: `รหัสออเดอร์: ${orderData.orderId}`,
              margin: 'md',
              color: '#C4A647',
              weight: 'bold'
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'uri',
                label: 'ดูรายละเอียด',
                uri: `https://your-domain.com/admin/order/${orderData.orderId}`
              }
            },
            {
              type: 'button',
              style: 'secondary',
              height: 'sm',
              action: {
                type: 'uri',
                label: 'ติดต่อลูกค้า',
                uri: `tel:${orderData.phone}`
              }
            }
          ]
        }
      }
    };

    return await this.sendLINEMessage(message);
  }

  // 3. ส่งข้อความยืนยันออเดอร์ให้ลูกค้า
  async sendOrderConfirmation(orderData) {
    const message = {
      type: 'flex',
      altText: `✅ ยืนยันคำสั่งซื้อ #${orderData.orderId}`,
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '✅ ยืนยันคำสั่งซื้อ',
              weight: 'bold',
              color: '#2A6B52',
              size: 'xl'
            }
          ],
          backgroundColor: '#FDF9F5'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `เรียน ${orderData.customer}`,
              weight: 'bold',
              margin: 'md'
            },
            {
              type: 'text',
              text: 'ขอบคุณสำหรับคำสั่งซื้อเค้กของเรา',
              margin: 'md'
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'lg',
              spacing: 'sm',
              contents: [
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: 'รหัสออเดอร์:',
                      flex: 1
                    },
                    {
                      type: 'text',
                      text: orderData.orderId,
                      weight: 'bold',
                      color: '#C4A647'
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: 'รวมทั้งหมด:',
                      flex: 1
                    },
                    {
                      type: 'text',
                      text: `฿${orderData.total}`,
                      weight: 'bold'
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: 'สถานะ:',
                      flex: 1
                    },
                    {
                      type: 'text',
                      text: 'กำลังเตรียมสินค้า',
                      color: '#2A6B52',
                      weight: 'bold'
                    }
                  ]
                }
              ]
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'uri',
                label: 'ติดตามสถานะ',
                uri: `https://your-domain.com/track/${orderData.orderId}`
              }
            },
            {
              type: 'button',
              style: 'secondary',
              height: 'sm',
              action: {
                type: 'uri',
                label: 'ติดต่อเรา',
                uri: 'https://lin.ee/your-line-link'
              }
            }
          ]
        }
      }
    };

    return await this.sendLINEMessage(message);
  }

  // 4. ส่งข้อความแจ้งเตือนสถานะการจัดส่ง
  async sendShippingUpdate(orderData, status) {
    const statusText = {
      'preparing': 'กำลังเตรียมสินค้า',
      'shipped': 'กำลังจัดส่ง',
      'delivered': 'จัดส่งสำเร็จ'
    };

    const message = {
      type: 'flex',
      altText: `📦 อัพเดทสถานะออเดอร์ #${orderData.orderId}`,
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '📦 อัพเดทสถานะ',
              weight: 'bold',
              color: '#2A6B52',
              size: 'xl'
            }
          ],
          backgroundColor: '#FDF9F5'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `ออเดอร์ #${orderData.orderId}`,
              weight: 'bold',
              margin: 'md'
            },
            {
              type: 'text',
              text: statusText[status] || status,
              margin: 'md',
              color: '#2A6B52',
              weight: 'bold'
            },
            {
              type: 'text',
              text: 'ขอบคุณที่รอใจนะคะ ❤️',
              margin: 'md'
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'uri',
                label: 'ดูรายละเอียด',
                uri: `https://your-domain.com/track/${orderData.orderId}`
              }
            }
          ]
        }
      }
    };

    return await this.sendLINEMessage(message);
  }

  // 5. ส่งข้อความโปรโมชั่น
  async sendPromotion(title, description, image) {
    const message = {
      type: 'flex',
      altText: `🎉 ${title}`,
      contents: {
        type: 'bubble',
        hero: {
          type: 'image',
          url: image || 'https://your-domain.com/images/promo.jpg',
          size: 'full',
          aspectRatio: '20:13',
          aspectMode: 'cover'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: title,
              weight: 'bold',
              size: 'xl',
              margin: 'md'
            },
            {
              type: 'text',
              text: description,
              margin: 'md'
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'uri',
                label: 'สั่งซื้อเลย',
                uri: 'https://your-domain.com/shop.html'
              }
            }
          ]
        }
      }
    };

    return await this.sendLINEMessage(message);
  }

  // ส่งข้อความผ่าน LINE API
  async sendLINEMessage(message) {
    try {
      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.channelAccessToken}`
        },
        body: JSON.stringify({
          to: this.userId,
          messages: [message]
        })
      });

      if (response.ok) {
        console.log('LINE message sent successfully');
        return true;
      } else {
        console.error('LINE API Error:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('LINE Message Error:', error);
      return false;
    }
  }

  // 6. สร้าง QR Code สำหรับเพิ่มเพื่อน LINE
  generateLINEQRCode() {
    return `https://line.me/qr/reader?text=${encodeURIComponent('https://lin.ee/your-line-id')}`;
  }

  // 7. ตรวจสอบสถานะการเชื่อมต่อ
  async checkLINEStatus() {
    try {
      const response = await fetch('https://api.line.me/v2/bot/info', {
        headers: {
          'Authorization': `Bearer ${this.channelAccessToken}`
        }
      });

      if (response.ok) {
        const botInfo = await response.json();
        console.log('LINE Bot Status:', botInfo);
        return true;
      }
      return false;
    } catch (error) {
      console.error('LINE Status Check Error:', error);
      return false;
    }
  }
}

// สร้าง instance สำหรับใช้งาน
const lineIntegration = new LINEIntegration();

// Export สำหรับใช้ในหน้าอื่น
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LINEIntegration;
}
