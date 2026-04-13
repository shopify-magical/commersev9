/**
 * Authentication and Multi-tenancy Type Definitions
 */

export enum UserRole {
  SUPERADMIN = 'superadmin', // Platform owner - can manage all tenants
  ADMIN = 'admin',           // Shop admin - can manage their tenant
  CUSTOMER = 'customer',     // Regular user - can shop and manage orders
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum TenantStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  tenantId?: string; // null for superadmin
  status: UserStatus;
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
  preferences: Record<string, unknown>;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  ownerUserId: string;
  status: TenantStatus;
  createdAt: number;
  updatedAt: number;
  settings: {
    currency: string;
    language: string;
    timezone: string;
    customDomain?: string;
    logo?: string;
    theme?: string;
  };
  limits: {
    maxProducts: number;
    maxOrders: number;
    maxUsers: number;
  };
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise';
    expiresAt: number;
    features: string[];
  };
}

export interface AuthSession {
  id: string;
  userId: string;
  tenantId?: string;
  token: string;
  expiresAt: number;
  createdAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  tenantName?: string; // For admin registration creating a new tenant
  tenantDomain?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  tenantId?: string; // Optional for multi-tenant login
}

export interface AuthResponse {
  success: boolean;
  user: User;
  tenant?: Tenant;
  token: string;
  expiresAt: number;
  message: string;
}
