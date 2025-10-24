import axios, { AxiosInstance } from 'axios';
import { 
  GitHubCodeScanningResult, 
  GitHubServiceParams, 
  ScanningRequestParams 
} from '../../interfaces/scanning-result.interface';
import { Logger } from '../../utils/logger';

export class GitHubCodeScanningResultService {
  private readonly client: AxiosInstance;
  private readonly orgName: string;

  constructor(params: GitHubServiceParams) {
    this.orgName = params.orgName;
    
    this.client = axios.create({
      baseURL: params.baseUrl || 'https://api.github.com',
      headers: {
        'Authorization': `token ${params.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Dependency-Analysis-Tool'
      },
      timeout: 30000
    });
  }

  /**
   * Fetch code scanning results for a specific application and branch
   */
  async fetchCodeScanningResults(params: ScanningRequestParams): Promise<GitHubCodeScanningResult[]> {
    const { applicationName, branchName } = params;
    
    Logger.info(`Fetching GitHub code scanning results for ${applicationName} on branch ${branchName}`);
    
    try {
      // Get the code scanning alerts for the repository
      const response = await this.client.get(`/repos/${this.orgName}/${applicationName}/code-scanning/alerts`, {
        params: {
          ref: branchName,
          state: 'open' // Can also fetch 'closed' or 'dismissed' if needed
        }
      });

      if (!response.data || !Array.isArray(response.data)) {
        Logger.warn(`No GitHub code scanning results found for ${applicationName} on branch ${branchName}`);
        return [];
      }

      Logger.info(`Received ${response.data.length} GitHub code scanning results for ${applicationName} on branch ${branchName}`);
      
      // Map the GitHub API response to our interface
      const results = response.data.map((alert: any) => this.mapGitHubAlertToResult(alert, branchName));
      Logger.info(`Mapped ${results.length} GitHub code scanning results for ${applicationName} on branch ${branchName}`);
      
      return results;
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMsg = `GitHub API Error: ${error.response.status} - ${error.response.data?.message || error.message}`;
        Logger.error(errorMsg);
        throw new Error(errorMsg);
      } else if (error.request) {
        // The request was made but no response was received
        const errorMsg = `Network Error: No response received from GitHub API`;
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

  /**
   * Maps GitHub API alert object to our GitHubCodeScanningResult interface
   */
  private mapGitHubAlertToResult(alert: any, branchName: string): GitHubCodeScanningResult {
    // Extract relevant information from the GitHub alert
    const tool = alert.tool || {};
    const rule = alert.rule || {};
    const mostRecentInstance = alert.instances?.[0] || {};
    
    return {
      id: alert.number?.toString() || alert.id || '',
      name: rule.name || alert.rule_id || 'Unknown Rule',
      severity: this.mapGitHubSeverity(rule.severity || alert.severity || 'medium'),
      description: rule.description || alert.message?.text || 'No description provided',
      createdAt: new Date(alert.created_at || alert.created),
      updatedAt: new Date(alert.updated_at || alert.updated || alert.created_at || alert.created),
      state: alert.state || 'open',
      url: alert.html_url || alert.url,
      tool: 'GitHub',
      toolName: tool.name || 'CodeQL',
      toolVersion: tool.version || 'Unknown',
      ref: branchName,
      commitSha: mostRecentInstance.commit_sha || '',
      ruleId: rule.id || alert.rule_id || '',
      ruleName: rule.name || alert.rule_id || '',
      ruleDescription: rule.description || '',
      ruleSeverity: rule.severity || alert.severity || '',
      filePath: mostRecentInstance.location?.path || mostRecentInstance.location?.file || '',
      startLine: mostRecentInstance.location?.start_line || mostRecentInstance.location?.region?.start_line,
      endLine: mostRecentInstance.location?.end_line || mostRecentInstance.location?.region?.end_line,
      startColumn: mostRecentInstance.location?.start_column || mostRecentInstance.location?.region?.start_column,
      endColumn: mostRecentInstance.location?.end_column || mostRecentInstance.location?.region?.end_column,
      codeSnippet: mostRecentInstance.location?.snippet?.code || '',
      category: 'code-scanning',
      cwes: (rule.cwe_ids || []).map((cwe: any) => cwe.toString()),
      tags: rule.tags || [],
      ecosystem: undefined,
      packageName: undefined,
      version: undefined,
      fixedVersion: undefined,
      cveId: undefined,
      cvss: undefined
    };
  }

  /**
   * Maps GitHub's severity values to our standard severity values
   */
  private mapGitHubSeverity(githubSeverity: string): 'critical' | 'high' | 'medium' | 'low' | 'warning' | 'note' {
    const severityMap: { [key: string]: 'critical' | 'high' | 'medium' | 'low' | 'warning' | 'note' } = {
      'critical': 'critical',
      'high': 'high',
      'medium': 'medium',
      'low': 'low',
      'warning': 'warning',
      'note': 'note',
      'error': 'high', // GitHub uses 'error' as well
      'recommendation': 'medium' // Additional GitHub value
    };

    const mapped = severityMap[githubSeverity.toLowerCase()];
    return mapped || 'medium'; // default to medium if not found
  }
}