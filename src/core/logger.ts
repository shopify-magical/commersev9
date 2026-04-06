import type { LogEntry, EngineConfig } from '../types/index.js';

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;

export class Logger {
  private entries: LogEntry[];
  private entryIndex = 0;
  private entryCount = 0;
  private readonly maxEntries: number;
  private readonly minLevel: number;

  constructor(private config: EngineConfig) {
    this.minLevel = LOG_LEVELS[config.logLevel];
    this.maxEntries = 10000;
    this.entries = new Array(this.maxEntries);
  }

  private shouldLog(level: LogEntry['level']): boolean {
    return LOG_LEVELS[level] >= this.minLevel;
  }

  private addEntry(entry: LogEntry): void {
    this.entries[this.entryIndex] = entry;
    this.entryIndex = (this.entryIndex + 1) % this.maxEntries;
    if (this.entryCount < this.maxEntries) this.entryCount++;
    const prefix = `[${new Date(entry.timestamp).toISOString()}] [${entry.level.toUpperCase()}] [${entry.module}]`;
    const msg = `${prefix} ${entry.message}`;
    if (entry.level === 'error') {
      console.error(msg, entry.error ?? '', entry.data ?? '');
    } else if (entry.level === 'warn') {
      console.warn(msg, entry.data ?? '');
    } else {
      console.log(msg, entry.data ?? '');
    }
  }

  debug(module: string, message: string, data?: unknown): void {
    if (this.shouldLog('debug')) {
      this.addEntry({ timestamp: Date.now(), level: 'debug', module, message, data });
    }
  }

  info(module: string, message: string, data?: unknown): void {
    if (this.shouldLog('info')) {
      this.addEntry({ timestamp: Date.now(), level: 'info', module, message, data });
    }
  }

  warn(module: string, message: string, data?: unknown): void {
    if (this.shouldLog('warn')) {
      this.addEntry({ timestamp: Date.now(), level: 'warn', module, message, data });
    }
  }

  error(module: string, message: string, error?: Error, data?: unknown): void {
    if (this.shouldLog('error')) {
      this.addEntry({ timestamp: Date.now(), level: 'error', module, message, error, data });
    }
  }

  getEntries(level?: LogEntry['level'], limit?: number): LogEntry[] {
    const all = this.getAllEntries();
    let filtered = level ? all.filter(e => e.level === level) : all;
    if (limit) filtered = filtered.slice(-limit);
    return filtered;
  }

  getEntriesSince(timestamp: number): LogEntry[] {
    return this.getAllEntries().filter(e => e.timestamp >= timestamp);
  }

  private getAllEntries(): LogEntry[] {
    if (this.entryCount === 0) return [];
    if (this.entryCount < this.maxEntries) return this.entries.slice(0, this.entryCount);
    return [
      ...this.entries.slice(this.entryIndex),
      ...this.entries.slice(0, this.entryIndex),
    ];
  }

  clear(): void {
    this.entryIndex = 0;
    this.entryCount = 0;
  }

  getStats(): { total: number; byLevel: Record<string, number> } {
    const byLevel: Record<string, number> = { debug: 0, info: 0, warn: 0, error: 0 };
    const all = this.getAllEntries();
    for (const entry of all) {
      byLevel[entry.level]++;
    }
    return { total: all.length, byLevel };
  }
}
