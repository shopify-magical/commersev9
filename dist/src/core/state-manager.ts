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

export class StateManager {
  private state: EngineStateData;
  private history: Array<{ timestamp: number; state: AgentState }>;
  private historyIndex = 0;
  private historyCount = 0;
  private readonly maxHistory = 1000;
  readonly events: EventBus;

  constructor(private config: EngineConfig) {
    this.events = new EventBus();
    this.history = new Array(this.maxHistory);
    const now = Date.now();
    this.state = {
      currentState: 'IDLE' as AgentState,
      previousState: 'IDLE' as AgentState,
      tickCount: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      totalDecisionTime: 0,
      decisionCount: 0,
      totalExecutionTime: 0,
      executionCount: 0,
      errorCount: 0,
      consecutiveErrors: 0,
      startedAt: now,
      lastTickAt: now,
    };
  }

  get currentState(): AgentState {
    return this.state.currentState;
  }

  setState(newState: AgentState): void {
    if (newState === this.state.currentState) return;
    const prev = this.state.currentState;
    this.state.previousState = prev;
    this.state.currentState = newState;
    this.history[this.historyIndex] = { timestamp: Date.now(), state: newState };
    this.historyIndex = (this.historyIndex + 1) % this.maxHistory;
    if (this.historyCount < this.maxHistory) this.historyCount++;
    this.events.emit('stateChange', { from: prev, to: newState, timestamp: Date.now() });
  }

  incrementTick(): void {
    this.state.tickCount++;
    this.state.lastTickAt = Date.now();
  }

  recordTaskCompleted(duration: number): void {
    this.state.tasksCompleted++;
    this.state.totalExecutionTime += duration;
    this.state.executionCount++;
    this.state.consecutiveErrors = 0;
  }

  recordTaskFailed(): void {
    this.state.tasksFailed++;
    this.state.errorCount++;
    this.state.consecutiveErrors++;
  }

  recordDecisionTime(duration: number): void {
    this.state.totalDecisionTime += duration;
    this.state.decisionCount++;
  }

  isFailSafeTriggered(): boolean {
    return this.state.consecutiveErrors >= this.config.failSafeThreshold;
  }

  getMetrics(knowledgeEntries: number, experienceCount: number, modelAccuracy: number): MetricsSnapshot {
    const uptime = Date.now() - this.state.startedAt;
    return {
      timestamp: Date.now(),
      state: this.state.currentState,
      tasksCompleted: this.state.tasksCompleted,
      tasksFailed: this.state.tasksFailed,
      avgDecisionTime: this.state.decisionCount > 0
        ? this.state.totalDecisionTime / this.state.decisionCount : 0,
      avgExecutionTime: this.state.executionCount > 0
        ? this.state.totalExecutionTime / this.state.executionCount : 0,
      knowledgeEntries,
      experienceCount,
      modelAccuracy,
      uptime,
      memoryUsage: process.memoryUsage().heapUsed,
    };
  }

  getHistory(): Array<{ timestamp: number; state: AgentState }> {
    if (this.historyCount === 0) return [];
    if (this.historyCount < this.maxHistory) return this.history.slice(0, this.historyCount);
    return [
      ...this.history.slice(this.historyIndex),
      ...this.history.slice(0, this.historyIndex),
    ];
  }

  reset(): void {
    const now = Date.now();
    this.state = {
      currentState: 'IDLE' as AgentState,
      previousState: 'IDLE' as AgentState,
      tickCount: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      totalDecisionTime: 0,
      decisionCount: 0,
      totalExecutionTime: 0,
      executionCount: 0,
      errorCount: 0,
      consecutiveErrors: 0,
      startedAt: now,
      lastTickAt: now,
    };
    this.historyIndex = 0;
    this.historyCount = 0;
    this.events.emit('reset');
  }

  snapshot(): EngineStateData {
    return { ...this.state };
  }
}
