/**
 * Simple Member System
 * Email/Phone based - no password required
 */

class MemberSystem {
  constructor() {
    this.API_BASE = window.location.hostname.includes('pages.dev')
      ? 'https://bizcommerz-agentic-engine.aekbuffalo.workers.dev'
      : window.location.origin;
  }

  getMember() {
    return JSON.parse(localStorage.getItem('member') || 'null');
  }

  isLoggedIn() {
    const member = this.getMember();
    return member && member.email;
  }

  login(email, name = '') {
    const member = {
      email,
      name: name || email.split('@')[0],
      createdAt: Date.now()
    };
    localStorage.setItem('member', JSON.stringify(member));
    return member;
  }

  logout() {
    localStorage.removeItem('member');
  }

  updateProfile(data) {
    const member = this.getMember();
    if (member) {
      const updated = { ...member, ...data };
      localStorage.setItem('member', JSON.stringify(updated));
      return updated;
    }
    return null;
  }

  async getOrders() {
    const member = this.getMember();
    if (!member || !member.email) return [];
    
    try {
      const res = await fetch(`${this.API_BASE}/export/orders?email=${encodeURIComponent(member.email)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.log('No orders found');
    }
    
    // Fallback: get from localStorage
    return JSON.parse(localStorage.getItem('orders') || '[]');
  }

  async saveOrder(orderData) {
    const member = this.getMember();
    if (member) {
      const order = {
        ...orderData,
        customerEmail: member.email,
        customerName: member.name,
        createdAt: Date.now()
      };
      
      // Save to localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.unshift(order);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      return order;
    }
    return null;
  }

  saveAddress(address) {
    const member = this.getMember();
    if (member) {
      const addresses = JSON.parse(localStorage.getItem('addresses') || '[]');
      addresses.push({ ...address, id: Date.now() });
      localStorage.setItem('addresses', JSON.stringify(addresses));
      return addresses;
    }
    return null;
  }

  getAddresses() {
    return JSON.parse(localStorage.getItem('addresses') || '[]');
  }

  deleteAddress(id) {
    const addresses = this.getAddresses().filter(a => a.id !== id);
    localStorage.setItem('addresses', JSON.stringify(addresses));
    return addresses;
  }
}

const memberSystem = new MemberSystem();

// Show login modal
function showLoginModal() {
  const modal = document.getElementById('loginModal') || createLoginModal();
  modal.classList.add('show');
}

function createLoginModal() {
  const modal = document.createElement('div');
  modal.id = 'loginModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeLoginModal()"></div>
    <div class="modal-content">
      <button class="modal-close" onclick="closeLoginModal()">&times;</button>
      <h2>Welcome Back</h2>
      <p class="modal-subtitle">Enter your email to view orders & history</p>
      <form id="loginForm" onsubmit="handleLogin(event)">
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" required placeholder="your@email.com">
        </div>
        <div class="form-group">
          <label>Name (optional)</label>
          <input type="text" name="name" placeholder="Your name">
        </div>
        <button type="submit" class="btn-primary">Continue</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Add modal styles
  if (!document.getElementById('modalStyles')) {
    const styles = document.createElement('style');
    styles.id = 'modalStyles';
    styles.textContent = `
      .modal { display: none; position: fixed; inset: 0; z-index: 9999; }
      .modal.show { display: flex; align-items: center; justify-content: center; }
      .modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
      .modal-content { position: relative; background: #fff; padding: 32px; border-radius: 16px; width: 90%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
      .modal-close { position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
      .modal h2 { font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 8px; }
      .modal-subtitle { color: #666; margin-bottom: 24px; font-size: 0.9rem; }
      .form-group { margin-bottom: 16px; }
      .form-group label { display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; }
      .form-group input { width: 100%; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
      .btn-primary { width: 100%; padding: 14px; background: #2A6B52; color: #fff; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
    `;
    document.head.appendChild(styles);
  }
  
  return modal;
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('show');
}

function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value;
  const name = form.name.value;
  
  memberSystem.login(email, name);
  closeLoginModal();
  
  // Update UI
  updateMemberUI();
  showToast('Welcome back!');
}

function logout() {
  memberSystem.logout();
  updateMemberUI();
  showToast('Logged out');
}

function updateMemberUI() {
  const member = memberSystem.getMember();
  const profileBtn = document.getElementById('profileBtn');
  const loginBtn = document.getElementById('loginBtn');
  const navProfile = document.getElementById('navProfile');
  const navProfileText = document.getElementById('navProfileText');
  
  if (member) {
    // Update header profile button
    if (profileBtn) {
      profileBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        ${member.name || member.email}
      `;
      profileBtn.onclick = () => window.location.href = '/profile.html';
    }
    
    // Update bottom nav
    if (navProfile) {
      navProfile.onclick = () => window.location.href = '/profile.html';
    }
  } else {
    // Show Login when not logged in
    if (navProfile) {
      navProfile.onclick = () => showLoginModal();
    }
  }
  
  if (navProfileText) {
    navProfileText.textContent = member ? 'Profile' : 'Login';
  }
  
  if (loginBtn) {
    loginBtn.style.display = member ? 'none' : 'flex';
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;z-index:99999;animation:fadeIn 0.3s;';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Init on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => updateMemberUI());
} else {
  updateMemberUI();
}