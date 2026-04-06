import { delay } from '../utils.js';
export class ActionExecutor {
    events;
    logger;
    errorHandler;
    handlers = new Map();
    runningTasks = new Map();
    maxConcurrent;
    constructor(events, logger, errorHandler, maxConcurrent = 5) {
        this.events = events;
        this.logger = logger;
        this.errorHandler = errorHandler;
        this.maxConcurrent = maxConcurrent;
        this.registerDefaults();
    }
    registerDefaults() {
        this.register('log', async (params) => {
            this.logger.info('Action:Log', String(params.message ?? 'No message'), params.data);
            return { logged: true };
        });
        this.register('collect', async (params) => {
            await delay(100);
            return { collected: true, source: params.source ?? 'unknown', items: Math.floor(Math.random() * 10) + 1 };
        });
        this.register('analyze', async (params) => {
            await delay(200);
            return { analyzed: true, insights: Math.floor(Math.random() * 5) + 1, confidence: 0.7 + Math.random() * 0.3 };
        });
        this.register('decide', async (params) => {
            await delay(50);
            return { decided: true, choice: `option_${Math.floor(Math.random() * 3) + 1}` };
        });
        this.register('execute', async (params) => {
            await delay(150);
            const success = Math.random() > 0.1;
            if (!success)
                throw new Error('Execution failed randomly');
            return { executed: true, output: 'Task completed successfully' };
        });
        this.register('verify', async (params) => {
            await delay(100);
            return { verified: true, passed: Math.random() > 0.05, score: 0.8 + Math.random() * 0.2 };
        });
        this.register('report', async (params) => {
            await delay(50);
            return { reported: true, format: params.format ?? 'text' };
        });
        this.register('default', async (params) => {
            await delay(100);
            return { completed: true, action: 'default' };
        });
    }
    register(action, handler) {
        this.handlers.set(action, handler);
        this.logger.debug('Action', `Handler registered: ${action}`);
    }
    unregister(action) {
        this.handlers.delete(action);
    }
    async execute(task) {
        if (this.runningTasks.size >= this.maxConcurrent) {
            return {
                success: false,
                error: 'Max concurrent tasks reached',
                metrics: { duration: 0, cost: 0, retries: 0 },
                timestamp: Date.now(),
            };
        }
        const abort = new AbortController();
        this.runningTasks.set(task.id, { task, abort });
        const start = Date.now();
        let retries = 0;
        try {
            const handler = this.handlers.get(task.action) ?? this.handlers.get('default');
            this.logger.info('Action', `Executing: ${task.action} (task: ${task.id})`);
            this.events.emit('task:start', task);
            const result = await this.errorHandler.withRetry(async () => {
                if (abort.signal.aborted)
                    throw new Error('Task aborted');
                return await handler(task.params);
            }, 'Action', task.maxRetries, 500);
            const duration = Date.now() - start;
            const actionResult = {
                success: true,
                data: result,
                metrics: { duration, cost: duration / 1000, retries },
                timestamp: Date.now(),
            };
            this.logger.info('Action', `Completed: ${task.action} in ${duration}ms`);
            this.events.emit('task:complete', { task, result: actionResult });
            return actionResult;
        }
        catch (err) {
            const duration = Date.now() - start;
            const error = err instanceof Error ? err : new Error(String(err));
            const actionResult = {
                success: false,
                error: error.message,
                metrics: { duration, cost: duration / 1000, retries },
                timestamp: Date.now(),
            };
            this.logger.error('Action', `Failed: ${task.action}`, error);
            this.events.emit('task:failed', { task, result: actionResult, error });
            return actionResult;
        }
        finally {
            this.runningTasks.delete(task.id);
        }
    }
    cancel(taskId) {
        const entry = this.runningTasks.get(taskId);
        if (entry) {
            entry.abort.abort();
            this.runningTasks.delete(taskId);
            this.logger.info('Action', `Cancelled task: ${taskId}`);
            return true;
        }
        return false;
    }
    cancelAll() {
        for (const [id, entry] of this.runningTasks) {
            entry.abort.abort();
            this.logger.info('Action', `Cancelled task: ${id}`);
        }
        this.runningTasks.clear();
    }
    getRunningTasks() {
        return [...this.runningTasks.values()].map(e => e.task);
    }
    getRegisteredActions() {
        return [...this.handlers.keys()];
    }
    getRunningCount() {
        return this.runningTasks.size;
    }
}
//# sourceMappingURL=index.js.map