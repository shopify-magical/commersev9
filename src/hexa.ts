import { Command } from 'commander';

const program = new Command();

const IDE_URL = 'https://orb-mcp.sv9.workers.dev';
const OCR_URL = 'https://ocr-vision-worker.aekbuffalo.workers.dev';
const ENGINE_URL = 'https://bizcommerz-agentic-engine.aekbuffalo.workers.dev';
const AI_URL = 'https://cgemini-api.aekbuffalo.workers.dev';

// Helper to perform a POST request and print JSON response
async function post(url: string, body: unknown): Promise<void> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Request failed:', e);
  }
}

// IDE module
const ide = program.command('ide').description('AGX Cloud IDE');
ide
  .command('deploy <file>')
  .description('Upload and deploy code')
  .action(async (file: string) => {
    await post(`${IDE_URL}/deploy`, { filePath: file });
  });

ide
  .command('run <file>')
  .description('Execute code or service')
  .action(async (file: string) => {
    await post(`${IDE_URL}/run`, { filePath: file });
  });

// OCR module
const ocr = program.command('ocr').description('OCR Vision Worker');
ocr
  .command('analyze <image>')
  .option('--output <out>', 'Output file')
  .description('Extract text/data from image')
  .action(async (image: string, options: Record<string, any>) => {
    const payload: Record<string, any> = { imagePath: image };
    if (options.output) payload.output = options.output;
    await post(`${OCR_URL}/analyze`, payload);
  });

ocr
  .command('classify <image>')
  .option('--model <model>', 'Classification model')
  .description('Categorize OCR results')
  .action(async (image: string, options: Record<string, any>) => {
    const payload: Record<string, any> = { imagePath: image };
    if (options.model) payload.model = options.model;
    await post(`${OCR_URL}/classify`, payload);
  });

// AI module (Unified Agentic Alliance Gateway)
const ai = program.command('ai').description('Unified Agentic Alliance Gateway');

ai
  .command('models')
  .description('List available AI models')
  .action(async () => {
    await post(`${AI_URL}/ai/models`, {});
  });

ai
  .command('chat')
  .description('Chat with an AI model')
  .option('--model <name>', 'Model name')
  .option('--prompt <text>', 'Prompt text')
  .action(async (options: Record<string, any>) => {
    const payload: Record<string, any> = {};
    if (options.model) payload.model = options.model;
    if (options.prompt) payload.prompt = options.prompt;
    await post(`${AI_URL}/ai/chat`, payload);
  });

ai
  .command('image')
  .description('Generate an image')
  .option('--model <name>', 'Model name')
  .option('--prompt <text>', 'Prompt text')
  .action(async (options: Record<string, any>) => {
    const payload: Record<string, any> = {};
    if (options.model) payload.model = options.model;
    if (options.prompt) payload.prompt = options.prompt;
    await post(`${AI_URL}/ai/image`, payload);
  });

ai
  .command('patterns')
  .description('List available patterns')
  .action(async () => {
    await post(`${AI_URL}/patterns`, {});
  });

// HF module (HuggingFace models)
const hf = program.command('hf').description('HuggingFace Models');

hf
  .command('models')
  .description('List HF models')
  .action(async () => {
    await post(`${AI_URL}/hf/models`, {});
  });

hf
  .command('chat')
  .description('Chat with HF model')
  .option('--model <name>', 'Model name')
  .option('--prompt <text>', 'Prompt text')
  .action(async (options: Record<string, any>) => {
    const payload: Record<string, any> = {};
    if (options.model) payload.model = options.model;
    if (options.prompt) payload.prompt = options.prompt;
    await post(`${AI_URL}/hf/chat`, payload);
  });

// Teach module (model training)
const teach = program.command('teach').description('Train or fine-tune models with custom data');

teach
  .command('<dataset>')
  .description('Fine-tune model with dataset')
  .option('--model <name>', 'Target model ID')
  .option('--epochs <num>', 'Number of epochs')
  .option('--lr <rate>', 'Learning rate')
  .option('--mode <mode>', 'Training mode: fine-tune | incremental')
  .option('--validate', 'Run validation after training')
  .option('--commit', 'Save trained weights to registry')
  .action(async (dataset: string, options: Record<string, any>) => {
    const payload: Record<string, any> = { dataset };
    if (options.model) payload.model = options.model;
    if (options.epochs) payload.epochs = parseInt(options.epochs);
    if (options.lr) payload.lr = parseFloat(options.lr);
    if (options.mode) payload.mode = options.mode;
    if (options.validate) payload.validate = true;
    if (options.commit) payload.commit = true;
    await post(`${ENGINE_URL}/engine/teach`, payload);
  });

// Engine module
const engine = program.command('engine').description('BizCommerz Agentic Engine');
engine
  .command('trigger <workflow>')
  .description('Run a workflow with payload')
  .action(async (workflow: string) => {
    await post(`${ENGINE_URL}/engine/trigger`, { workflowPath: workflow });
  });

engine
  .command('route')
  .description('Define traffic routing rules')
  .option('--from <src>', 'Source module')
  .option('--to <dst>', 'Destination module')
  .action(async (options: Record<string, any>) => {
    await post(`${ENGINE_URL}/engine/route`, { from: options.from, to: options.to });
  });

// Net module (NGINX9 Gateway)
const net = program.command('net').description('NGINX9 Gateway');
net
  .command('reload')
  .description('Reload gateway configuration')
  .action(async () => {
    await post(`${ENGINE_URL}/net/reload`, {});
  });

net
  .command('restart')
  .description('Restart gateway or service')
  .option('--service <name>', 'Service name')
  .action(async (options: Record<string, any>) => {
    await post(`${ENGINE_URL}/net/restart`, { service: options.service });
  });

// Sys module (system utilities)
const sys = program.command('sys').description('System utilities');

sys
  .command('status')
  .description('Check job or system status')
  .option('--job <id>', 'Job identifier')
  .action(async (options: Record<string, any>) => {
    await post(`${ENGINE_URL}/sys/status`, { jobId: options.job });
  });

sys
  .command('logs')
  .description('Retrieve execution logs')
  .option('--job <id>', 'Job identifier')
  .action(async (options: Record<string, any>) => {
    await post(`${ENGINE_URL}/sys/logs`, { jobId: options.job });
  });

sys
  .command('config')
  .description('Set or view authentication tokens')
  .option('--set <token>', 'Set token')
  .option('--get', 'Get token')
  .action(async (options: Record<string, any>) => {
    if (options.set) {
      await post(`${ENGINE_URL}/sys/config`, { token: options.set });
    } else if (options.get) {
      await post(`${ENGINE_URL}/sys/config`, { get: true });
    } else {
      console.log('Specify --set <token> or --get');
    }
  });

program.command('version').description('Show current Hexa shell version').action(() => {
  console.log('Hexa shell version 1.0.0');
});

program.command('help').description('Show help for any module or command').action(() => {
  program.outputHelp();
});

program.parseAsync(process.argv);
