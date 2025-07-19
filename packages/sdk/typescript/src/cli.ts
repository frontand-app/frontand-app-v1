#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { generateReactComponent } from './generators/react';
import { generateTypeScriptTypes } from './generators/types';
import { validateFlowSpec } from './validators/flow';
import { FlowSpec } from './types';

const program = new Command();

program
  .name('closedai')
  .description('CLOSED AI CLI for generating React components from flows')
  .version('1.0.0');

program
  .command('generate')
  .alias('gen')
  .description('Generate React components from flow.json files')
  .argument('<input>', 'Path to flow.json file or directory containing flow.json')
  .option('-o, --output <dir>', 'Output directory', './generated')
  .option('-t, --template <template>', 'Template to use', 'default')
  .option('--types-only', 'Generate only TypeScript types')
  .option('--component-only', 'Generate only React component')
  .option('--format', 'Format generated code with Prettier', true)
  .action(async (input: string, options) => {
    const spinner = ora('Generating components...').start();
    
    try {
      // Find flow.json file
      let flowPath: string;
      if (fs.statSync(input).isDirectory()) {
        flowPath = path.join(input, 'flow.json');
      } else {
        flowPath = input;
      }
      
      if (!fs.existsSync(flowPath)) {
        throw new Error(`flow.json not found at: ${flowPath}`);
      }
      
      // Load and validate flow spec
      const flowSpec: FlowSpec = await fs.readJson(flowPath);
      const validation = validateFlowSpec(flowSpec);
      
      if (!validation.valid) {
        throw new Error(`Invalid flow.json: ${validation.errors.join(', ')}`);
      }
      
      // Ensure output directory exists
      await fs.ensureDir(options.output);
      
      // Generate TypeScript types
      if (!options.componentOnly) {
        spinner.text = 'Generating TypeScript types...';
        const typesCode = generateTypeScriptTypes(flowSpec);
        const typesPath = path.join(options.output, `${flowSpec.id}.types.ts`);
        await fs.writeFile(typesPath, typesCode);
        spinner.succeed(`Generated types: ${typesPath}`);
      }
      
      // Generate React component
      if (!options.typesOnly) {
        spinner.text = 'Generating React component...';
        const componentCode = generateReactComponent(flowSpec, options.template);
        const componentPath = path.join(options.output, `${flowSpec.id}.component.tsx`);
        await fs.writeFile(componentPath, componentCode);
        spinner.succeed(`Generated component: ${componentPath}`);
      }
      
      spinner.succeed(chalk.green('✨ Generation complete!'));
      
    } catch (error) {
      spinner.fail(chalk.red(`Generation failed: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate a flow.json file')
  .argument('<input>', 'Path to flow.json file')
  .action(async (input: string) => {
    const spinner = ora('Validating flow...').start();
    
    try {
      const flowSpec: FlowSpec = await fs.readJson(input);
      const validation = validateFlowSpec(flowSpec);
      
      if (validation.valid) {
        spinner.succeed(chalk.green('✅ Flow is valid!'));
      } else {
        spinner.fail(chalk.red('❌ Flow is invalid:'));
        validation.errors.forEach(error => {
          console.log(chalk.red(`  - ${error}`));
        });
        process.exit(1);
      }
      
    } catch (error) {
      spinner.fail(chalk.red(`Validation failed: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize a new flow')
  .argument('<name>', 'Flow name')
  .option('-t, --template <template>', 'Template to use', 'basic')
  .option('-o, --output <dir>', 'Output directory', '.')
  .action(async (name: string, options) => {
    const spinner = ora('Initializing flow...').start();
    
    try {
      const flowId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const flowDir = path.join(options.output, flowId);
      
      // Create directory
      await fs.ensureDir(flowDir);
      
      // Create flow.json
      const flowSpec: FlowSpec = {
        id: flowId,
        name: name,
        version: '1.0.0',
        description: `${name} flow`,
        inputs: [
          {
            name: 'input',
            type: 'string',
            description: 'Input text',
            required: true,
            ui: {
              widget: 'input',
              placeholder: 'Enter input text...'
            }
          }
        ],
        outputs: [
          {
            name: 'output',
            type: 'string',
            description: 'Output result'
          }
        ],
        runtime: {
          image: 'closedai/python:3.11',
          entrypoint: 'main:run',
          gpu: 'cpu',
          timeout: 300,
          memory: 1024
        },
        meta: {
          author: 'CLOSED AI User',
          category: 'automation',
          tags: ['example'],
          license: 'MIT'
        }
      };
      
      await fs.writeJson(path.join(flowDir, 'flow.json'), flowSpec, { spaces: 2 });
      
      // Create main.py
      const mainPy = `"""
${name} Flow
"""

from closedai import flow

@flow(gpu="cpu")
async def run(inputs: dict) -> dict:
    """Main flow function"""
    input_text = inputs.get("input", "")
    
    # Your flow logic here
    result = f"Processed: {input_text}"
    
    return {
        "output": result
    }
`;
      
      await fs.writeFile(path.join(flowDir, 'main.py'), mainPy);
      
      // Create requirements.txt
      const requirements = `closedai>=1.0.0
# Add your dependencies here
`;
      
      await fs.writeFile(path.join(flowDir, 'requirements.txt'), requirements);
      
      // Create README.md
      const readme = `# ${name}

${flowSpec.description}

## Usage

\`\`\`bash
# Install dependencies
pip install -r requirements.txt

# Test locally
python main.py
\`\`\`

## Deploy

\`\`\`bash
# Deploy to CLOSED AI
closedai deploy
\`\`\`
`;
      
      await fs.writeFile(path.join(flowDir, 'README.md'), readme);
      
      spinner.succeed(chalk.green(`✨ Flow initialized: ${flowDir}`));
      
    } catch (error) {
      spinner.fail(chalk.red(`Initialization failed: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('cost')
  .description('Estimate cost for running a flow')
  .argument('<flow>', 'Path to flow.json file')
  .option('-i, --input <json>', 'Input JSON string')
  .option('-m, --model <model>', 'Model to use', 'llama3-8b-q4')
  .option('-g, --gpu <gpu>', 'GPU type', 'cpu')
  .action(async (flow: string, options) => {
    const spinner = ora('Estimating cost...').start();
    
    try {
      const flowSpec: FlowSpec = await fs.readJson(flow);
      const inputs = options.input ? JSON.parse(options.input) : {};
      
      // Import cost estimation (this would call the actual API)
      const { estimateCost } = await import('./cost/estimator');
      const estimate = await estimateCost(flowSpec, inputs, options.model, options.gpu);
      
      spinner.succeed('Cost estimate:');
      console.log(chalk.cyan(`  Total: $${estimate.total.toFixed(6)}`));
      console.log(chalk.cyan(`  Container: $${estimate.container.toFixed(6)}`));
      console.log(chalk.cyan(`  LLM: $${estimate.llm.toFixed(6)}`));
      console.log(chalk.cyan(`  Runtime: ${estimate.runtime}s`));
      
    } catch (error) {
      spinner.fail(chalk.red(`Cost estimation failed: ${error.message}`));
      process.exit(1);
    }
  });

if (require.main === module) {
  program.parse();
} 