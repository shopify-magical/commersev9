import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const enginePath = path.join(rootDir, 'public', 'js', 'agentic-engine.js');

const source = fs.readFileSync(enginePath, 'utf8');

const context = vm.createContext({
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  Date,
  Math,
  Promise,
  AbortController,
  performance
});

context.window = context;
context.globalThis = context;

function assert(name, condition) {
  if (!condition) {
    throw new Error(`Assertion failed: ${name}`);
  }
  console.log(`PASS: ${name}`);
}

async function run() {
  vm.runInContext(source, context, { filename: 'agentic-engine.js' });

  assert('window.AgenticEngine exists', typeof context.window.AgenticEngine === 'function');
  assert('window.EventBus exists', typeof context.window.EventBus === 'function');

  const Engine = context.window.AgenticEngine;
  const engine = new Engine({
    name: 'NodeMockSmoke',
    tickIntervalMs: 100,
    logLevel: 'warn'
  });

  assert('engine instance created', !!engine);
  await engine.start();
  assert('engine starts', engine.isRunning() === true);

  const goal = engine.submitGoal('Mock smoke goal');
  assert('goal created', !!goal && typeof goal.id === 'string');

  await new Promise(resolve => setTimeout(resolve, 250));
  const metrics = engine.getMetrics();
  assert(
    'metrics object shape is valid',
    !!metrics && typeof metrics.timestamp === 'number' && typeof metrics.state === 'string'
  );

  await engine.stop();
  assert('engine stops', engine.isRunning() === false);

  console.log('All mock smoke tests passed.');
}

run().catch((err) => {
  console.error('Mock smoke test failed:', err.message);
  process.exit(1);
});
