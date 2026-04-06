import type { Goal, Task, Plan, Decision, DecisionOption, ActionResult, UUID } from '../types/index.js';
import { EventBus } from '../core/event-bus.js';
import { Logger } from '../core/logger.js';
export declare class ReasoningEngine {
    private events;
    private logger;
    private goals;
    private plans;
    private decisions;
    private decisionIndex;
    private decisionCount;
    private readonly maxDecisions;
    constructor(events: EventBus, logger: Logger);
    addGoal(goal: Goal): void;
    removeGoal(id: UUID): void;
    getActiveGoals(): Goal[];
    decide(context: Record<string, unknown>, options: DecisionOption[]): Promise<Decision>;
    private scoreOption;
    createPlan(goal: Goal, availableActions: string[]): Promise<Plan>;
    private decomposeGoal;
    evaluateResult(task: Task, result: ActionResult, goal: Goal): number;
    private recordDecision;
    getDecisions(limit?: number): Decision[];
    getPlan(goalId: UUID): Plan | undefined;
    clear(): void;
}
