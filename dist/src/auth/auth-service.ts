/**
 * Authentication and Multi-tenancy Service
 * 
 * Handles user registration, authentication, role-based access control,
 * and tenant management for the Sweet Layers platform.
 */

import type { 
  User, 
  Tenant, 
  AuthSession, 
  RegistrationData, 
  LoginCredentials, 
  AuthResponse
} from '../types/auth.js';
import { 
  UserRole,
  UserStatus,
  TenantStatus
} from '../types/auth.js';
import type { Env } from '../worker.js';

export class AuthService {
  constructor(private env: Env) {}

  // Generate secure token
  private generateToken(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${random}${random2}`;
  }

  // Hash password (simplified - use bcrypt in production)
  private async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt or argon2
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt_key_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Verify password
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  // Register new user
  async register(data: RegistrationData): Promise<AuthResponse> {
    const { email, password, name, phone, role, tenantName, tenantDomain } = data;

    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      return {
        success: false,
        user: null as any,
        token: '',
        expiresAt: 0,
        message: 'User with this email already exists'
      };
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const userId = `user_${Date.now()}`;
    let tenantId: string | undefined;
    let tenant: Tenant | undefined;

    // If admin role, create tenant
    if (role === 'admin' && tenantName && tenantDomain) {
      tenantId = await this.createTenant({
        name: tenantName,
        domain: tenantDomain,
        ownerUserId: userId
      });
      tenant = await this.getTenant(tenantId);
    }

    const user: User = {
      id: userId,
      email: email.toLowerCase(),
      phone: phone || undefined,
      passwordHash,
      name,
      role: role as UserRole,
      tenantId,
      status: UserStatus.ACTIVE,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      preferences: {}
    };

    // Store user
    await this.storeUser(user);

    // Create session
    const token = this.generateToken();
    const session = await this.createSession(userId, tenantId, token);

    return {
      success: true,
      user,
      tenant,
      token,
      expiresAt: session.expiresAt,
      message: 'Registration successful'
    };
  }

  // Authenticate with token (session-based, bypasses login)
  async authenticateWithToken(token: string): Promise<AuthResponse> {
    try {
      const session = await this.getSession(token);
      if (!session) {
        return {
          success: false,
          user: null as any,
          token: '',
          expiresAt: 0,
          message: 'Invalid or expired token'
        };
      }

      // Check session expiry
      if (session.expiresAt < Date.now()) {
        return {
          success: false,
          user: null as any,
          token: '',
          expiresAt: 0,
          message: 'Token expired'
        };
      }

      // Get user
      const user = await this.getUser(session.userId);
      if (!user) {
        return {
          success: false,
          user: null as any,
          token: '',
          expiresAt: 0,
          message: 'User not found'
        };
      }

      // Get tenant if applicable
      let tenant: Tenant | undefined;
      if (session.tenantId) {
        tenant = await this.getTenant(session.tenantId);
      }

      // Update session activity
      session.lastActivity = Date.now();
      await this.storeSession(session);

      return {
        success: true,
        user,
        tenant,
        token,
        expiresAt: session.expiresAt,
        message: 'Authentication successful'
      };
    } catch (error) {
      return {
        success: false,
        user: null as any,
        token: '',
        expiresAt: 0,
        message: 'Authentication failed'
      };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password, tenantId } = credentials;

    // Get user
    const user = await this.getUserByEmail(email.toLowerCase());
    if (!user) {
      console.error(`Login failed: User not found for email ${email.toLowerCase()}`);
      return {
        success: false,
        user: null as any,
        token: '',
        expiresAt: 0,
        message: 'Invalid email or password'
      };
    }

    console.log(`User found: ${user.email}, status: ${user.status}`);

    // Verify password
    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      console.error(`Login failed: Password verification failed for ${email}`);
      return {
        success: false,
        user: null as any,
        token: '',
        expiresAt: 0,
        message: 'Invalid email or password'
      };
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      return {
        success: false,
        user: null as any,
        token: '',
        expiresAt: 0,
        message: `Account is ${user.status}`
      };
    }

    // Check tenant if provided
    if (tenantId && user.tenantId !== tenantId) {
      return {
        success: false,
        user: null as any,
        token: '',
        expiresAt: 0,
        message: 'User does not belong to this tenant'
      };
    }

    // Update last login
    user.lastLoginAt = Date.now();
    await this.storeUser(user);

    // Get tenant if applicable
    let tenant: Tenant | undefined;
    if (user.tenantId) {
      tenant = await this.getTenant(user.tenantId);
    }

    // Create session
    const token = this.generateToken();
    const session = await this.createSession(user.id, user.tenantId, token);

    return {
      success: true,
      user,
      tenant,
      token,
      expiresAt: session.expiresAt,
      message: 'Login successful'
    };
  }

  // Verify token
  async verifyToken(token: string): Promise<{ valid: boolean; user?: User; tenant?: Tenant }> {
    const session = await this.getSession(token);
    if (!session) {
      return { valid: false };
    }

    // Check if session expired
    if (session.expiresAt < Date.now()) {
      return { valid: false };
    }

    // Get user
    const user = await this.getUser(session.userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      return { valid: false };
    }

    // Get tenant if applicable
    let tenant: Tenant | undefined;
    if (user.tenantId) {
      tenant = await this.getTenant(user.tenantId);
    }

    // Update session activity
    session.lastActivity = Date.now();
    await this.storeSession(session);

    return { valid: true, user, tenant };
  }

  // Logout
  async logout(token: string): Promise<void> {
    await this.deleteSession(token);
  }

  // Create tenant
  async createTenant(data: { name: string; domain: string; ownerUserId: string }): Promise<string> {
    const tenantId = `tenant_${Date.now()}`;
    const tenant: Tenant = {
      id: tenantId,
      name: data.name,
      domain: data.domain,
      ownerUserId: data.ownerUserId,
      status: TenantStatus.ACTIVE,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: {
        currency: 'THB',
        language: 'th',
        timezone: 'Asia/Bangkok'
      },
      limits: {
        maxProducts: 100,
        maxOrders: 1000,
        maxUsers: 10
      },
      subscription: {
        plan: 'starter',
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        features: ['basic_analytics', 'email_support']
      }
    };

    await this.storeTenant(tenant);
    return tenantId;
  }

  // Get all tenants (superadmin only)
  async getAllTenants(): Promise<Tenant[]> {
    const keys = await this.env.TENANTS_KV.list({ prefix: 'tenant_' });
    const tenants: Tenant[] = [];
    
    for (const key of keys.keys) {
      const data = await this.env.TENANTS_KV.get(key.name);
      if (data) {
        tenants.push(JSON.parse(data));
      }
    }
    
    return tenants;
  }

  // Get tenant by ID
  async getTenant(tenantId: string): Promise<Tenant | undefined> {
    const data = await this.env.TENANTS_KV.get(tenantId);
    return data ? JSON.parse(data) : undefined;
  }

  // Update tenant
  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    if (tenant) {
      const updated = { ...tenant, ...updates, updatedAt: Date.now() };
      await this.storeTenant(updated);
    }
  }

  // Get users by tenant
  async getUsersByTenant(tenantId: string): Promise<User[]> {
    const keys = await this.env.USERS_KV.list({ prefix: 'user_' });
    const users: User[] = [];
    
    for (const key of keys.keys) {
      const data = await this.env.USERS_KV.get(key.name);
      if (data) {
        try {
          const user = JSON.parse(data);
          if (user.tenantId === tenantId) {
            users.push(user);
          }
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    }
    
    return users;
  }

  // Get all users (debug/admin function)
  async getAllUsers(): Promise<User[]> {
    const keys = await this.env.USERS_KV.list({ prefix: 'user_' });
    const users: User[] = [];
    
    for (const key of keys.keys) {
      const data = await this.env.USERS_KV.get(key.name);
      if (data) {
        try {
          const user = JSON.parse(data);
          users.push(user);
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    }
    
    return users;
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log(`Searching for user with email: ${email.toLowerCase()}`);
      const keys = await this.env.USERS_KV.list({ prefix: 'user_' });
      console.log(`Found ${keys.keys.length} user keys`);
      
      for (const key of keys.keys) {
        const data = await this.env.USERS_KV.get(key.name);
        if (data) {
          try {
            const user = JSON.parse(data);
            console.log(`Checking user: ${user.email} against ${email.toLowerCase()}`);
            if (user.email === email.toLowerCase()) {
              console.log(`Found matching user: ${user.email}`);
              return user;
            }
          } catch (e) {
            console.error('Failed to parse user data:', e);
          }
        }
      }
      
      console.log(`No matching user found for email: ${email.toLowerCase()}`);
      return undefined;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return undefined;
    }
  }

  // Get user by ID
  async getUser(userId: string): Promise<User | undefined> {
    const data = await this.env.USERS_KV.get(userId);
    return data ? JSON.parse(data) : undefined;
  }

  // Update user
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      const updated = { ...user, ...updates, updatedAt: Date.now() };
      await this.storeUser(updated);
    }
  }

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    await this.env.USERS_KV.delete(userId);
  }

  // Store user
  private async storeUser(user: User): Promise<void> {
    try {
      await this.env.USERS_KV.put(user.id, JSON.stringify(user));
      // Also store email -> user_id mapping for faster lookup
      await this.env.USERS_KV.put(`email_${user.email.toLowerCase()}`, user.id);
    } catch (error) {
      console.error('Error storing user:', error);
      throw new Error('Failed to store user');
    }
  }

  // Store tenant
  private async storeTenant(tenant: Tenant): Promise<void> {
    try {
      await this.env.TENANTS_KV.put(tenant.id, JSON.stringify(tenant));
    } catch (error) {
      console.error('Error storing tenant:', error);
      throw new Error('Failed to store tenant');
    }
  }

  // Create session
  private async createSession(userId: string, tenantId: string | undefined, token: string): Promise<AuthSession> {
    const session: AuthSession = {
      id: `session_${Date.now()}`,
      userId,
      tenantId,
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    await this.storeSession(session);
    return session;
  }

  // Get session
  private async getSession(token: string): Promise<AuthSession | undefined> {
    const keys = await this.env.SESSIONS_KV.list({ prefix: 'session_' });
    
    for (const key of keys.keys) {
      const data = await this.env.SESSIONS_KV.get(key.name);
      if (data) {
        const session = JSON.parse(data);
        if (session.token === token) {
          return session;
        }
      }
    }
    
    return undefined;
  }

  // Store session
  private async storeSession(session: AuthSession): Promise<void> {
    await this.env.SESSIONS_KV.put(session.id, JSON.stringify(session));
  }

  // Delete session
  private async deleteSession(token: string): Promise<void> {
    const session = await this.getSession(token);
    if (session) {
      await this.env.SESSIONS_KV.delete(session.id);
    }
  }

  // Check user permission
  hasPermission(user: User, permission: string): boolean {
    // Superadmin has all permissions
    if (user.role === UserRole.SUPERADMIN) {
      return true;
    }

    // Admin has tenant-level permissions
    if (user.role === UserRole.ADMIN) {
      const adminPermissions = [
        'manage_products',
        'manage_orders',
        'manage_users',
        'view_analytics',
        'manage_settings'
      ];
      return adminPermissions.includes(permission);
    }

    // Customer has basic permissions
    if (user.role === UserRole.CUSTOMER) {
      const customerPermissions = [
        'view_products',
        'place_orders',
        'view_own_orders',
        'manage_profile'
      ];
      return customerPermissions.includes(permission);
    }

    return false;
  }
}
