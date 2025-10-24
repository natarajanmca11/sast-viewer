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
  ScanningRequestParams,
  MultiApplicationAggregatedScanningResult
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
  GITHUB_APP_NAMES_ARRAY,
  AZURE_DEVOPS_APP_NAMES_ARRAY,
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
    
    Logger.info('Starting dependency and code scanning analysis for multiple applications...');
    
    // Create service instances (these can be reused for all applications)
    const githubAppsCount = GITHUB_APP_NAMES_ARRAY.length;
    const azureDevOpsAppsCount = AZURE_DEVOPS_APP_NAMES_ARRAY.length;
    Logger.info(`Initializing services for ${githubAppsCount} GitHub applications and ${azureDevOpsAppsCount} Azure DevOps applications, branch: ${BRANCH_NAME}`);
    
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
    
    // Scan each application and collect results
    const allApplicationsResults: AggregatedScanningResult[] = [];
    const applicationErrors: Array<{ applicationName: string, error: string }> = [];
    
    // Process GitHub applications
    for (const appName of GITHUB_APP_NAMES_ARRAY) {
      Logger.info(`Processing GitHub application: ${appName}`);
      
      try {
        // Define request parameters for this application
        const params: ScanningRequestParams = {
          applicationName: appName,
          branchName: BRANCH_NAME
        };
        
        // Fetch GitHub scanning results
        Logger.info(`Fetching GitHub code scanning results for ${appName} on branch ${BRANCH_NAME}...`);
        const githubCodeResults = await githubCodeService.fetchCodeScanningResults(params);
        
        Logger.info(`Fetching GitHub dependency scanning results for ${appName} on branch ${BRANCH_NAME}...`);
        const githubDependencyResults = await githubDependencyService.fetchDependencyScanningResults(params);
        
        // Create aggregation for this specific application
        const appResults: AggregatedScanningResult = {
          applicationName: appName,
          branchName: BRANCH_NAME,
          githubResults: {
            codeScanning: githubCodeResults,
            dependencyScanning: githubDependencyResults
          },
          azureDevOpsResults: {
            codeScanning: [], // No Azure DevOps results for GitHub apps
            dependencyScanning: []
          },
          timestamp: new Date()
        };
        
        Logger.info(`GitHub Application ${appName}: Fetched ${githubCodeResults.length} code scanning results and ${githubDependencyResults.length} dependency scanning results`);
        
        allApplicationsResults.push(appResults);
      } catch (error: any) {
        Logger.error(`Error processing GitHub application ${appName}: ${error.message}`);
        
        // Create an error result to include in the report
        const errorResult: AggregatedScanningResult = {
          applicationName: appName,
          branchName: BRANCH_NAME,
          githubResults: {
            codeScanning: [],
            dependencyScanning: []
          },
          azureDevOpsResults: {
            codeScanning: [],
            dependencyScanning: []
          },
          timestamp: new Date(),
        };
        
        Logger.warn(`GitHub Application ${appName} failed, but continuing with other applications...`);
        
        // Add error information
        applicationErrors.push({
          applicationName: `GitHub: ${appName}`,
          error: error.message
        });
        
        // Still add the error result to the collection
        allApplicationsResults.push(errorResult);
      }
    }
    
    // Process Azure DevOps applications
    for (const appName of AZURE_DEVOPS_APP_NAMES_ARRAY) {
      Logger.info(`Processing Azure DevOps application: ${appName}`);
      
      try {
        // Define request parameters for this application
        const params: ScanningRequestParams = {
          applicationName: appName,
          branchName: BRANCH_NAME
        };
        
        // For Azure DevOps, we may need to extract project if using project/app format
        // But for now we'll process as is, and the service handles project extraction
        
        // Fetch Azure DevOps scanning results
        Logger.info(`Fetching Azure DevOps code scanning results for ${appName} on branch ${BRANCH_NAME}...`);
        const azureDevOpsCodeResults = await azureDevOpsCodeService.fetchCodeScanningResults(params);
        
        Logger.info(`Fetching Azure DevOps dependency scanning results for ${appName} on branch ${BRANCH_NAME}...`);
        const azureDevOpsDependencyResults = await azureDevOpsDependencyService.fetchDependencyScanningResults(params);
        
        // Create aggregation for this specific application
        const appResults: AggregatedScanningResult = {
          applicationName: appName,
          branchName: BRANCH_NAME,
          githubResults: {
            codeScanning: [], // No GitHub results for Azure DevOps apps
            dependencyScanning: []
          },
          azureDevOpsResults: {
            codeScanning: azureDevOpsCodeResults,
            dependencyScanning: azureDevOpsDependencyResults
          },
          timestamp: new Date()
        };
        
        Logger.info(`Azure DevOps Application ${appName}: Fetched ${azureDevOpsCodeResults.length} code scanning results and ${azureDevOpsDependencyResults.length} dependency scanning results`);
        
        allApplicationsResults.push(appResults);
      } catch (error: any) {
        Logger.error(`Error processing Azure DevOps application ${appName}: ${error.message}`);
        
        // Create an error result to include in the report
        const errorResult: AggregatedScanningResult = {
          applicationName: appName,
          branchName: BRANCH_NAME,
          githubResults: {
            codeScanning: [],
            dependencyScanning: []
          },
          azureDevOpsResults: {
            codeScanning: [],
            dependencyScanning: []
          },
          timestamp: new Date(),
        };
        
        Logger.warn(`Azure DevOps Application ${appName} failed, but continuing with other applications...`);
        
        // Add error information
        applicationErrors.push({
          applicationName: `Azure DevOps: ${appName}`,
          error: error.message
        });
        
        // Still add the error result to the collection
        allApplicationsResults.push(errorResult);
      }
    }
    
    // Calculate summary statistics for all applications
    let totalGithubCodeScanningIssues = 0;
    let totalGithubDependencyScanningIssues = 0;
    let totalAzureDevOpsCodeScanningIssues = 0;
    let totalAzureDevOpsDependencyScanningIssues = 0;
    
    const severitySummary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      warning: 0,
      note: 0
    };
    
    // Calculate totals
    for (const appResult of allApplicationsResults) {
      totalGithubCodeScanningIssues += appResult.githubResults.codeScanning.length;
      totalGithubDependencyScanningIssues += appResult.githubResults.dependencyScanning.length;
      totalAzureDevOpsCodeScanningIssues += appResult.azureDevOpsResults.codeScanning.length;
      totalAzureDevOpsDependencyScanningIssues += appResult.azureDevOpsResults.dependencyScanning.length;
      
      // Count severity across all issues
      [...appResult.githubResults.codeScanning, ...appResult.githubResults.dependencyScanning,
       ...appResult.azureDevOpsResults.codeScanning, ...appResult.azureDevOpsResults.dependencyScanning]
       .forEach(issue => {
         switch (issue.severity) {
           case 'critical': severitySummary.critical++; break;
           case 'high': severitySummary.high++; break;
           case 'medium': severitySummary.medium++; break;
           case 'low': severitySummary.low++; break;
           case 'warning': severitySummary.warning++; break;
           case 'note': severitySummary.note++; break;
         }
       });
    }
    
    // Create multi-application aggregated results
    const multiAppResults: MultiApplicationAggregatedScanningResult = {
      applications: allApplicationsResults,
      errors: applicationErrors,
      summary: {
        totalApplications: GITHUB_APP_NAMES_ARRAY.length + AZURE_DEVOPS_APP_NAMES_ARRAY.length,
        totalGithubCodeScanningIssues,
        totalGithubDependencyScanningIssues,
        totalAzureDevOpsCodeScanningIssues,
        totalAzureDevOpsDependencyScanningIssues,
        severitySummary
      },
      timestamp: new Date()
    };
    
    Logger.info(`Scanning summary: Total applications: ${GITHUB_APP_NAMES_ARRAY.length + AZURE_DEVOPS_APP_NAMES_ARRAY.length}`);
    Logger.info(`Scanning summary: GitHub code issues: ${totalGithubCodeScanningIssues}`);
    Logger.info(`Scanning summary: GitHub dependency issues: ${totalGithubDependencyScanningIssues}`);
    Logger.info(`Scanning summary: Azure DevOps code issues: ${totalAzureDevOpsCodeScanningIssues}`);
    Logger.info(`Scanning summary: Azure DevOps dependency issues: ${totalAzureDevOpsDependencyScanningIssues}`);
    
    // Generate HTML report for multiple applications
    Logger.info('Generating multi-application HTML report...');
    const reportHtml = renderReport(multiAppResults);
    
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
    
    const filename = `multi-app-report-${timestamp}.html`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    // Write report to file
    fs.writeFileSync(filepath, reportHtml);
    
    Logger.info(`Multi-application report generated successfully: ${filepath}`);
    Logger.info('Multi-application dependency and code scanning analysis completed successfully');
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