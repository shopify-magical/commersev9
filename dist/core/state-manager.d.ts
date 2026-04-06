import type { AgentState, MetricsSnapshot, EngineConfig } from '../types/index.js';
import { EventBus } from './event-bus.js';
export interface EngineStateData {
    currentState: AgentState;
    previousState: AgentState;
    tickCount: number;
    tasksCompleted: number;
    tasksFailed: number;
    totalDecisionTime: number;
    decisionCount: number;
    totalExecutionTime: number;
    executionCount: number;
    errorCount: number;
    consecutiveErrors: number;
    startedAt: number;
    lastTickAt: number;
}
export declare class StateManager {
    private config;
    private state;
    private history;
    private historyIndex;
    private historyCount;
    private readonly maxHistory;
    readonly events: EventBus;
    constructor(config: EngineConfig);
    get currentState(): AgentState;
    setState(newState: AgentState): void;
    incrementTick(): void;
    recordTaskCompleted(duration: number): void;
    recordTaskFailed(): void;
    recordDecisionTime(duration: number): void;
    isFailSafeTriggered(): boolean;
    getMetrics(knowledgeEntries: number, experienceCount: number, modelAccuracy: number): MetricsSnapshot;
    getHistory(): Array<{
        timestamp: number;
        state: AgentState;
    }>;
    reset(): void;
    snapshot(): EngineStateData;
}
