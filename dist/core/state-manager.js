import { EventBus } from './event-bus.js';
export class StateManager {
    config;
    state;
    history;
    historyIndex = 0;
    historyCount = 0;
    maxHistory = 1000;
    events;
    constructor(config) {
        this.config = config;
        this.events = new EventBus();
        this.history = new Array(this.maxHistory);
        const now = Date.now();
        this.state = {
            currentState: 'IDLE',
            previousState: 'IDLE',
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
    get currentState() {
        return this.state.currentState;
    }
    setState(newState) {
        if (newState === this.state.currentState)
            return;
        const prev = this.state.currentState;
        this.state.previousState = prev;
        this.state.currentState = newState;
        this.history[this.historyIndex] = { timestamp: Date.now(), state: newState };
        this.historyIndex = (this.historyIndex + 1) % this.maxHistory;
        if (this.historyCount < this.maxHistory)
            this.historyCount++;
        this.events.emit('stateChange', { from: prev, to: newState, timestamp: Date.now() });
    }
    incrementTick() {
        this.state.tickCount++;
        this.state.lastTickAt = Date.now();
    }
    recordTaskCompleted(duration) {
        this.state.tasksCompleted++;
        this.state.totalExecutionTime += duration;
        this.state.executionCount++;
        this.state.consecutiveErrors = 0;
    }
    recordTaskFailed() {
        this.state.tasksFailed++;
        this.state.errorCount++;
        this.state.consecutiveErrors++;
    }
    recordDecisionTime(duration) {
        this.state.totalDecisionTime += duration;
        this.state.decisionCount++;
    }
    isFailSafeTriggered() {
        return this.state.consecutiveErrors >= this.config.failSafeThreshold;
    }
    getMetrics(knowledgeEntries, experienceCount, modelAccuracy) {
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
    getHistory() {
        if (this.historyCount === 0)
            return [];
        if (this.historyCount < this.maxHistory)
            return this.history.slice(0, this.historyCount);
        return [
            ...this.history.slice(this.historyIndex),
            ...this.history.slice(0, this.historyIndex),
        ];
    }
    reset() {
        const now = Date.now();
        this.state = {
            currentState: 'IDLE',
            previousState: 'IDLE',
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
    snapshot() {
        return { ...this.state };
    }
}
//# sourceMappingURL=state-manager.js.map