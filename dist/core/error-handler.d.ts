import { Logger } from './logger.js';
import { EventBus } from './event-bus.js';
export declare class AgenticError extends Error {
    readonly code: string;
    readonly module: string;
    readonly recoverable: boolean;
    readonly context?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, module: string, recoverable?: boolean, context?: Record<string, unknown> | undefined);
}
export declare class ErrorHandler {
    private logger;
    private events;
    private errorHistory;
    private errorIndex;
    private errorCount;
    private readonly maxHistory;
    constructor(logger: Logger, events: EventBus);
    handle(error: Error, module: string, context?: Record<string, unknown>): AgenticError;
    getErrorRate(windowMs?: number): number;
    getErrorsByModule(module: string): Array<{
        error: Error;
        timestamp: number;
    }>;
    getRecentErrors(limit?: number): Array<{
        error: Error;
        timestamp: number;
        module: string;
    }>;
    private getAllErrors;
    clear(): void;
    withRetry<T>(fn: () => Promise<T>, module: string, maxRetries?: number, backoffMs?: number): Promise<T>;
    private delay;
}
