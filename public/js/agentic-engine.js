// Agentic Engine - Browser Compatible Version
// Autonomous agentic engine with decision-making, planning, execution, and self-improvement

// ============================================
// UTILITIES
// ============================================

function v4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function average(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// ============================================
// TYPES / ENUMS
// ============================================

const AgentState = {
  IDLE: 'IDLE',
  PERCEIVING: 'PERCEIVING',
  REASONING: 'REASONING',
  PLANNING: 'PLANNING',
  EXECUTING: 'EXECUTING',
  LEARNING: 'LEARNING',
  ERROR: 'ERROR',
  HALTED: 'HALTED'
};

const Priority = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3
};

const TaskStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  RETRYING: 'RETRYING'
};

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

// ============================================
// EVENT BUS
// ============================================

class EventBus {
  constructor() {
    this.handlers = new Map();
    this.onceHandlers = new Map();
  }

  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event).add(handler);
    return () => this.off(event, handler);
  }

  emit(event, ...args) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      for (const handler of [...handlers]) {
        try {
          handler(...args);
        } catch (err) {
          console.error(`[EventBus] Error in handler for "${event}":`, err);
        }
      }
    }
  }

  off(event, handler) {
    this.handlers.get(event)?.delete(handler);
    const onceWrapper = this.onceHandlers.get(handler);
    if (onceWrapper) {
      this.handlers.get(event)?.delete(onceWrapper);
      this.onceHandlers.delete(handler);
    }
  }

  once(event, handler) {
    const wrapper = (...args) => {
      this.off(event, handler);
      handler(...args);
    };
    this.onceHandlers.set(handler, wrapper);
    this.on(event, wrapper);
  }

  removeAllListeners(event) {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
      this.onceHandlers.clear();
    }
  }

  listenerCount(event) {
    return this.handlers.get(event)?.size ?? 0;
  }
}

// ============================================
// LOGGER
// ============================================

class Logger {
  constructor(config) {
    this.config = config;
    this.entries = [];
    this.maxEntries = 10000;
    this.minLevel = LOG_LEVELS[config.logLevel];
  }

  shouldLog(level) {
    return LOG_LEVELS[level] >= this.minLevel;
  }

  addEntry(entry) {
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
    const prefix = `[${new Date(entry.timestamp).toISOString()}] [${entry.level.toUpperCase()}] [${entry.module}]`;
    const msg = `${prefix} ${entry.message}`;
    if (entry.level === 'error') {
      console.error(msg, entry.error ?? '', entry.data ?? '');
    } else if (entry.level === 'warn') {
      console.warn(msg, entry.data ?? '');
    } else {
      console.log(msg, entry.data ?? '');
    }
  }

  debug(module, message, data) {
    if (this.shouldLog('debug')) {
      this.addEntry({ timestamp: Date.now(), level: 'debug', module, message, data });
    }
  }

  info(module, message, data) {
    if (this.shouldLog('info')) {
      this.addEntry({ timestamp: Date.now(), level: 'info', module, message, data });
    }
  }

  warn(module, message, data) {
    if (this.shouldLog('warn')) {
      this.addEntry({ timestamp: Date.now(), level: 'warn', module, message, data });
    }
  }

  error(module, message, error, data) {
    if (this.shouldLog('error')) {
      this.addEntry({ timestamp: Date.now(), level: 'error', module, message, error, data });
    }
  }

  getEntries(level, limit) {
    let filtered = level ? this.entries.filter(e => e.level === level) : this.entries;
    if (limit) filtered = filtered.slice(-limit);
    return [...filtered];
  }

  clear() {
    this.entries = [];
  }

  getStats() {
    const byLevel = { debug: 0, info: 0, warn: 0, error: 0 };
    for (const entry of this.entries) {
      byLevel[entry.level]++;
    }
    return { total: this.entries.length, byLevel };
  }
}

// ============================================
// ERROR HANDLER
// ============================================

class AgenticError extends Error {
  constructor(message, code, module, recoverable = true, context) {
    super(message);
    this.name = 'AgenticError';
    this.code = code;
    this.module = module;
    this.recoverable = recoverable;
    this.context = context;
  }
}

class ErrorHandler {
  constructor(logger, events) {
    this.logger = logger;
    this.events = events;
    this.errorHistory = [];
    this.maxHistory = 500;
  }

  handle(error, module, context) {
    const agenticError = error instanceof AgenticError
      ? error
      : new AgenticError(error.message, 'UNKNOWN_ERROR', module, true, context);

    this.errorHistory.push({ error: agenticError, timestamp: Date.now(), module });
    if (this.errorHistory.length > this.maxHistory) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistory);
    }

    this.logger.error(module, agenticError.message, agenticError, context);
    this.events.emit('error', { error: agenticError, module, context, timestamp: Date.now() });

    return agenticError;
  }

  async withRetry(fn, module, maxRetries = 3, backoffMs = 1000) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.logger.warn(module, `Attempt ${attempt + 1}/${maxRetries + 1} failed: ${lastError.message}`);
        if (attempt < maxRetries) {
          await delay(backoffMs * Math.pow(2, attempt));
        }
      }
    }
    throw this.handle(lastError, module, { maxRetries, backoffMs });
  }
}

// ============================================
// STATE MANAGER
// ============================================

class StateManager {
  constructor(config) {
    this.config = config;
    this.events = new EventBus();
    const now = Date.now();
    this.state = {
      currentState: AgentState.IDLE,
      previousState: AgentState.IDLE,
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
      lastTickAt: now
    };
    this.history = [];
    this.maxHistory = 1000;
  }

  get currentState() {
    return this.state.currentState;
  }

  setState(newState) {
    if (newState === this.state.currentState) return;
    const prev = this.state.currentState;
    this.state.previousState = prev;
    this.state.currentState = newState;
    this.history.push({ timestamp: Date.now(), state: newState });
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
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
      memoryUsage: performance?.memory?.usedJSHeapSize || 0
    };
  }

  reset() {
    const now = Date.now();
    this.state = {
      currentState: AgentState.IDLE,
      previousState: AgentState.IDLE,
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
      lastTickAt: now
    };
    this.history = [];
    this.events.emit('reset');
  }
}

// ============================================
// PERCEPTION MODULE
// ============================================

class Sensor {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.lastReading = null;
    this.enabled = true;
  }

  getLastReading() {
    return this.lastReading;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

class TimerSensor extends Sensor {
  constructor() {
    super('timer', 'temporal');
    this.tickCount = 0;
  }

  async read() {
    this.tickCount++;
    const now = Date.now();
    this.lastReading = {
      id: `obs_${now}_${this.tickCount}`,
      timestamp: now,
      source: this.id,
      type: this.type,
      data: { tick: this.tickCount, time: now },
      confidence: 1.0,
      metadata: {}
    };
    return this.lastReading;
  }

  validate(data) {
    return typeof data === 'object' && data !== null && 'tick' in data;
  }
}

class MetricSensor extends Sensor {
  constructor(getMetrics) {
    super('metrics', 'system');
    this.getMetrics = getMetrics;
  }

  async read() {
    const metrics = this.getMetrics();
    this.lastReading = {
      id: `obs_metrics_${Date.now()}`,
      timestamp: Date.now(),
      source: this.id,
      type: this.type,
      data: metrics,
      confidence: 1.0,
      metadata: {}
    };
    return this.lastReading;
  }

  validate(data) {
    return typeof data === 'object' && data !== null;
  }
}

class PerceptionModule {
  constructor(events, logger) {
    this.events = events;
    this.logger = logger;
    this.sensors = new Map();
    this.observations = [];
    this.maxObservations = 1000;
    this.timers = new Map();
  }

  registerSensor(sensor) {
    this.sensors.set(sensor.id, sensor);
    this.logger.info('Perception', `Sensor registered: ${sensor.id} (${sensor.type})`);
    this.events.emit('sensor:registered', { id: sensor.id, type: sensor.type });
  }

  unregisterSensor(id) {
    this.stopSensor(id);
    this.sensors.delete(id);
    this.logger.info('Perception', `Sensor unregistered: ${id}`);
  }

  startSensor(id, intervalMs) {
    const sensor = this.sensors.get(id);
    if (!sensor || !sensor.isEnabled()) return;

    this.stopSensor(id);
    const timer = setInterval(async () => {
      try {
        const observation = await sensor.read();
        if (sensor.validate(observation.data)) {
          this.addObservation(observation);
          this.events.emit('observation', observation);
        }
      } catch (err) {
        this.logger.error('Perception', `Sensor ${id} read failed`, err);
      }
    }, intervalMs);

    this.timers.set(id, timer);
    this.logger.info('Perception', `Sensor started: ${id} @ ${intervalMs}ms`);
  }

  stopSensor(id) {
    const timer = this.timers.get(id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(id);
      this.logger.info('Perception', `Sensor stopped: ${id}`);
    }
  }

  startAll() {
    for (const [id, sensor] of this.sensors) {
      if (sensor.isEnabled()) {
        this.startSensor(id, 5000);
      }
    }
  }

  stopAll() {
    for (const id of this.timers.keys()) {
      this.stopSensor(id);
    }
  }

  addObservation(obs) {
    this.observations.push(obs);
    if (this.observations.length > this.maxObservations) {
      this.observations = this.observations.slice(-this.maxObservations);
    }
  }

  getObservations(limit, type) {
    let filtered = type ? this.observations.filter(o => o.type === type) : this.observations;
    if (limit) filtered = filtered.slice(-limit);
    return [...filtered];
  }

  getLatestObservation(type) {
    if (type) {
      for (let i = this.observations.length - 1; i >= 0; i--) {
        if (this.observations[i].type === type) return this.observations[i];
      }
      return null;
    }
    return this.observations.length > 0 ? this.observations[this.observations.length - 1] : null;
  }

  clear() {
    this.stopAll();
    this.observations = [];
  }
}

// ============================================
// ACTION EXECUTOR
// ============================================

class ActionExecutor {
  constructor(events, logger, errorHandler, maxConcurrent) {
    this.events = events;
    this.logger = logger;
    this.errorHandler = errorHandler;
    this.maxConcurrent = maxConcurrent;
    this.handlers = new Map();
    this.runningTasks = new Map();

    this.register('default', async () => ({ success: true }));
  }

  register(action, handler) {
    this.handlers.set(action, handler);
    this.logger.info('Action', `Registered: ${action}`);
  }

  async execute(task) {
    if (this.runningTasks.size >= this.maxConcurrent) {
      return {
        success: false,
        error: 'Max concurrent tasks reached',
        metrics: { duration: 0, cost: 0, retries: 0 },
        timestamp: Date.now()
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

      const result = await this.errorHandler.withRetry(
        async () => {
          if (abort.signal.aborted) throw new Error('Task aborted');
          return await handler(task.params);
        },
        'Action',
        task.maxRetries,
        500
      );

      const duration = Date.now() - start;
      const actionResult = {
        success: true,
        data: result,
        metrics: { duration, cost: duration / 1000, retries },
        timestamp: Date.now()
      };

      this.logger.info('Action', `Completed: ${task.action} in ${duration}ms`);
      this.events.emit('task:complete', { task, result: actionResult });
      return actionResult;

    } catch (err) {
      const duration = Date.now() - start;
      const error = err instanceof Error ? err : new Error(String(err));
      const actionResult = {
        success: false,
        error: error.message,
        metrics: { duration, cost: duration / 1000, retries },
        timestamp: Date.now()
      };

      this.logger.error('Action', `Failed: ${task.action}`, error);
      this.events.emit('task:failed', { task, result: actionResult, error });
      return actionResult;

    } finally {
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
}

// ============================================
// LEARNING MODULE
// ============================================

class KnowledgeBase {
  constructor(retentionDays = 30) {
    this.retentionDays = retentionDays;
    this.entries = new Map();
    this.index = new Map();
  }

  set(category, key, value, confidence = 1.0, source = 'engine') {
    const indexKey = `${category}:${key}`;
    const existingId = this.index.get(indexKey);

    if (existingId) {
      const existing = this.entries.get(existingId);
      existing.value = value;
      existing.confidence = confidence;
      existing.updatedAt = Date.now();
      existing.accessCount++;
      return existing;
    }

    const entry = {
      id: v4(),
      category,
      key,
      value,
      confidence,
      source,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      accessCount: 0,
      tags: []
    };

    this.entries.set(entry.id, entry);
    this.index.set(indexKey, entry.id);
    return entry;
  }

  get(category, key) {
    const indexKey = `${category}:${key}`;
    const id = this.index.get(indexKey);
    if (!id) return null;
    const entry = this.entries.get(id);
    entry.accessCount++;
    return entry;
  }

  query(category, tag) {
    let results = [...this.entries.values()];
    if (category) results = results.filter(e => e.category === category);
    if (tag) results = results.filter(e => e.tags.includes(tag));
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  size() {
    return this.entries.size;
  }
}

class LearningModule {
  constructor(knowledge, events, logger, config) {
    this.knowledge = knowledge;
    this.events = events;
    this.logger = logger;
    this.config = config;
    this.experiences = [];
    this.maxExperiences = 5000;
    this.explorationRate = config.explorationRate;
    this.model = {
      name: 'default',
      version: 0,
      parameters: {
        bias_success: 0.5,
        bias_speed: 0.3,
        bias_cost: 0.2,
        exploration_weight: config.explorationRate
      },
      accuracy: 0.5,
      trainedAt: Date.now(),
      sampleCount: 0
    };
  }

  recordExperience(experience) {
    this.experiences.push(experience);
    if (this.experiences.length > this.maxExperiences) {
      this.experiences = this.experiences.slice(-this.maxExperiences);
    }

    if (experience.result.success) {
      const action = experience.decision.options.find(o => o.id === experience.decision.selected);
      if (action) {
        this.knowledge.set('actions', action.description, {
          avgDuration: experience.result.metrics.duration,
          successRate: 1.0,
          lastUsed: Date.now()
        }, experience.reward / 3, 'learning');
      }
    }

    this.events.emit('experience:recorded', experience);
    this.logger.debug('Learning', `Experience recorded, reward: ${experience.reward.toFixed(2)}`);
  }

  train() {
    if (this.experiences.length < 10) {
      this.logger.debug('Learning', 'Not enough experiences to train');
      return;
    }

    const start = Date.now();
    const recent = this.experiences.slice(-100);

    const successes = recent.filter(e => e.result.success).length;
    const successRate = successes / recent.length;
    const avgReward = average(recent.map(e => e.reward));

    this.model.parameters.bias_success = clamp(
      this.model.parameters.bias_success + this.config.learningRate * (successRate - 0.5),
      0.1, 1.0
    );

    this.model.parameters.bias_speed = clamp(
      this.model.parameters.bias_speed + this.config.learningRate * (avgReward > 0 ? 0.01 : -0.01),
      0.1, 1.0
    );

    this.explorationRate = Math.max(0.01, this.explorationRate * this.config.decayRate);
    this.model.parameters.exploration_weight = this.explorationRate;

    this.model.accuracy = clamp(successRate * 0.7 + this.model.accuracy * 0.3, 0, 1);
    this.model.version++;
    this.model.sampleCount = this.experiences.length;
    this.model.trainedAt = Date.now();

    const duration = Date.now() - start;
    this.logger.info('Learning', `Model trained v${this.model.version} in ${duration}ms`, {
      accuracy: this.model.accuracy.toFixed(3),
      explorationRate: this.explorationRate.toFixed(3),
      samples: this.experiences.length
    });

    this.events.emit('model:trained', this.model);
  }

  shouldExplore() {
    return Math.random() < this.explorationRate;
  }

  getExplorationRate() {
    return this.explorationRate;
  }

  getModel() {
    return { ...this.model };
  }

  getExperienceCount() {
    return this.experiences.length;
  }

  getStats() {
    if (this.experiences.length === 0) return { total: 0, successRate: 0, avgReward: 0 };
    const recent = this.experiences.slice(-100);
    return {
      total: this.experiences.length,
      successRate: recent.filter(e => e.result.success).length / recent.length,
      avgReward: average(recent.map(e => e.reward))
    };
  }
}

// ============================================
// REASONING ENGINE
// ============================================

class ReasoningEngine {
  constructor(events, logger) {
    this.events = events;
    this.logger = logger;
    this.goals = new Map();
    this.plans = new Map();
  }

  addGoal(goal) {
    this.goals.set(goal.id, goal);
    this.logger.info('Reasoning', `Goal added: ${goal.description}`);
    this.events.emit('goal:added', goal);
  }

  removeGoal(goalId) {
    this.goals.delete(goalId);
    this.plans.delete(goalId);
    this.logger.info('Reasoning', `Goal removed: ${goalId}`);
  }

  getActiveGoals() {
    return [...this.goals.values()].sort((a, b) => a.priority - b.priority);
  }

  getPlan(goalId) {
    return this.plans.get(goalId);
  }

  async createPlan(goal, availableActions) {
    const tasks = availableActions.slice(0, 3).map((action, i) => ({
      id: v4(),
      goalId: goal.id,
      description: `Execute ${action}`,
      action,
      params: {},
      priority: goal.priority,
      status: TaskStatus.PENDING,
      retries: 0,
      maxRetries: 3,
      createdAt: Date.now(),
      dependencies: i > 0 ? [v4()] : []
    }));

    const plan = {
      id: v4(),
      goalId: goal.id,
      tasks,
      estimatedCost: tasks.length,
      createdAt: Date.now(),
      status: TaskStatus.PENDING
    };

    this.plans.set(goal.id, plan);
    this.logger.info('Reasoning', `Plan created for goal: ${goal.description}`);
    return plan;
  }

  async decide(context, options) {
    const selected = options.length > 0 ? options[0].id : null;
    const decision = {
      id: v4(),
      context,
      options,
      selected,
      reasoning: 'Selected first available option',
      confidence: 0.8,
      timestamp: Date.now()
    };
    this.events.emit('decision', decision);
    return decision;
  }

  evaluateResult(task, result, goal) {
    return result.success ? 1.0 : -0.5;
  }
}

// ============================================
// AGENTIC ENGINE (Main Class)
// ============================================

class AgenticEngine {
  constructor(config = {}) {
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
      knowledgeRetentionDays: config.knowledgeRetentionDays ?? 30
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
      decayRate: this.config.decayRate
    });

    this.running = false;
    this.tickTimer = null;
    this.tickCount = 0;

    this.setupDefaultSensors();
    this.setupEventHandlers();
    this.logger.info('Engine', `Initialized: ${this.config.name} (${this.config.id})`);
  }

  setupDefaultSensors() {
    this.perception.registerSensor(new TimerSensor());
    this.perception.registerSensor(new MetricSensor(() => ({
      tickCount: this.tickCount,
      uptime: Date.now() - this.state.state.startedAt
    })));
  }

  setupEventHandlers() {
    this.events.on('observation', (obs) => {
      this.logger.debug('Engine', `Observation received: ${obs.type}`, { source: obs.source });
    });

    this.events.on('error', () => {
      if (this.state.isFailSafeTriggered()) {
        this.logger.error('Engine', 'Fail-safe threshold reached - halting');
        this.halt();
      }
    });
  }

  async start() {
    if (this.running) return;
    this.running = true;
    this.state.setState(AgentState.PERCEIVING);
    this.logger.info('Engine', 'Starting autonomous loop');

    this.perception.startAll();

    this.tickTimer = setInterval(() => {
      this.tick().catch(err => {
        this.errors.handle(err, 'Engine');
      });
    }, this.config.tickIntervalMs);

    this.events.emit('engine:started', { id: this.config.id, timestamp: Date.now() });
  }

  async stop() {
    if (!this.running) return;
    this.running = false;

    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }

    this.perception.stopAll();
    this.actions.cancelAll();
    this.state.setState(AgentState.IDLE);

    this.logger.info('Engine', 'Stopped');
    this.events.emit('engine:stopped', { id: this.config.id, timestamp: Date.now() });
  }

  halt() {
    this.running = false;
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    this.perception.stopAll();
    this.actions.cancelAll();
    this.state.setState(AgentState.HALTED);
    this.logger.warn('Engine', 'HALTED');
    this.events.emit('engine:halted', { id: this.config.id, timestamp: Date.now() });
  }

  async tick() {
    if (!this.running) return;
    this.tickCount++;
    this.state.incrementTick();

    try {
      this.state.setState(AgentState.PERCEIVING);
      const observations = this.perception.getObservations(5);

      this.state.setState(AgentState.REASONING);
      const goals = this.reasoning.getActiveGoals();

      if (goals.length > 0) {
        const goal = goals[0];
        const decisionStart = Date.now();

        const availableActions = this.actions.getRegisteredActions();
        let plan = this.reasoning.getPlan(goal.id);
        if (!plan) {
          this.state.setState(AgentState.PLANNING);
          plan = await this.reasoning.createPlan(goal, availableActions);
        }

        const nextTask = plan.tasks.find(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.RETRYING);

        if (nextTask) {
          const options = [
            {
              id: v4(),
              description: `Execute: ${nextTask.description}`,
              estimatedCost: 1.0,
              estimatedBenefit: 2.0,
              risk: 0.1,
              action: async () => this.actions.execute(nextTask)
            },
            {
              id: v4(),
              description: 'Skip this tick',
              estimatedCost: 0,
              estimatedBenefit: 0,
              risk: 0,
              action: async () => ({ success: true, metrics: { duration: 0, cost: 0, retries: 0 }, timestamp: Date.now() })
            }
          ];

          const decision = await this.reasoning.decide(
            { goal: goal.id, task: nextTask.id, tick: this.tickCount },
            options
          );
          this.state.recordDecisionTime(Date.now() - decisionStart);

          if (decision.selected) {
            this.state.setState(AgentState.EXECUTING);
            const selectedOption = options.find(o => o.id === decision.selected);
            if (selectedOption) {
              const result = await selectedOption.action();

              if (result.success) {
                nextTask.status = TaskStatus.COMPLETED;
                nextTask.result = result;
                nextTask.completedAt = Date.now();
                this.state.recordTaskCompleted(result.metrics.duration);
              } else {
                nextTask.retries++;
                if (nextTask.retries >= nextTask.maxRetries) {
                  nextTask.status = TaskStatus.FAILED;
                  nextTask.error = result.error;
                  this.state.recordTaskFailed();
                } else {
                  nextTask.status = TaskStatus.RETRYING;
                }
              }

              if (this.config.enableLearning) {
                this.state.setState(AgentState.LEARNING);
                const reward = this.reasoning.evaluateResult(nextTask, result, goal);
                const experience = {
                  id: v4(),
                  observation: observations[0] ?? {
                    id: v4(), timestamp: Date.now(), source: 'engine', type: 'tick',
                    data: {}, confidence: 1, metadata: {}
                  },
                  decision,
                  result,
                  reward,
                  timestamp: Date.now()
                };
                this.learning.recordExperience(experience);

                if (this.tickCount % 50 === 0) {
                  this.learning.train();
                }
              }

              const allDone = plan.tasks.every(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.FAILED);
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

      if (this.tickCount % 1000 === 0) {
        const pruned = this.knowledge.prune ? this.knowledge.prune() : 0;
        if (pruned > 0) {
          this.logger.info('Engine', `Pruned ${pruned} knowledge entries`);
        }
      }

    } catch (err) {
      this.errors.handle(err instanceof Error ? err : new Error(String(err)), 'Engine');
    }

    if (this.running) {
      const activeGoals = this.reasoning.getActiveGoals();
      this.state.setState(activeGoals.length > 0 ? AgentState.REASONING : AgentState.IDLE);
    }
  }

  submitGoal(description, priority = Priority.MEDIUM, constraints = {}) {
    const goal = {
      id: v4(),
      description,
      priority,
      constraints,
      successCriteria: (result) => result.success,
      createdAt: Date.now()
    };
    this.reasoning.addGoal(goal);
    return goal;
  }

  registerAction(action, handler) {
    this.actions.register(action, handler);
  }

  getMetrics() {
    return this.state.getMetrics(
      this.knowledge.size(),
      this.learning.getExperienceCount(),
      this.learning.getModel().accuracy
    );
  }

  isRunning() {
    return this.running;
  }

  getConfig() {
    return { ...this.config };
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.AgenticEngine = AgenticEngine;
  window.AgentState = AgentState;
  window.Priority = Priority;
  window.TaskStatus = TaskStatus;
  window.EventBus = EventBus;
  window.Logger = Logger;
  window.KnowledgeBase = KnowledgeBase;
  window.LearningModule = LearningModule;
}
