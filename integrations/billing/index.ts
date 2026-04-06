/**
 * Usage Tracking & Billing System
 * Implements tiered pricing, usage metering, and invoice generation
 */

export type BillingPlan = 'starter' | 'professional' | 'enterprise';
export type BillingPeriod = 'monthly' | 'yearly';

export interface PricingPlan {
  id: string;
  name: string;
  plan: BillingPlan;
  period: BillingPeriod;
  basePrice: number;
  pricePerGoal: number;
  pricePer1000APICalls: number;
  includedGoals: number;
  includedAPICalls: number;
  features: string[];
  support: 'community' | 'email' | 'priority' | 'dedicated';
  sla: {
    uptime: number;
    supportResponse: string;
  };
}

export interface UsageRecord {
  tenantId: string;
  period: string;
  goalsSubmitted: number;
  apiCalls: number;
  storage: number;
  computeTime: number;
  cost: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  period: string;
  from: number;
  to: number;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  createdAt: number;
  paidAt?: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export class BillingSystem {
  private plans: Map<string, PricingPlan> = new Map();
  private usage: Map<string, UsageRecord[]> = new Map();
  private invoices: Map<string, Invoice[]> = new Map();

  constructor() {
    this.initializePlans();
  }

  private initializePlans(): void {
    const starterMonthly: PricingPlan = {
      id: 'starter-monthly',
      name: 'Starter',
      plan: 'starter',
      period: 'monthly',
      basePrice: 0,
      pricePerGoal: 0.01,
      pricePer1000APICalls: 0.50,
      includedGoals: 1000,
      includedAPICalls: 10000,
      features: [
        'Basic goal processing',
        'Learning module',
        'Community support',
        'Basic analytics',
      ],
      support: 'community',
      sla: { uptime: 99.0, supportResponse: '72h' },
    };

    const starterYearly: PricingPlan = { ...starterMonthly, period: 'yearly', basePrice: 0 };

    const professionalMonthly: PricingPlan = {
      id: 'professional-monthly',
      name: 'Professional',
      plan: 'professional',
      period: 'monthly',
      basePrice: 99,
      pricePerGoal: 0.005,
      pricePer1000APICalls: 0.25,
      includedGoals: 10000,
      includedAPICalls: 100000,
      features: [
        'Everything in Starter',
        'Custom actions',
        'Webhooks',
        'Priority support',
        'Advanced analytics',
        'API rate limits: 500/min',
      ],
      support: 'email',
      sla: { uptime: 99.5, supportResponse: '24h' },
    };

    const enterpriseYearly: PricingPlan = {
      id: 'enterprise-yearly',
      name: 'Enterprise',
      plan: 'enterprise',
      period: 'yearly',
      basePrice: 499,
      pricePerGoal: 0.002,
      pricePer1000APICalls: 0.10,
      includedGoals: 100000,
      includedAPICalls: 1000000,
      features: [
        'Everything in Professional',
        'White-label branding',
        'Dedicated support',
        'Custom SLAs',
        'Audit logging',
        'HIPAA/SOC2 compliance',
        'Multi-region deployment',
        'Unlimited goals overages',
      ],
      support: 'dedicated',
      sla: { uptime: 99.99, supportResponse: '1h' },
    };

    this.plans.set('starter-monthly', starterMonthly);
    this.plans.set('starter-yearly', starterYearly);
    this.plans.set('professional-monthly', professionalMonthly);
    this.plans.set('enterprise-yearly', enterpriseYearly);
  }

  getPlan(planId: string): PricingPlan | undefined {
    return this.plans.get(planId);
  }

  getAllPlans(): PricingPlan[] {
    return Array.from(this.plans.values());
  }

  recordUsage(tenantId: string, goals: number = 0, apiCalls: number = 0, storage: number = 0, computeTime: number = 0): void {
    const period = this.getCurrentPeriod();
    const key = `${tenantId}:${period}`;
    
    const existing = this.usage.get(key);
    if (existing) {
      existing[0].goalsSubmitted += goals;
      existing[0].apiCalls += apiCalls;
      existing[0].storage += storage;
      existing[0].computeTime += computeTime;
    } else {
      this.usage.set(key, [{
        tenantId,
        period,
        goalsSubmitted: goals,
        apiCalls: apiCalls,
        storage,
        computeTime,
        cost: 0,
      }]);
    }
  }

  calculateCost(tenantId: string, planId: string): number {
    const period = this.getCurrentPeriod();
    const usage = this.usage.get(`${tenantId}:${period}`);
    const plan = this.planById(planId);

    if (!usage || !plan) return 0;

    const goalsOver = Math.max(0, usage[0].goalsSubmitted - plan.includedGoals);
    const apiOver = Math.max(0, usage[0].apiCalls - plan.includedAPICalls);

    const goalsCost = goalsOver * plan.pricePerGoal;
    const apiCost = (apiOver / 1000) * plan.pricePer1000APICalls;

    return plan.basePrice + goalsCost + apiCost;
  }

  generateInvoice(tenantId: string, planId: string): Invoice {
    const period = this.getCurrentPeriod();
    const usage = this.usage.get(`${tenantId}:${period}`);
    const plan = this.planById(planId);

    if (!usage || !plan) {
      throw new Error('No usage or plan found');
    }

    const subtotal = this.calculateCost(tenantId, planId);
    const tax = subtotal * 0.1;

    const invoice: Invoice = {
      id: `inv_${Date.now()}_${tenantId}`,
      tenantId,
      period,
      from: this.getPeriodStart(),
      to: this.getPeriodEnd(),
      items: [
        {
          description: `${plan.name} Plan (${plan.period})`,
          quantity: 1,
          unitPrice: plan.basePrice,
          total: plan.basePrice,
        },
      ],
      subtotal,
      tax,
      total: subtotal + tax,
      status: 'pending',
      createdAt: Date.now(),
    };

    const existing = this.invoices.get(tenantId) ?? [];
    existing.push(invoice);
    this.invoices.set(tenantId, existing);

    return invoice;
  }

  getUsage(tenantId: string, periods: number = 1): UsageRecord[] {
    const result: UsageRecord[] = [];
    for (let i = 0; i < periods; i++) {
      const period = this.getNPeriodsAgo(i);
      const record = this.usage.get(`${tenantId}:${period}`);
      if (record) result.push(...record);
    }
    return result;
  }

  getInvoices(tenantId: string): Invoice[] {
    return this.invoices.get(tenantId) ?? [];
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private getNPeriodsAgo(n: number): string {
    const now = new Date();
    now.setMonth(now.getMonth() - n);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private getPeriodStart(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }

  private getPeriodEnd(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime();
  }

  private planById(planId: string): PricingPlan | undefined {
    return Array.from(this.plans.values()).find(p => p.id === planId || p.plan === planId);
  }

  getPricingTable(): { monthly: PricingPlan[]; yearly: PricingPlan[] } {
    const monthly = Array.from(this.plans.values()).filter(p => p.period === 'monthly');
    const yearly = Array.from(this.plans.values()).filter(p => p.period === 'yearly');
    return { monthly, yearly };
  }
}

export default BillingSystem;