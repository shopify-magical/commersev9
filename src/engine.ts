import type { EngineConfig, Goal, Observation, Task, Decision, DecisionOption, UUID, Experience } from './types/index.js';
import { AgentState, Priority, TaskStatus } from './types/index.js';
import { EventBus } from './core/event-bus.js';
import { StateManager } from './core/state-manager.js';
import { Logger } from './core/logger.js';
import { ErrorHandler } from './core/error-handler.js';
import { PerceptionModule, TimerSensor, MetricSensor } from './perception.js';
import { ReasoningEngine } from './reasoning/index.js';
import { ActionExecutor } from './action/index.js';
import { KnowledgeBase, LearningModule } from './learning.js';
import { v4, delay } from './utils.js';

export class AgenticEngine {
  readonly events: EventBus;
  readonly state: StateManager;
  readonly logger: Logger;
  readonly errors: ErrorHandler;
  readonly perception: PerceptionModule;
  readonly reasoning: ReasoningEngine;
  readonly actions: ActionExecutor;
  readonly knowledge: KnowledgeBase;
  readonly learning: LearningModule;

  private running = false;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private tickCount = 0;
  private readonly config: EngineConfig;

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = {
      id: v4(),
      name: config.name ?? 'AgenticEngine',
      tickIntervalMs: config.tickIntervalMs ?? 1000,
      maxConcurrentTasks: config.maxConcurrentTasks ?? 5,
      maxRetries: config.maxRetries ?? 3,
      learningRate: config.learningRate ?? 0.1,
      explorationRate: config.explorationRate ?? 0.3,
      decayRate: config.decayRate ?? 0.995,
      logLevel: config.logLevel ?? 'info',
      enableLearning: config.enableLearning ?? true,
      enableSelfImprovement: config.enableSelfImprovement ?? true,
      failSafeThreshold: config.failSafeThreshold ?? 5,
      knowledgeRetentionDays: config.knowledgeRetentionDays ?? 30,
    };

    this.events = new EventBus();
    this.logger = new Logger(this.config);
    this.errors = new ErrorHandler(this.logger, this.events);
    this.state = new StateManager(this.config);
    this.perception = new PerceptionModule(this.events, this.logger);
    this.reasoning = new ReasoningEngine(this.events, this.logger);
    this.actions = new ActionExecutor(this.events, this.logger, this.errors, this.config.maxConcurrentTasks);
    this.knowledge = new KnowledgeBase(this.config.knowledgeRetentionDays);
    this.learning = new LearningModule(this.knowledge, this.events, this.logger, {
      learningRate: this.config.learningRate,
      explorationRate: this.config.explorationRate,
      decayRate: this.config.decayRate,
    });

    this.setupDefaultSensors();
    this.setupEventHandlers();
    this.logger.info('Engine', `Initialized: ${this.config.name} (${this.config.id})`);
  }

  private setupDefaultSensors(): void {
    this.perception.registerSensor(new TimerSensor());
    this.perception.registerSensor(new MetricSensor(() => {
      const mem = process.memoryUsage();
      return {
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        rss: mem.rss,
        tickCount: this.tickCount,
        uptime: Date.now() - this.state.snapshot().startedAt,
      };
    }));
  }

  private setupEventHandlers(): void {
    this.events.on('observation', (obs: unknown) => {
      const observation = obs as Observation;
      this.logger.debug('Engine', `Observation received: ${observation.type}`, { source: observation.source });
    });

    this.events.on('error', () => {
      if (this.state.isFailSafeTriggered()) {
        this.logger.error('Engine', 'Fail-safe threshold reached - halting');
        this.halt();
      }
    });
  }

  // === Lifecycle ===

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.state.setState('PERCEIVING' as AgentState);
    this.logger.info('Engine', 'Starting autonomous loop');

    this.perception.startAll();

    this.tickTimer = setInterval(() => {
      this.tick().catch(err => {
        this.errors.handle(err, 'Engine');
      });
    }, this.config.tickIntervalMs);

    this.events.emit('engine:started', { id: this.config.id, timestamp: Date.now() });
  }

  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;

    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }

    this.perception.stopAll();
    this.actions.cancelAll();
    this.state.setState('IDLE' as AgentState);

    this.logger.info('Engine', 'Stopped');
    this.events.emit('engine:stopped', { id: this.config.id, timestamp: Date.now() });
  }

  halt(): void {
    this.running = false;
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    this.perception.stopAll();
    this.actions.cancelAll();
    this.state.setState('HALTED' as AgentState);
    this.logger.warn('Engine', 'HALTED');
    this.events.emit('engine:halted', { id: this.config.id, timestamp: Date.now() });
  }

  // === Core Loop ===

  private async tick(): Promise<void> {
    if (!this.running) return;
    this.tickCount++;
    this.state.incrementTick();

    try {
      // Phase 1: Perceive
      this.state.setState('PERCEIVING' as AgentState);
      const observations = this.perception.getObservations(5);

      // Phase 2: Reason
      this.state.setState('REASONING' as AgentState);
      const goals = this.reasoning.getActiveGoals();

      if (goals.length > 0) {
        const goal = goals[0];
        const decisionStart = Date.now();

        // Get available actions
        const availableActions = this.actions.getRegisteredActions();

        // Create plan if not exists
        let plan = this.reasoning.getPlan(goal.id);
        if (!plan) {
          this.state.setState('PLANNING' as AgentState);
          plan = await this.reasoning.createPlan(goal, availableActions);
        }

        // Find next pending task
        const nextTask = plan.tasks.find(t => t.status === 'PENDING' || t.status === 'RETRYING');

        if (nextTask) {
          // Decision: proceed or skip
          const options: DecisionOption[] = [
            {
              id: v4(),
              description: `Execute: ${nextTask.description}`,
              estimatedCost: 1.0,
              estimatedBenefit: 2.0,
              risk: 0.1,
              action: async () => this.actions.execute(nextTask),
            },
            {
              id: v4(),
              description: 'Skip this tick',
              estimatedCost: 0,
              estimatedBenefit: 0,
              risk: 0,
              action: async () => ({ success: true, metrics: { duration: 0, cost: 0, retries: 0 }, timestamp: Date.now() }),
            },
          ];

          const decision = await this.reasoning.decide(
            { goal: goal.id, task: nextTask.id, tick: this.tickCount },
            options,
          );
          this.state.recordDecisionTime(Date.now() - decisionStart);

          // Execute selected option
          if (decision.selected) {
            this.state.setState('EXECUTING' as AgentState);
            const selectedOption = options.find(o => o.id === decision.selected);
            if (selectedOption) {
              const result = await selectedOption.action();

              if (result.success) {
                nextTask.status = 'COMPLETED' as TaskStatus;
                nextTask.result = result;
                nextTask.completedAt = Date.now();
                this.state.recordTaskCompleted(result.metrics.duration);
              } else {
                nextTask.retries++;
                if (nextTask.retries >= nextTask.maxRetries) {
                  nextTask.status = 'FAILED' as TaskStatus;
                  nextTask.error = result.error;
                  this.state.recordTaskFailed();
                } else {
                  nextTask.status = 'RETRYING' as TaskStatus;
                }
              }

              // Learning
              if (this.config.enableLearning) {
                this.state.setState('LEARNING' as AgentState);
                const reward = this.reasoning.evaluateResult(nextTask, result, goal);
                const experience: Experience = {
                  id: v4(),
                  observation: observations[0] ?? {
                    id: v4(), timestamp: Date.now(), source: 'engine', type: 'tick',
                    data: {}, confidence: 1, metadata: {},
                  },
                  decision,
                  result,
                  reward,
                  timestamp: Date.now(),
                };
                this.learning.recordExperience(experience);

                // Periodic training
                if (this.tickCount % 50 === 0) {
                  this.learning.train();
                }
              }

              // Check if plan is complete
              const allDone = plan.tasks.every(t => t.status === 'COMPLETED' || t.status === 'FAILED');
              if (allDone) {
                this.reasoning.removeGoal(goal.id);
                this.logger.info('Engine', `Goal completed: ${goal.description}`);
                this.events.emit('goal:completed', goal);
              }
            }
          }
        } else {
          this.reasoning.removeGoal(goal.id);
        }
      }

      // Periodic knowledge pruning
      if (this.tickCount % 1000 === 0) {
        const pruned = this.knowledge.prune();
        if (pruned > 0) {
          this.logger.info('Engine', `Pruned ${pruned} knowledge entries`);
        }
      }

    } catch (err) {
      this.errors.handle(err instanceof Error ? err : new Error(String(err)), 'Engine');
    }

    if (this.running) {
      const activeGoals = this.reasoning.getActiveGoals();
      this.state.setState(activeGoals.length > 0 ? 'REASONING' as AgentState : 'IDLE' as AgentState);
    }
  }

  // === Public API ===

  submitGoal(description: string, priority: Priority = Priority.MEDIUM, constraints: Record<string, unknown> = {}): Goal {
    const goal: Goal = {
      id: v4(),
      description,
      priority,
      constraints,
      successCriteria: (result) => result.success,
      createdAt: Date.now(),
    };
    this.reasoning.addGoal(goal);
    return goal;
  }

  registerAction(action: string, handler: (params: Record<string, unknown>) => Promise<unknown>): void {
    this.actions.register(action, handler);
  }

  getMetrics() {
    return this.state.getMetrics(
      this.knowledge.size(),
      this.learning.getExperienceCount(),
      this.learning.getModel().accuracy,
    );
  }

  isRunning(): boolean {
    return this.running;
  }

  getConfig(): EngineConfig {
    return { ...this.config };
  }
}
