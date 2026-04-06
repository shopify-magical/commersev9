# Agentic Engine v1.0.0

Autonomous AI engine with decision-making, task planning, execution monitoring, and self-improvement.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AgenticEngine                          │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │  Perception   │  │   Reasoning   │  │    Action     │   │
│  │               │  │               │  │               │   │
│  │  • Sensors    │  │  • Goals      │  │  • Handlers   │   │
│  │  • Observers  │  │  • Plans      │  │  • Executor   │   │
│  │  • Filters    │  │  • Decisions  │  │  • Retry      │   │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘   │
│          │                  │                  │            │
│          └──────────────────┼──────────────────┘            │
│                             │                               │
│  ┌──────────────────────────▼──────────────────────────┐   │
│  │                   Core Layer                         │   │
│  │  • EventBus     • StateManager    • Logger          │   │
│  │  • ErrorHandler • Orchestrator                       │   │
│  └──────────────────────────┬──────────────────────────┘   │
│                             │                               │
│  ┌──────────────────────────▼──────────────────────────┐   │
│  │                  Learning Layer                      │   │
│  │  • KnowledgeBase  • ExperienceRecorder               │   │
│  │  • ModelTraining  • Exploration/Exploitation         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### EventBus
Pub/sub event system for decoupled inter-module communication.

### StateManager
Tracks engine state (IDLE → PERCEIVING → REASONING → EXECUTING → LEARNING), metrics, and history.

### Logger
Structured logging with levels (debug/info/warn/error), retention, and filtering.

### ErrorHandler
Centralized error handling with retry logic, error rate tracking, and fail-safe triggers.

## Modules

### PerceptionModule
- **Sensors**: Pluggable sensor system for environment data collection
- **Built-in**: TimerSensor, MetricSensor
- **Features**: Auto-start/stop, validation, observation history

### ReasoningEngine
- **Goals**: Priority-based goal management
- **Planning**: Automatic goal decomposition into tasks
- **Decisions**: Weighted scoring (benefit/cost/risk) option selection

### ActionExecutor
- **Handlers**: Register custom action handlers
- **Retry**: Exponential backoff retry with configurable max attempts
- **Concurrency**: Configurable max concurrent task execution
- **Cancellation**: Task abort support via AbortController

### LearningModule
- **Experience Recording**: Records observation→decision→result→reward tuples
- **Model Training**: Updates decision weights based on accumulated experience
- **Exploration**: Epsilon-greedy with configurable decay
- **Knowledge Base**: Persistent key-value store with confidence scores and pruning

## Configuration

```typescript
interface EngineConfig {
  id: string;                    // Engine instance ID
  name: string;                  // Human-readable name
  tickIntervalMs: number;        // Autonomous loop interval (default: 1000)
  maxConcurrentTasks: number;    // Max parallel tasks (default: 5)
  maxRetries: number;            // Max retry attempts (default: 3)
  learningRate: number;          // Learning rate 0-1 (default: 0.1)
  explorationRate: number;       // Initial exploration rate (default: 0.3)
  decayRate: number;             // Exploration decay per training (default: 0.995)
  logLevel: 'debug'|'info'|'warn'|'error';  // Log level (default: 'info')
  enableLearning: boolean;       // Enable experience recording (default: true)
  enableSelfImprovement: boolean;// Enable model training (default: true)
  failSafeThreshold: number;     // Consecutive errors before halt (default: 5)
  knowledgeRetentionDays: number;// Days to retain knowledge (default: 30)
}
```

## API

### Lifecycle
```typescript
const engine = new AgenticEngine({ name: 'MyAgent' });
await engine.start();   // Start autonomous loop
await engine.stop();    // Graceful shutdown
engine.halt();          // Emergency stop
```

### Goals
```typescript
engine.submitGoal('Collect environment data', Priority.HIGH, { source: 'api' });
```

### Custom Actions
```typescript
engine.registerAction('myAction', async (params) => {
  return { result: 'done' };
});
```

### Events
```typescript
engine.events.on('goal:completed', (goal) => { ... });
engine.events.on('decision', (decision) => { ... });
engine.events.on('model:trained', (model) => { ... });
engine.events.on('error', ({ error, module }) => { ... });
```

### Metrics
```typescript
const metrics = engine.getMetrics();
// { state, tasksCompleted, tasksFailed, avgDecisionTime, avgExecutionTime,
//   knowledgeEntries, experienceCount, modelAccuracy, uptime, memoryUsage }
```

## Autonomous Loop

Each tick executes:
1. **Perceive** — Collect observations from sensors
2. **Reason** — Evaluate goals, create plans, make decisions
3. **Execute** — Run selected actions with retry/fallback
4. **Learn** — Record experience, train model, update knowledge

## Fail-Safe Mechanisms

- **Consecutive error threshold**: Halts engine after N consecutive failures
- **Task abort**: Cancel running tasks via AbortController
- **Retry with backoff**: Exponential backoff on transient failures
- **Knowledge pruning**: Auto-removes stale, low-access entries
- **Exploration decay**: Reduces risky exploration over time

## Running

```bash
# Install
npm install

# Development
npm run dev

# Build
npm run build

# Start
npm start

# Tests
npm test
npm run test:unit
npm run test:integration

# Benchmarks
npm run bench
```

## License

MIT
