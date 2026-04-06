/**
 * Enterprise Monitoring & Logging System
 * Provides comprehensive observability for production deployments
 */

import { EventBus } from '../../src/core/event-bus.js';
import type { UUID, Timestamp } from '../../src/types/index.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  id: UUID;
  timestamp: Timestamp;
  level: LogLevel;
  service: string;
  tenantId?: string;
  message: string;
  metadata?: Record<string, unknown>;
  stack?: string;
  traceId?: string;
  spanId?: string;
}

export interface MetricsPoint {
  timestamp: Timestamp;
  name: string;
  value: number;
  labels: Record<string, string>;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: 'above' | 'below' | 'equals';
  threshold: number;
  metric: string;
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
  cooldown: number;
  lastTriggered?: number;
}

export interface Alert {
  id: UUID;
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  value: number;
  threshold: number;
  timestamp: Timestamp;
  acknowledged: boolean;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Timestamp;
  responseTime: number;
  message?: string;
}

export class EnterpriseMonitor {
  private logs: LogEntry[] = [];
  private metrics: Map<string, MetricsPoint[]> = new Map();
  private alerts: Alert[] = [];
  private alertRules: Map<string, AlertRule> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private eventBus: EventBus;
  private maxLogs: number = 100000;
  private maxMetrics: number = 10000;
  private alertHandlers: ((alert: Alert) => void)[] = [];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupDefaultAlertRules();
    this.setupEventListeners();
  }

  private setupDefaultAlertRules(): void {
    this.addAlertRule({
      id: 'high-error-rate',
      name: 'High Error Rate',
      condition: 'above',
      threshold: 10,
      metric: 'errors_per_minute',
      severity: 'critical',
      enabled: true,
      cooldown: 300000,
    });

    this.addAlertRule({
      id: 'high-latency',
      name: 'High Response Latency',
      condition: 'above',
      threshold: 2000,
      metric: 'avg_response_time_ms',
      severity: 'warning',
      enabled: true,
      cooldown: 60000,
    });

    this.addAlertRule({
      id: 'low-success-rate',
      name: 'Low Success Rate',
      condition: 'below',
      threshold: 0.95,
      metric: 'success_rate',
      severity: 'critical',
      enabled: true,
      cooldown: 60000,
    });

    this.addAlertRule({
      id: 'high-memory',
      name: 'High Memory Usage',
      condition: 'above',
      threshold: 90,
      metric: 'memory_usage_percent',
      severity: 'warning',
      enabled: true,
      cooldown: 300000,
    });
  }

  private setupEventListeners(): void {
    this.eventBus.on('error', (data: unknown) => {
      const { module, error } = data as { module: string; error: Error };
      this.log('error', module, error.message, { stack: error.stack });
    });

    this.eventBus.on('goal:completed', () => {
      this.incrementCounter('goals_completed_total');
    });

    this.eventBus.on('engine:started', () => {
      this.log('info', 'Engine', 'Engine started');
    });

    this.eventBus.on('engine:stopped', () => {
      this.log('info', 'Engine', 'Engine stopped');
    });
  }

  log(level: LogLevel, service: string, message: string, metadata?: Record<string, unknown>, tenantId?: string): void {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      level,
      service,
      tenantId,
      message,
      metadata,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.eventBus.emit('monitor:log', entry);

    if (level === 'error' || level === 'fatal') {
      this.incrementCounter('errors_total', { service, level: level.toString() });
      this.checkAlerts('errors_per_minute', this.getCounter('errors_per_minute') ?? 0);
    }
  }

  recordMetric(name: string, value: number, labels: Record<string, string> = {}): void {
    const point: MetricsPoint = {
      timestamp: Date.now(),
      name,
      value,
      labels,
    };

    const key = `${name}:${JSON.stringify(labels)}`;
    const points = this.metrics.get(key) ?? [];
    points.push(point);
    
    if (points.length > this.maxMetrics) {
      points.shift();
    }
    this.metrics.set(key, points);

    this.checkAlerts(name, value);
  }

  private checkAlerts(metric: string, value: number): void {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled || rule.metric !== metric) continue;
      
      const now = Date.now();
      if (rule.lastTriggered && now - rule.lastTriggered < rule.cooldown) continue;

      let triggered = false;
      switch (rule.condition) {
        case 'above':
          triggered = value > rule.threshold;
          break;
        case 'below':
          triggered = value < rule.threshold;
          break;
        case 'equals':
          triggered = value === rule.threshold;
          break;
      }

      if (triggered) {
        this.triggerAlert(rule, value);
      }
    }
  }

  private triggerAlert(rule: AlertRule, value: number): void {
    rule.lastTriggered = Date.now();
    
    const alert: Alert = {
      id: crypto.randomUUID(),
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: `${rule.name}: ${value} ${rule.condition} threshold ${rule.threshold}`,
      value,
      threshold: rule.threshold,
      timestamp: Date.now(),
      acknowledged: false,
    };

    this.alerts.push(alert);
    this.eventBus.emit('monitor:alert', alert);

    for (const handler of this.alertHandlers) {
      handler(alert);
    }
  }

  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
  }

  removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
  }

  onAlert(handler: (alert: Alert) => void): void {
    this.alertHandlers.push(handler);
  }

  registerHealthCheck(check: HealthCheck): void {
    this.healthChecks.set(check.name, check);
  }

  updateHealthCheck(name: string, status: HealthCheck['status'], message?: string): void {
    const check = this.healthChecks.get(name);
    if (check) {
      check.status = status;
      check.lastCheck = Date.now();
      check.message = message;
    }
  }

  getHealth(): { status: 'healthy' | 'degraded' | 'unhealthy'; checks: HealthCheck[] } {
    const checks = Array.from(this.healthChecks.values());
    const hasCritical = checks.some(c => c.status === 'unhealthy');
    const hasWarning = checks.some(c => c.status === 'degraded');
    
    return {
      status: hasCritical ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy',
      checks,
    };
  }

  incrementCounter(name: string, labels: Record<string, string> = {}): void {
    const key = `${name}:${JSON.stringify(labels)}`;
    const points = this.metrics.get(key) ?? [];
    const lastValue = points.length > 0 ? points[points.length - 1].value : 0;
    this.recordMetric(name, lastValue + 1, labels);
  }

  getCounter(name: string): number | null {
    const entries = this.metrics.get(name);
    if (!entries || entries.length === 0) return null;
    return entries[entries.length - 1].value;
  }

  getLogs(options: {
    level?: LogLevel;
    service?: string;
    tenantId?: string;
    from?: Timestamp;
    to?: Timestamp;
    limit?: number;
  } = {}): LogEntry[] {
    let filtered = this.logs;

    if (options.level) {
      filtered = filtered.filter(l => l.level === options.level);
    }
    if (options.service) {
      filtered = filtered.filter(l => l.service === options.service);
    }
    if (options.tenantId) {
      filtered = filtered.filter(l => l.tenantId === options.tenantId);
    }
    if (options.from) {
      filtered = filtered.filter(l => l.timestamp >= options.from!);
    }
    if (options.to) {
      filtered = filtered.filter(l => l.timestamp <= options.to!);
    }

    const limit = options.limit ?? 100;
    return filtered.slice(-limit);
  }

  getMetrics(name: string, durationMs: number = 3600000): MetricsPoint[] {
    const cutoff = Date.now() - durationMs;
    const allPoints: MetricsPoint[] = [];
    
    for (const [key, points] of this.metrics) {
      if (key.startsWith(name + ':')) {
        allPoints.push(...points.filter(p => p.timestamp >= cutoff));
      }
    }

    return allPoints.sort((a, b) => a.timestamp - b.timestamp);
  }

  getAlerts(acknowledged?: boolean, limit: number = 50): Alert[] {
    let filtered = this.alerts;
    if (acknowledged !== undefined) {
      filtered = filtered.filter(a => a.acknowledged === acknowledged);
    }
    return filtered.slice(-limit);
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  getSystemStats(): {
    logsCount: number;
    metricsCount: number;
    activeAlerts: number;
    services: string[];
    uptime: number;
  } {
    const services = new Set(this.logs.map(l => l.service));
    return {
      logsCount: this.logs.length,
      metricsCount: this.metrics.size,
      activeAlerts: this.alerts.filter(a => !a.acknowledged).length,
      services: Array.from(services),
      uptime: Date.now() - (this.logs[0]?.timestamp ?? Date.now()),
    };
  }
}

export default EnterpriseMonitor;