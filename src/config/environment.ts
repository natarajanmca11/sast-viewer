import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// GitHub configuration
export const GITHUB_ORG_NAME = process.env.GITHUB_ORG_NAME || '';
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
export const GITHUB_BASE_URL = process.env.GITHUB_BASE_URL || 'https://api.github.com';

// Azure DevOps configuration
export const AZURE_DEVOPS_ORG_NAME = process.env.AZURE_DEVOPS_ORG_NAME || '';
export const AZURE_DEVOPS_PROJECT_NAME = process.env.AZURE_DEVOPS_PROJECT_NAME || '';
export const AZURE_DEVOPS_TOKEN = process.env.AZURE_DEVOPS_TOKEN || '';
export const AZURE_DEVOPS_BASE_URL = process.env.AZURE_DEVOPS_BASE_URL || '';

// Application configuration
export const OUTPUT_DIR = process.env.OUTPUT_DIR || './output';
export const APPLICATION_NAME = process.env.APPLICATION_NAME || '';
export const BRANCH_NAME = process.env.BRANCH_NAME || 'main';

// Get multiple application names from environment variable
export const APPLICATION_NAMES = APPLICATION_NAME.split(',').map(name => name.trim()).filter(name => name.length > 0);

// Validate required environment variables
export function validateEnvironmentVariables(): void {
  const requiredVars = [
    { name: 'GITHUB_ORG_NAME', value: GITHUB_ORG_NAME },
    { name: 'GITHUB_TOKEN', value: GITHUB_TOKEN },
    { name: 'AZURE_DEVOPS_ORG_NAME', value: AZURE_DEVOPS_ORG_NAME },
    { name: 'AZURE_DEVOPS_PROJECT_NAME', value: AZURE_DEVOPS_PROJECT_NAME },
    { name: 'AZURE_DEVOPS_TOKEN', value: AZURE_DEVOPS_TOKEN },
    { name: 'APPLICATION_NAME', value: APPLICATION_NAME }
  ];

  const missingVars = requiredVars.filter(varDef => !varDef.value);

  if (missingVars.length > 0) {
    const missingNames = missingVars.map(varDef => varDef.name).join(', ');
    throw new Error(`Missing required environment variables: ${missingNames}`);
  }
  
  if (APPLICATION_NAMES.length === 0) {
    throw new Error('No valid application names provided in APPLICATION_NAME environment variable');
  }
}