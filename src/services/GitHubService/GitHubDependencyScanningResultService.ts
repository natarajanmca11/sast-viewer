import axios, { AxiosInstance } from 'axios';
import { 
  GitHubDependencyScanningResult, 
  GitHubServiceParams, 
  ScanningRequestParams 
} from '../../interfaces/scanning-result.interface';
import { Logger } from '../../utils/logger';

export class GitHubDependencyScanningResultService {
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
   * Fetch dependency scanning results for a specific application and branch
   */
  async fetchDependencyScanningResults(params: ScanningRequestParams): Promise<GitHubDependencyScanningResult[]> {
    const { applicationName, branchName } = params;
    
    Logger.info(`Fetching GitHub dependency scanning results for ${applicationName} on branch ${branchName}`);
    
    try {
      // First get the security alerts for the repository
      const response = await this.client.get(`/repos/${this.orgName}/${applicationName}/dependabot/alerts`, {
        params: {
          state: 'open' // Can also fetch 'closed' or 'dismissed' if needed
        }
      });

      if (!response.data || !Array.isArray(response.data)) {
        Logger.warn(`No GitHub dependency scanning results found for ${applicationName} on branch ${branchName}`);
        return [];
      }

      Logger.info(`Received ${response.data.length} GitHub dependency scanning results for ${applicationName} on branch ${branchName}`);
      
      // Map the GitHub API response to our interface
      const results = response.data.map((alert: any) => this.mapGitHubDependabotAlertToResult(alert, branchName));
      Logger.info(`Mapped ${results.length} GitHub dependency scanning results for ${applicationName} on branch ${branchName}`);
      
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
   * Maps GitHub API Dependabot alert object to our GitHubDependencyScanningResult interface
   */
  private mapGitHubDependabotAlertToResult(alert: any, branchName: string): GitHubDependencyScanningResult {
    // Extract relevant information from the GitHub Dependabot alert
    const dependency = alert.dependency || {};
    const packageInfo = dependency.package || {};
    const advisory = alert.security_advisory || {};
    const severity = this.mapGitHubSeverity(advisory.severity || 'medium');
    
    return {
      id: alert.number?.toString() || alert.id || '',
      name: advisory.summary || packageInfo.name || 'Unknown Dependency',
      severity: severity,
      description: advisory.description || 'No description provided',
      createdAt: new Date(alert.created_at || alert.created),
      updatedAt: new Date(alert.updated_at || alert.updated || alert.created_at || alert.created),
      state: alert.state || 'open',
      url: alert.html_url || alert.url,
      tool: 'GitHub',
      toolName: 'Dependabot',
      toolVersion: 'Unknown',
      ref: branchName,
      commitSha: '',
      ruleId: advisory.ghsa_id || '',
      ruleName: advisory.summary || packageInfo.name || '',
      ruleDescription: advisory.description || '',
      ruleSeverity: advisory.severity || '',
      filePath: '', // Dependency alerts don't typically have file paths in the same way as code scanning
      startLine: undefined,
      endLine: undefined,
      startColumn: undefined,
      endColumn: undefined,
      codeSnippet: '',
      category: 'dependency-scanning',
      ecosystem: packageInfo.ecosystem || dependency.ecosystem || '',
      packageName: packageInfo.name || dependency.package_name || '',
      version: dependency.version || '',
      fixedVersion: advisory.fixed_versions?.[0] || '',
      cveId: advisory.cve_id || '',
      cvss: advisory.cvss?.score,
      cwes: (advisory.cwes || []).map((cwe: any) => cwe.cwe_id || cwe.id),
      tags: advisory.identifiers?.map((id: any) => id.type || id.value) || [],
    };
  }

  /**
   * Maps GitHub's security advisory severity values to our standard severity values
   */
  private mapGitHubSeverity(githubSeverity: string): 'critical' | 'high' | 'medium' | 'low' | 'warning' | 'note' {
    const severityMap: { [key: string]: 'critical' | 'high' | 'medium' | 'low' | 'warning' | 'note' } = {
      'critical': 'critical',
      'high': 'high',
      'medium': 'medium',
      'low': 'low',
      'unknown': 'warning' // GitHub uses 'unknown' for some advisories
    };

    const mapped = severityMap[githubSeverity.toLowerCase()];
    return mapped || 'medium'; // default to medium if not found
  }
}