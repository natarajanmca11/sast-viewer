import axios from 'axios';
import { 
  AzureDevOpsCodeScanningResult, 
  AzureDevOpsServiceParams, 
  ScanningRequestParams 
} from '../../interfaces/scanning-result.interface';
import { Logger } from '../../utils/logger';

export class AzureDevOpsCodeScanningResultService {
  private readonly orgName: string;
  private readonly defaultProjectName: string;
  private readonly token: string;
  private readonly baseUrl?: string;

  constructor(params: AzureDevOpsServiceParams) {
    this.orgName = params.orgName;
    this.defaultProjectName = params.projectName;
    this.token = params.token;
    this.baseUrl = params.baseUrl;
  }

  /**
   * Fetch code scanning results for a specific application and branch
   * Note: Azure DevOps doesn't have a direct equivalent to GitHub's code scanning API
   * This would typically integrate with security tools like SonarQube, Checkmarx, etc. via their respective APIs
   * For this implementation, we'll simulate the functionality
   */
  async fetchCodeScanningResults(params: ScanningRequestParams): Promise<AzureDevOpsCodeScanningResult[]> {
    const { applicationName, branchName } = params;
    
    // Extract project name from application name if in project/app format, otherwise use default
    let projectName = this.defaultProjectName;
    if (applicationName.includes('/')) {
      projectName = applicationName.split('/')[0];
    }
    
    // Create client with the appropriate project name
    const client = axios.create({
      baseURL: this.baseUrl || `https://dev.azure.com/${this.orgName}/${projectName}/_apis`,
      headers: {
        'Authorization': `Basic ${Buffer.from(`:${this.token}`).toString('base64')}`,
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    
    Logger.info(`Fetching Azure DevOps code scanning results for project: ${projectName}, application: ${applicationName}, on branch ${branchName}`);
    Logger.warn('Azure DevOps Code Scanning: Direct API not available - would need to connect to external security tools like SonarQube, Checkmarx, etc.');
    
    try {
      // Azure DevOps doesn't have a direct code scanning API like GitHub
      // Instead, we might get this data from external security tools integration
      // For this example, we'll simulate getting results from Azure DevOps Pipelines or similar
      
      // First, get build information to identify the branch and commit
      const buildsResponse = await client.get('/build/builds', {
        params: {
          branchName: `refs/heads/${branchName}`,
          $top: 10,
          'api-version': '7.0'
        }
      });

      if (!buildsResponse.data || !buildsResponse.data.value || !Array.isArray(buildsResponse.data.value)) {
        Logger.warn(`No Azure DevOps builds found for project: ${projectName}, application: ${applicationName}, on branch ${branchName}`);
        return [];
      }

      // In a real implementation, this would connect to security analysis tools
      // For simulation purposes, we'll return empty results
      // In a real implementation, you would fetch from SonarQube, Checkmarx, etc.
      Logger.info(`Found ${buildsResponse.data.value.length} builds for project: ${projectName}, application: ${applicationName}, on branch ${branchName}, but no code scanning data available`);
      return [];
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMsg = `Azure DevOps API Error: ${error.response.status} - ${error.response.data?.message || error.message}`;
        Logger.error(errorMsg);
        throw new Error(errorMsg);
      } else if (error.request) {
        // The request was made but no response was received
        const errorMsg = `Network Error: No response received from Azure DevOps API`;
        Logger.error(errorMsg);
        throw new Error(errorMsg);
      } else {
        // Something happened in setting up the request that triggered an Error
        const errorMsg = `Request Setup Error: ${error.message}`;
        Logger.error(errorMsg);
        throw new Error(errorMsg);
      }
    }
  }


}