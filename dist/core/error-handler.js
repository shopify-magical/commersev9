export class AgenticError extends Error {
    code;
    module;
    recoverable;
    context;
    constructor(message, code, module, recoverable = true, context) {
        super(message);
        this.code = code;
        this.module = module;
        this.recoverable = recoverable;
        this.context = context;
        this.name = 'AgenticError';
    }
}
export class ErrorHandler {
    logger;
    events;
    errorHistory;
    errorIndex = 0;
    errorCount = 0;
    maxHistory = 500;
    constructor(logger, events) {
        this.logger = logger;
        this.events = events;
        this.errorHistory = new Array(this.maxHistory);
    }
    handle(error, module, context) {
        const agenticError = error instanceof AgenticError
            ? error
            : new AgenticError(error.message, 'UNKNOWN_ERROR', module, true, context);
        this.errorHistory[this.errorIndex] = { error: agenticError, timestamp: Date.now(), module };
        this.errorIndex = (this.errorIndex + 1) % this.maxHistory;
        if (this.errorCount < this.maxHistory)
            this.errorCount++;
        this.logger.error(module, agenticError.message, agenticError, context);
        this.events.emit('error', { error: agenticError, module, context, timestamp: Date.now() });
        return agenticError;
    }
    getErrorRate(windowMs = 60000) {
        const since = Date.now() - windowMs;
        return this.getAllErrors().filter(e => e.timestamp >= since).length;
    }
    getErrorsByModule(module) {
        return this.getAllErrors().filter(e => e.module === module);
    }
    getRecentErrors(limit = 50) {
        return this.getAllErrors().slice(-limit);
    }
    getAllErrors() {
        if (this.errorCount === 0)
            return [];
        if (this.errorCount < this.maxHistory)
            return this.errorHistory.slice(0, this.errorCount);
        return [
            ...this.errorHistory.slice(this.errorIndex),
            ...this.errorHistory.slice(0, this.errorIndex),
        ];
    }
    clear() {
        this.errorIndex = 0;
        this.errorCount = 0;
    }
    async withRetry(fn, module, maxRetries = 3, backoffMs = 1000) {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            }
            catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                this.logger.warn(module, `Attempt ${attempt + 1}/${maxRetries + 1} failed: ${lastError.message}`);
                if (attempt < maxRetries) {
                    await this.delay(backoffMs * Math.pow(2, attempt));
                }
            }
        }
        throw this.handle(lastError, module, { maxRetries, backoffMs });
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=error-handler.js.map