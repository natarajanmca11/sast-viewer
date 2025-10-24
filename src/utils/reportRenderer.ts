import { AggregatedScanningResult } from '../interfaces/scanning-result.interface';

export const renderReport = (data: AggregatedScanningResult): string => {
  // Extract data
  const { 
    applicationName, 
    branchName, 
    githubResults, 
    azureDevOpsResults, 
    timestamp 
  } = data;

  // Count total issues by severity
  const countIssuesBySeverity = (results: any[]) => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, warning: 0, note: 0 };
    
    results.forEach(result => {
      const severity = result.severity;
      counts[severity] = (counts[severity] || 0) + 1;
    });
    
    return counts;
  };

  // Calculate GitHub results counts
  const ghCodeCounts = countIssuesBySeverity(githubResults.codeScanning);
  const ghDependencyCounts = countIssuesBySeverity(githubResults.dependencyScanning);
  
  // Calculate Azure DevOps results counts
  const adoCodeCounts = countIssuesBySeverity(azureDevOpsResults.codeScanning);
  const adoDependencyCounts = countIssuesBySeverity(azureDevOpsResults.dependencyScanning);

  // Generate results table HTML
  const renderResultsTable = (results: any[], title: string): string => {
    if (!results || results.length === 0) {
      return `<p>No ${title} results found</p>`;
    }

    let tableRows = '';
    results.forEach(result => {
      tableRows += `
        <tr>
          <td>${result.id || ''}</td>
          <td>${result.name || ''}</td>
          <td class="severity-${result.severity}">
            ${result.severity ? result.severity.toUpperCase() : ''}
          </td>
          <td>${result.description || ''}</td>
          <td>${result.state || ''}</td>
          <td>${result.tool || ''}</td>
        </tr>
      `;
    });

    return `
      <div class="results-table">
        <h4>${title}</h4>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Severity</th>
              <th>Description</th>
              <th>State</th>
              <th>Tool</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;
  };

  // Construct the full HTML document
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Dependency and Code Scanning Report - ${applicationName}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      .header { background-color: #f5f5f5; padding: 20px; border-radius: 5px; }
      .summary { display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0; }
      .summary-card { 
        border: 1px solid #ddd; 
        border-radius: 5px; 
        padding: 15px; 
        flex: 1; 
        min-width: 200px; 
      }
      .summary-card h3 { margin-top: 0; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .severity-critical { color: #b30000; font-weight: bold; }
      .severity-high { color: #e68a00; font-weight: bold; }
      .severity-medium { color: #cc7a00; }
      .severity-low { color: #666600; }
      .severity-warning { color: #663d00; }
      .severity-note { color: #999999; }
      .results-table { margin: 30px 0; }
      .tool-section { margin: 40px 0; }
      h2 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Dependency and Code Scanning Report</h1>
      <p><strong>Application:</strong> ${applicationName}</p>
      <p><strong>Branch:</strong> ${branchName}</p>
      <p><strong>Generated:</strong> ${timestamp.toISOString()}</p>
    </div>

    <div class="summary">
      <div class="summary-card">
        <h3>GitHub Code Scanning</h3>
        <p><strong>Critical:</strong> ${ghCodeCounts.critical}</p>
        <p><strong>High:</strong> ${ghCodeCounts.high}</p>
        <p><strong>Medium:</strong> ${ghCodeCounts.medium}</p>
        <p><strong>Low:</strong> ${ghCodeCounts.low}</p>
      </div>
      
      <div class="summary-card">
        <h3>GitHub Dependency Scanning</h3>
        <p><strong>Critical:</strong> ${ghDependencyCounts.critical}</p>
        <p><strong>High:</strong> ${ghDependencyCounts.high}</p>
        <p><strong>Medium:</strong> ${ghDependencyCounts.medium}</p>
        <p><strong>Low:</strong> ${ghDependencyCounts.low}</p>
      </div>
      
      <div class="summary-card">
        <h3>Azure DevOps Code Scanning</h3>
        <p><strong>Critical:</strong> ${adoCodeCounts.critical}</p>
        <p><strong>High:</strong> ${adoCodeCounts.high}</p>
        <p><strong>Medium:</strong> ${adoCodeCounts.medium}</p>
        <p><strong>Low:</strong> ${adoCodeCounts.low}</p>
      </div>
      
      <div class="summary-card">
        <h3>Azure DevOps Dependency Scanning</h3>
        <p><strong>Critical:</strong> ${adoDependencyCounts.critical}</p>
        <p><strong>High:</strong> ${adoDependencyCounts.high}</p>
        <p><strong>Medium:</strong> ${adoDependencyCounts.medium}</p>
        <p><strong>Low:</strong> ${adoDependencyCounts.low}</p>
      </div>
    </div>

    <div class="tool-section">
      <h2>GitHub Results</h2>
      
      <div class="github-code">
        ${renderResultsTable(githubResults.codeScanning, "Code Scanning Results")}
      </div>
      
      <div class="github-dependency">
        ${renderResultsTable(githubResults.dependencyScanning, "Dependency Scanning Results")}
      </div>
    </div>

    <div class="tool-section">
      <h2>Azure DevOps Results</h2>
      
      <div class="azure-devops-code">
        ${renderResultsTable(azureDevOpsResults.codeScanning, "Code Scanning Results")}
      </div>
      
      <div class="azure-devops-dependency">
        ${renderResultsTable(azureDevOpsResults.dependencyScanning, "Dependency Scanning Results")}
      </div>
    </div>

    <footer>
      <hr />
      <p>Generated by Dependency Analysis Tool at ${timestamp.toISOString()}</p>
    </footer>
  </body>
</html>`;
};