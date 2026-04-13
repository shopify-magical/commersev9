// Register New User Script
// This script registers a new user account via the backend API

const API_BASE = 'https://bizcommerz-agentic-engine.sv9.workers.dev';

async function registerUser() {
  const userData = {
    email: 'admin@sweetlayers.com',
    password: 'admin123456',
    name: 'Sweet Layers Admin',
    phone: '+66812345678',
    role: 'admin',
    tenantName: 'Sweet Layers',
    tenantDomain: 'sweetlayers.com'
  };

  try {
    console.log('Registering new user...');
    console.log('Email:', userData.email);
    console.log('Name:', userData.name);
    console.log('Role:', userData.role);

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Registration successful!');
      console.log('📧 Email:', userData.email);
      console.log('🔑 Password:', userData.password);
      console.log('👤 Name:', result.user.name);
      console.log('🎭 Role:', result.user.role);
      console.log('🔑 Token:', result.token);
      console.log('⏰ Expires:', new Date(result.expiresAt).toISOString());
      
      if (result.tenant) {
        console.log('🏢 Tenant:', result.tenant.name);
        console.log('🌐 Domain:', result.tenant.domain);
      }
      
      console.log('\n📋 Login Credentials:');
      console.log(`Email: ${userData.email}`);
      console.log(`Password: ${userData.password}`);
    } else {
      console.log('❌ Registration failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Error during registration:', error.message);
  }
}

registerUser();
