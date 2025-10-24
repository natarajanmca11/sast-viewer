/**
 * Interface definitions for code and dependency scanning results
 */

// Common interfaces
export interface ScanningResultBase {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'warning' | 'note';
  description: string;
  createdAt: Date;
  updatedAt: Date;
  state: 'open' | 'fixed' | 'dismissed';
  url?: string;
}

export interface GitHubScanningResult extends ScanningResultBase {
  tool: 'GitHub';
  toolName: string;
  toolVersion: string;
  ref: string; // branch name
  commitSha: string;
  ruleId: string;
  ruleName: string;
  ruleDescription: string;
  ruleSeverity: string;
  filePath: string;
  startLine?: number;
  endLine?: number;
  startColumn?: number;
  endColumn?: number;
  codeSnippet?: string;
  category: 'code-scanning' | 'dependency-scanning';
  ecosystem?: string; // for dependency scanning
  packageName?: string; // for dependency scanning
  version?: string; // for dependency scanning
  fixedVersion?: string; // for dependency scanning
  cveId?: string; // for dependency scanning
  cvss?: number; // for dependency scanning
  cwes?: string[]; // Common Weakness Enumerations
  tags?: string[];
}

export interface AzureDevOpsScanningResult extends ScanningResultBase {
  tool: 'AzureDevOps';
  toolName: string;
  toolVersion: string;
  branchName: string;
  commitId: string;
  ruleId: string;
  ruleName: string;
  ruleDescription: string;
  ruleSeverity: string;
  filePath: string;
  line?: number;
  column?: number;
  snippet?: string;
  category: 'code-scanning' | 'dependency-scanning';
  package?: string; // for dependency scanning
  packageVersion?: string; // for dependency scanning
  vulnerabilityId?: string; // for dependency scanning
  cvssScore?: number; // for dependency scanning
  severityLevel: number; // 1=critical, 2=high, 3=medium, 4=low
  type: string; // type of vulnerability or finding
  detectionDate: Date;
}

// Specific scanning result interfaces
export interface GitHubCodeScanningResult extends GitHubScanningResult {
  category: 'code-scanning';
}

export interface GitHubDependencyScanningResult extends GitHubScanningResult {
  category: 'dependency-scanning';
  ecosystem: string;
  packageName: string;
  version: string;
  fixedVersion?: string;
  cveId?: string;
  cvss?: number;
}

export interface AzureDevOpsCodeScanningResult extends AzureDevOpsScanningResult {
  category: 'code-scanning';
}

export interface AzureDevOpsDependencyScanningResult extends AzureDevOpsScanningResult {
  category: 'dependency-scanning';
  package: string;
  packageVersion: string;
  vulnerabilityId?: string;
  cvssScore?: number;
}

// Aggregated result interface
export interface AggregatedScanningResult {
  applicationName: string;
  branchName: string;
  githubResults: {
    codeScanning: GitHubCodeScanningResult[];
    dependencyScanning: GitHubDependencyScanningResult[];
  };
  azureDevOpsResults: {
    codeScanning: AzureDevOpsCodeScanningResult[];
    dependencyScanning: AzureDevOpsDependencyScanningResult[];
  };
  timestamp: Date;
}

// Service parameters
export interface GitHubServiceParams {
  orgName: string;
  token: string;
  baseUrl?: string;
}

export interface AzureDevOpsServiceParams {
  orgName: string;
  projectName: string;
  token: string;
  baseUrl?: string;
}

// Request parameters
export interface ScanningRequestParams {
  applicationName: string;
  branchName: string;
}