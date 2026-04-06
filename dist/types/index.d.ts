export type UUID = string;
export type Timestamp = number;
export declare enum AgentState {
    IDLE = "IDLE",
    PERCEIVING = "PERCEIVING",
    REASONING = "REASONING",
    PLANNING = "PLANNING",
    EXECUTING = "EXECUTING",
    LEARNING = "LEARNING",
    ERROR = "ERROR",
    HALTED = "HALTED"
}
export declare enum Priority {
    CRITICAL = 0,
    HIGH = 1,
    MEDIUM = 2,
    LOW = 3
}
export declare enum TaskStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    RETRYING = "RETRYING"
}
export interface Environment {
    id: string;
    timestamp: Timestamp;
    data: Record<string, unknown>;
    confidence: number;
    source: string;
}
export interface Observation {
    id: UUID;
    timestamp: Timestamp;
    source: string;
    type: string;
    data: unknown;
    confidence: number;
    metadata: Record<string, unknown>;
}
export interface Goal {
    id: UUID;
    description: string;
    priority: Priority;
    status?: string;
    deadline?: Timestamp;
    constraints: Record<string, unknown>;
    successCriteria: (result: ActionResult) => boolean;
    createdAt: Timestamp;
}
export interface Task {
    id: UUID;
    goalId: UUID;
    description: string;
    action: string;
    params: Record<string, unknown>;
    priority: Priority;
    status: TaskStatus;
    retries: number;
    maxRetries: number;
    result?: ActionResult;
    error?: string;
    createdAt: Timestamp;
    startedAt?: Timestamp;
    completedAt?: Timestamp;
    dependencies: UUID[];
}
export interface Plan {
    id: UUID;
    goalId: UUID;
    tasks: Task[];
    estimatedCost: number;
    createdAt: Timestamp;
    status: TaskStatus;
}
export interface Decision {
    id: UUID;
    context: Record<string, unknown>;
    options: DecisionOption[];
    selected: UUID | null;
    reasoning: string;
    confidence: number;
    timestamp: Timestamp;
}
export interface DecisionOption {
    id: UUID;
    description: string;
    estimatedCost: number;
    estimatedBenefit: number;
    risk: number;
    action: () => Promise<ActionResult>;
}
export interface ActionResult {
    success: boolean;
    data?: unknown;
    error?: string;
    metrics: {
        duration: number;
        cost: number;
        retries: number;
    };
    timestamp: Timestamp;
}
export interface KnowledgeEntry {
    id: UUID;
    category: string;
    key: string;
    value: unknown;
    confidence: number;
    source: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    accessCount: number;
    tags: string[];
}
export interface Experience {
    id: UUID;
    observation: Observation;
    decision: Decision;
    result: ActionResult;
    reward: number;
    timestamp: Timestamp;
}
export interface LearningModel {
    name: string;
    version: number;
    parameters: Record<string, number>;
    accuracy: number;
    trainedAt: Timestamp;
    sampleCount: number;
}
export interface EngineConfig {
    id: string;
    name: string;
    tickIntervalMs: number;
    maxConcurrentTasks: number;
    maxRetries: number;
    learningRate: number;
    explorationRate: number;
    decayRate: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableLearning: boolean;
    enableSelfImprovement: boolean;
    failSafeThreshold: number;
    knowledgeRetentionDays: number;
}
export interface LogEntry {
    timestamp: Timestamp;
    level: 'debug' | 'info' | 'warn' | 'error';
    module: string;
    message: string;
    data?: unknown;
    error?: Error;
}
export interface MetricsSnapshot {
    timestamp: Timestamp;
    state: AgentState;
    tasksCompleted: number;
    tasksFailed: number;
    avgDecisionTime: number;
    avgExecutionTime: number;
    knowledgeEntries: number;
    experienceCount: number;
    modelAccuracy: number;
    uptime: number;
    memoryUsage: number;
    lastTick?: Timestamp;
}
export interface EventBus {
    on(event: string, handler: (...args: unknown[]) => void): () => void;
    emit(event: string, ...args: unknown[]): void;
    off(event: string, handler: (...args: unknown[]) => void): void;
    once(event: string, handler: (...args: unknown[]) => void): void;
}
