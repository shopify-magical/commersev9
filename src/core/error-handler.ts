import { Logger } from './logger.js';
import { EventBus } from './event-bus.js';

export class AgenticError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly module: string,
    public readonly recoverable: boolean = true,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AgenticError';
  }
}

export class ErrorHandler {
  private errorHistory: Array<{ error: Error; timestamp: number; module: string }>;
  private errorIndex = 0;
  private errorCount = 0;
  private readonly maxHistory = 500;

  constructor(
    private logger: Logger,
    private events: EventBus,
  ) {
    this.errorHistory = new Array(this.maxHistory);
  }

  handle(error: Error, module: string, context?: Record<string, unknown>): AgenticError {
    const agenticError = error instanceof AgenticError
      ? error
      : new AgenticError(error.message, 'UNKNOWN_ERROR', module, true, context);

    this.errorHistory[this.errorIndex] = { error: agenticError, timestamp: Date.now(), module };
    this.errorIndex = (this.errorIndex + 1) % this.maxHistory;
    if (this.errorCount < this.maxHistory) this.errorCount++;

    this.logger.error(module, agenticError.message, agenticError, context);
    this.events.emit('error', { error: agenticError, module, context, timestamp: Date.now() });

    return agenticError;
  }

  getErrorRate(windowMs: number = 60000): number {
    const since = Date.now() - windowMs;
    return this.getAllErrors().filter(e => e.timestamp >= since).length;
  }

  getErrorsByModule(module: string): Array<{ error: Error; timestamp: number }> {
    return this.getAllErrors().filter(e => e.module === module);
  }

  getRecentErrors(limit: number = 50): Array<{ error: Error; timestamp: number; module: string }> {
    return this.getAllErrors().slice(-limit);
  }

  private getAllErrors(): Array<{ error: Error; timestamp: number; module: string }> {
    if (this.errorCount === 0) return [];
    if (this.errorCount < this.maxHistory) return this.errorHistory.slice(0, this.errorCount);
    return [
      ...this.errorHistory.slice(this.errorIndex),
      ...this.errorHistory.slice(0, this.errorIndex),
    ];
  }

  clear(): void {
    this.errorIndex = 0;
    this.errorCount = 0;
  }

  async withRetry<T>(
    fn: () => Promise<T>,
    module: string,
    maxRetries: number = 3,
    backoffMs: number = 1000,
  ): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.logger.warn(module, `Attempt ${attempt + 1}/${maxRetries + 1} failed: ${lastError.message}`);
        if (attempt < maxRetries) {
          await this.delay(backoffMs * Math.pow(2, attempt));
        }
      }
    }
    throw this.handle(lastError!, module, { maxRetries, backoffMs });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
