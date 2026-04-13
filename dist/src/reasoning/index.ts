import type {
  Goal, Task, Plan, Decision, DecisionOption,
  Observation, ActionResult, UUID, Priority, TaskStatus,
} from '../types/index.js';
import { EventBus } from '../core/event-bus.js';
import { Logger } from '../core/logger.js';
import { v4 } from '../utils.js';

export class ReasoningEngine {
  private goals: Map<UUID, Goal> = new Map();
  private plans: Map<UUID, Plan> = new Map();
  private decisions: Decision[];
  private decisionIndex = 0;
  private decisionCount = 0;
  private readonly maxDecisions = 500;

  constructor(
    private events: EventBus,
    private logger: Logger,
  ) {
    this.decisions = new Array(this.maxDecisions);
  }

  // Goal management
  addGoal(goal: Goal): void {
    this.goals.set(goal.id, goal);
    this.logger.info('Reasoning', `Goal added: ${goal.description}`, { id: goal.id, priority: goal.priority });
    this.events.emit('goal:added', goal);
  }

  removeGoal(id: UUID): void {
    this.goals.delete(id);
    this.plans.delete(id);
    this.logger.info('Reasoning', `Goal removed: ${id}`);
  }

  getActiveGoals(): Goal[] {
    return [...this.goals.values()].sort((a, b) => a.priority - b.priority);
  }

  // Decision making
  async decide(context: Record<string, unknown>, options: DecisionOption[]): Promise<Decision> {
    const start = Date.now();

    if (options.length === 0) {
      const decision: Decision = {
        id: v4(),
        context,
        options: [],
        selected: null,
        reasoning: 'No options available',
        confidence: 0,
        timestamp: Date.now(),
      };
      this.recordDecision(decision);
      return decision;
    }

    // Score each option
    const scored = options.map(opt => ({
      option: opt,
      score: this.scoreOption(opt),
    }));

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    const decision: Decision = {
      id: v4(),
      context,
      options,
      selected: best.option.id,
      reasoning: `Selected "${best.option.description}" with score ${best.score.toFixed(2)} (cost: ${best.option.estimatedCost}, benefit: ${best.option.estimatedBenefit}, risk: ${best.option.risk})`,
      confidence: Math.min(1, best.score / 10),
      timestamp: Date.now(),
    };

    this.recordDecision(decision);
    const duration = Date.now() - start;
    this.logger.debug('Reasoning', `Decision made in ${duration}ms`, { selected: decision.selected, confidence: decision.confidence });
    this.events.emit('decision', decision);

    return decision;
  }

  private scoreOption(option: DecisionOption): number {
    const benefitWeight = 2.0;
    const costWeight = -1.0;
    const riskWeight = -1.5;
    return (option.estimatedBenefit * benefitWeight) +
           (option.estimatedCost * costWeight) +
           (option.risk * riskWeight);
  }

  // Planning
  async createPlan(goal: Goal, availableActions: string[]): Promise<Plan> {
    const tasks: Task[] = [];

    // Decompose goal into tasks based on goal description
    const steps = this.decomposeGoal(goal, availableActions);

    for (let i = 0; i < steps.length; i++) {
      const task: Task = {
        id: v4(),
        goalId: goal.id,
        description: steps[i].description,
        action: steps[i].action,
        params: steps[i].params,
        priority: goal.priority,
        status: 'PENDING' as TaskStatus,
        retries: 0,
        maxRetries: 3,
        createdAt: Date.now(),
        dependencies: i > 0 ? [tasks[i - 1].id] : [],
      };
      tasks.push(task);
    }

    const plan: Plan = {
      id: v4(),
      goalId: goal.id,
      tasks,
      estimatedCost: tasks.length * 1.0,
      createdAt: Date.now(),
      status: 'PENDING' as TaskStatus,
    };

    this.plans.set(goal.id, plan);
    this.logger.info('Reasoning', `Plan created for goal: ${goal.description}`, { taskId: tasks.length });
    this.events.emit('plan:created', plan);

    return plan;
  }

  private decomposeGoal(goal: Goal, availableActions: string[]): Array<{ description: string; action: string; params: Record<string, unknown> }> {
    const steps: Array<{ description: string; action: string; params: Record<string, unknown> }> = [];

    // Rule-based decomposition
    const desc = goal.description.toLowerCase();

    if (desc.includes('collect') || desc.includes('gather')) {
      steps.push({ description: 'Collect required data', action: 'collect', params: { source: 'environment' } });
    }
    if (desc.includes('analyze') || desc.includes('process')) {
      steps.push({ description: 'Analyze collected data', action: 'analyze', params: {} });
    }
    if (desc.includes('decide') || desc.includes('choose')) {
      steps.push({ description: 'Make decision based on analysis', action: 'decide', params: {} });
    }
    if (desc.includes('execute') || desc.includes('perform') || desc.includes('run')) {
      steps.push({ description: 'Execute the decided action', action: 'execute', params: {} });
    }
    if (desc.includes('verify') || desc.includes('check') || desc.includes('validate')) {
      steps.push({ description: 'Verify execution results', action: 'verify', params: {} });
    }
    if (desc.includes('report') || desc.includes('notify')) {
      steps.push({ description: 'Generate report', action: 'report', params: {} });
    }

    // Default: single task matching the goal
    if (steps.length === 0) {
      const action = availableActions.find(a => desc.includes(a)) ?? availableActions[0] ?? 'default';
      steps.push({ description: goal.description, action, params: goal.constraints });
    }

    return steps;
  }

  // Evaluation
  evaluateResult(task: Task, result: ActionResult, goal: Goal): number {
    let reward = 0;
    if (result.success) reward += 1.0;
    if (goal.successCriteria(result)) reward += 2.0;
    reward -= result.metrics.cost * 0.1;
    reward -= result.metrics.retries * 0.3;
    if (result.metrics.duration > 10000) reward -= 0.5;
    return reward;
  }

  private recordDecision(decision: Decision): void {
    this.decisions[this.decisionIndex] = decision;
    this.decisionIndex = (this.decisionIndex + 1) % this.maxDecisions;
    if (this.decisionCount < this.maxDecisions) this.decisionCount++;
  }

  getDecisions(limit?: number): Decision[] {
    if (this.decisionCount === 0) return [];
    const count = limit ? Math.min(limit, this.decisionCount) : this.decisionCount;
    if (this.decisionCount < this.maxDecisions) {
      return this.decisions.slice(this.decisionCount - count, this.decisionCount);
    }
    const result: Decision[] = [];
    for (let i = 0; i < count; i++) {
      const idx = (this.decisionIndex - count + i + this.maxDecisions) % this.maxDecisions;
      result.push(this.decisions[idx]);
    }
    return result;
  }

  getPlan(goalId: UUID): Plan | undefined {
    return this.plans.get(goalId);
  }

  clear(): void {
    this.goals.clear();
    this.plans.clear();
    this.decisionIndex = 0;
    this.decisionCount = 0;
  }
}
