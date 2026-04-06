import type { LogEntry, EngineConfig } from '../types/index.js';
export declare class Logger {
    private config;
    private entries;
    private entryIndex;
    private entryCount;
    private readonly maxEntries;
    private readonly minLevel;
    constructor(config: EngineConfig);
    private shouldLog;
    private addEntry;
    debug(module: string, message: string, data?: unknown): void;
    info(module: string, message: string, data?: unknown): void;
    warn(module: string, message: string, data?: unknown): void;
    error(module: string, message: string, error?: Error, data?: unknown): void;
    getEntries(level?: LogEntry['level'], limit?: number): LogEntry[];
    getEntriesSince(timestamp: number): LogEntry[];
    private getAllEntries;
    clear(): void;
    getStats(): {
        total: number;
        byLevel: Record<string, number>;
    };
}
