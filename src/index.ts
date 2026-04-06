export { AgenticEngine } from './orchestrator/index.js';
export { EventBus } from './core/event-bus.js';
export { StateManager } from './core/state-manager.js';
export { Logger } from './core/logger.js';
export { ErrorHandler, AgenticError } from './core/error-handler.js';
export { PerceptionModule, Sensor, TimerSensor, MetricSensor } from './perception/index.js';
export { ReasoningEngine } from './reasoning/index.js';
export { ActionExecutor } from './action/index.js';
export { KnowledgeBase, LearningModule } from './learning/index.js';
export { AgentState, Priority, TaskStatus } from './types/index.js';
export type {
  EngineConfig, Goal, Task, Plan, Decision, DecisionOption,
  Observation, ActionResult, KnowledgeEntry, Experience,
  LearningModel, MetricsSnapshot,
} from './types/index.js';

import { AgenticEngine } from './orchestrator/index.js';
import { Priority, type Goal, type LearningModel } from './types/index.js';

// Demo: run autonomous engine
async function main() {
  console.log('=== Agentic Engine v1.0.0 ===\n');

  const engine = new AgenticEngine({
    name: 'DemoEngine',
    tickIntervalMs: 500,
    logLevel: 'info',
    enableLearning: true,
    enableSelfImprovement: true,
  });

  // Register custom action
  engine.registerAction('greet', async (params) => {
    console.log(`  -> Greeting: ${params.name ?? 'World'}`);
    return { greeted: true };
  });

  // Listen to events
  engine.events.on('goal:completed', (data: unknown) => {
    const goal = data as Goal;
    console.log(`  ✓ Goal completed: ${goal.description}`);
  });

  engine.events.on('model:trained', (data: unknown) => {
    const model = data as LearningModel;
    console.log(`  ✓ Model trained: v${model.version}, accuracy: ${model.accuracy.toFixed(3)}`);
  });

  // Start engine
  await engine.start();

  // Submit goals
  engine.submitGoal('Collect and analyze environment data', Priority.HIGH);
  engine.submitGoal('Process and verify results', Priority.MEDIUM);
  engine.submitGoal('Generate report of findings', Priority.LOW);

  console.log('\nRunning autonomous loop for 8 seconds...\n');

  // Run for 8 seconds
  await new Promise(resolve => setTimeout(resolve, 8000));

  // Stop
  await engine.stop();

  // Print metrics
  const metrics = engine.getMetrics();
  console.log('\n=== Final Metrics ===');
  console.log(`State: ${metrics.state}`);
  console.log(`Tasks Completed: ${metrics.tasksCompleted}`);
  console.log(`Tasks Failed: ${metrics.tasksFailed}`);
  console.log(`Avg Decision Time: ${metrics.avgDecisionTime.toFixed(1)}ms`);
  console.log(`Avg Execution Time: ${metrics.avgExecutionTime.toFixed(1)}ms`);
  console.log(`Knowledge Entries: ${metrics.knowledgeEntries}`);
  console.log(`Experiences: ${metrics.experienceCount}`);
  console.log(`Model Accuracy: ${(metrics.modelAccuracy * 100).toFixed(1)}%`);
  console.log(`Uptime: ${(metrics.uptime / 1000).toFixed(1)}s`);
  console.log(`Memory: ${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`);

  const learningStats = engine.learning.getStats();
  console.log(`Success Rate: ${(learningStats.successRate * 100).toFixed(1)}%`);
  console.log(`Avg Reward: ${learningStats.avgReward.toFixed(2)}`);
  console.log(`Exploration Rate: ${(engine.learning.getExplorationRate() * 100).toFixed(1)}%`);
}

// Run if executed directly
const isMainModule = process.argv[1]?.includes('index');
if (isMainModule) {
  main().catch(console.error);
}
