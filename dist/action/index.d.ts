import type { Task, ActionResult, UUID } from '../types/index.js';
import { EventBus } from '../core/event-bus.js';
import { Logger } from '../core/logger.js';
import { ErrorHandler } from '../core/error-handler.js';
export type ActionHandler = (params: Record<string, unknown>) => Promise<unknown>;
export declare class ActionExecutor {
    private events;
    private logger;
    private errorHandler;
    private handlers;
    private runningTasks;
    private maxConcurrent;
    constructor(events: EventBus, logger: Logger, errorHandler: ErrorHandler, maxConcurrent?: number);
    private registerDefaults;
    register(action: string, handler: ActionHandler): void;
    unregister(action: string): void;
    execute(task: Task): Promise<ActionResult>;
    cancel(taskId: UUID): boolean;
    cancelAll(): void;
    getRunningTasks(): Task[];
    getRegisteredActions(): string[];
    getRunningCount(): number;
}
