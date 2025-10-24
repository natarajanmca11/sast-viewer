import fs from 'fs';
import path from 'path';
import { 
  GitHubCodeScanningResultService 
} from './services/GitHubService/GitHubCodeScanningResultService';
import { 
  GitHubDependencyScanningResultService 
} from './services/GitHubService/GitHubDependencyScanningResultService';
import { 
  AzureDevOpsCodeScanningResultService 
} from './services/AzureDevOpsService/AzureDevOpsCodeScanningResultService';
import { 
  AzureDevOpsDependencyScanningResultService 
} from './services/AzureDevOpsService/AzureDevOpsDependencyScanningResultService';
import { 
  AggregatedScanningResult, 
  ScanningRequestParams 
} from './interfaces/scanning-result.interface';
import { renderReport } from './utils/reportRenderer';
import { 
  validateEnvironmentVariables,
  GITHUB_ORG_NAME,
  GITHUB_TOKEN,
  GITHUB_BASE_URL,
  AZURE_DEVOPS_ORG_NAME,
  AZURE_DEVOPS_PROJECT_NAME,
  AZURE_DEVOPS_TOKEN,
  AZURE_DEVOPS_BASE_URL,
  OUTPUT_DIR,
  APPLICATION_NAME,
  BRANCH_NAME
} from './config/environment';
import { exit } from 'process';
import { Logger, LogLevel } from './utils/logger';

async function main(): Promise<void> {
  try {
    // Set up logging
    Logger.setLevel(LogLevel.INFO);
    
    // Validate environment variables
    validateEnvironmentVariables();
    
    Logger.info('Starting dependency and code scanning analysis...');
    
    // Create service instances
    Logger.info(`Initializing services for application: ${APPLICATION_NAME}, branch: ${BRANCH_NAME}`);
    
    const githubCodeService = new GitHubCodeScanningResultService({
      orgName: GITHUB_ORG_NAME,
      token: GITHUB_TOKEN,
      baseUrl: GITHUB_BASE_URL
    });
    
    const githubDependencyService = new GitHubDependencyScanningResultService({
      orgName: GITHUB_ORG_NAME,
      token: GITHUB_TOKEN,
      baseUrl: GITHUB_BASE_URL
    });
    
    const azureDevOpsCodeService = new AzureDevOpsCodeScanningResultService({
      orgName: AZURE_DEVOPS_ORG_NAME,
      projectName: AZURE_DEVOPS_PROJECT_NAME,
      token: AZURE_DEVOPS_TOKEN,
      baseUrl: AZURE_DEVOPS_BASE_URL
    });
    
    const azureDevOpsDependencyService = new AzureDevOpsDependencyScanningResultService({
      orgName: AZURE_DEVOPS_ORG_NAME,
      projectName: AZURE_DEVOPS_PROJECT_NAME,
      token: AZURE_DEVOPS_TOKEN,
      baseUrl: AZURE_DEVOPS_BASE_URL
    });
    
    // Define request parameters
    const params: ScanningRequestParams = {
      applicationName: APPLICATION_NAME,
      branchName: BRANCH_NAME
    };
    
    // Fetch all scanning results in parallel
    Logger.info(`Fetching GitHub code scanning results for ${APPLICATION_NAME} on branch ${BRANCH_NAME}...`);
    const githubCodeResults = await githubCodeService.fetchCodeScanningResults(params);
    
    Logger.info(`Fetching GitHub dependency scanning results for ${APPLICATION_NAME} on branch ${BRANCH_NAME}...`);
    const githubDependencyResults = await githubDependencyService.fetchDependencyScanningResults(params);
    
    Logger.info(`Fetching Azure DevOps code scanning results for ${APPLICATION_NAME} on branch ${BRANCH_NAME}...`);
    const azureDevOpsCodeResults = await azureDevOpsCodeService.fetchCodeScanningResults(params);
    
    Logger.info(`Fetching Azure DevOps dependency scanning results for ${APPLICATION_NAME} on branch ${BRANCH_NAME}...`);
    const azureDevOpsDependencyResults = await azureDevOpsDependencyService.fetchDependencyScanningResults(params);
    
    // Aggregate results
    const aggregatedResults: AggregatedScanningResult = {
      applicationName: APPLICATION_NAME,
      branchName: BRANCH_NAME,
      githubResults: {
        codeScanning: githubCodeResults,
        dependencyScanning: githubDependencyResults
      },
      azureDevOpsResults: {
        codeScanning: azureDevOpsCodeResults,
        dependencyScanning: azureDevOpsDependencyResults
      },
      timestamp: new Date()
    };
    
    Logger.info(`Fetched ${githubCodeResults.length} GitHub code scanning results`);
    Logger.info(`Fetched ${githubDependencyResults.length} GitHub dependency scanning results`);
    Logger.info(`Fetched ${azureDevOpsCodeResults.length} Azure DevOps code scanning results`);
    Logger.info(`Fetched ${azureDevOpsDependencyResults.length} Azure DevOps dependency scanning results`);
    
    // Generate HTML report
    Logger.info('Generating HTML report...');
    const reportHtml = renderReport(aggregatedResults);
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      Logger.info(`Created output directory: ${OUTPUT_DIR}`);
    }
    
    // Create timestamped filename
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')  // Replace colons and dots with hyphens
      .replace('T', 'T')      // Keep T as is
      .slice(0, -5) + 'Z';    // Replace '000Z' with 'Z'
    
    const filename = `${timestamp}.html`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    // Write report to file
    fs.writeFileSync(filepath, reportHtml);
    
    Logger.info(`Report generated successfully: ${filepath}`);
    Logger.info('Dependency and code scanning analysis completed successfully');
  } catch (error: any) {
    Logger.error('Error occurred during analysis:', error.message);
    exit(1);
  }
}

// Execute main function
if (require.main === module) {
  main();
}

export { main };