import { AggregatedScanningResult, MultiApplicationAggregatedScanningResult } from '../interfaces/scanning-result.interface';

// Type guard to check if data is for multiple applications
function isMultiApplicationData(data: any): data is MultiApplicationAggregatedScanningResult {
  return 'applications' in data && Array.isArray(data.applications);
}

export const renderReport = (data: AggregatedScanningResult | MultiApplicationAggregatedScanningResult): string => {
  if (isMultiApplicationData(data)) {
    // Handle multi-application report
    return renderMultiApplicationReport(data);
  } else {
    // Handle single application report for backward compatibility
    return renderSingleApplicationReport(data);
  }
};

const renderSingleApplicationReport = (data: AggregatedScanningResult): string => {
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

const renderMultiApplicationReport = (data: MultiApplicationAggregatedScanningResult): string => {
  const { applications, errors, summary, timestamp } = data;
  
  // Generate results table HTML for this application
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
  
  // Generate application grid HTML
  const applicationGrid = `
    <div class="application-grid">
      <h2>Applications</h2>
      ${applications.map(app => {
        // Determine the repository type based on which results have data
        let repoType = "Unknown";
        if (app.githubResults.codeScanning.length > 0 || app.githubResults.dependencyScanning.length > 0) {
          repoType = "GitHub";
        } else if (app.azureDevOpsResults.codeScanning.length > 0 || app.azureDevOpsResults.dependencyScanning.length > 0) {
          repoType = "Azure DevOps";
        }
        
        // Count total issues for this application
        const totalIssues = 
          app.githubResults.codeScanning.length + 
          app.githubResults.dependencyScanning.length + 
          app.azureDevOpsResults.codeScanning.length + 
          app.azureDevOpsResults.dependencyScanning.length;
        
        // Count by severity for this application
        const severityCounts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, warning: 0, note: 0 };
        
        [...app.githubResults.codeScanning, ...app.githubResults.dependencyScanning, 
         ...app.azureDevOpsResults.codeScanning, ...app.azureDevOpsResults.dependencyScanning]
        .forEach(result => {
          severityCounts[result.severity] = (severityCounts[result.severity] || 0) + 1;
        });
        
        return `
          <div class="application-card">
            <div class="app-header">
              <h3>${app.applicationName}</h3>
              <span class="repo-type ${repoType.toLowerCase().replace(' ', '-')}">${repoType}</span>
            </div>
            <p class="branch">Branch: ${app.branchName}</p>
            <div class="app-summary">
              <div class="total-issues">
                <strong>Total Issues:</strong> ${totalIssues}
              </div>
              <div class="severity-breakdown">
                <div class="severity critical">Critical: ${severityCounts.critical}</div>
                <div class="severity high">High: ${severityCounts.high}</div>
                <div class="severity medium">Medium: ${severityCounts.medium}</div>
                <div class="severity low">Low: ${severityCounts.low}</div>
              </div>
            </div>
            <details class="app-details">
              <summary>View Details</summary>
              <div class="app-results">
                ${
                  (app.githubResults.codeScanning.length > 0 || app.githubResults.dependencyScanning.length > 0) 
                  ? `
                    <div class="github-section">
                      <h4>GitHub Results</h4>
                      ${
                        app.githubResults.codeScanning.length > 0 
                        ? `
                          <div class="github-code">
                            <h5>Code Scanning: ${app.githubResults.codeScanning.length} issues</h5>
                            ${renderResultsTable(app.githubResults.codeScanning, "Code Scanning Results")}
                          </div>
                        ` 
                        : ''
                      }
                      ${
                        app.githubResults.dependencyScanning.length > 0 
                        ? `
                          <div class="github-dependency">
                            <h5>Dependency Scanning: ${app.githubResults.dependencyScanning.length} issues</h5>
                            ${renderResultsTable(app.githubResults.dependencyScanning, "Dependency Scanning Results")}
                          </div>
                        ` 
                        : ''
                      }
                    </div>
                  `
                  : ''
                }
                ${
                  (app.azureDevOpsResults.codeScanning.length > 0 || app.azureDevOpsResults.dependencyScanning.length > 0) 
                  ? `
                    <div class="azure-devops-section">
                      <h4>Azure DevOps Results</h4>
                      ${
                        app.azureDevOpsResults.codeScanning.length > 0 
                        ? `
                          <div class="azure-devops-code">
                            <h5>Code Scanning: ${app.azureDevOpsResults.codeScanning.length} issues</h5>
                            ${renderResultsTable(app.azureDevOpsResults.codeScanning, "Code Scanning Results")}
                          </div>
                        ` 
                        : ''
                      }
                      ${
                        app.azureDevOpsResults.dependencyScanning.length > 0 
                        ? `
                          <div class="azure-devops-dependency">
                            <h5>Dependency Scanning: ${app.azureDevOpsResults.dependencyScanning.length} issues</h5>
                            ${renderResultsTable(app.azureDevOpsResults.dependencyScanning, "Dependency Scanning Results")}
                          </div>
                        ` 
                        : ''
                      }
                    </div>
                  `
                  : ''
                }
              </div>
            </details>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Generate error section if there are any errors
  const errorSection = errors && errors.length > 0 ? `
    <div class="error-section">
      <h2>Application Errors</h2>
      <div class="error-list">
        ${errors.map(error => `
          <div class="error-item">
            <h3>Application: ${error.applicationName}</h3>
            <p><strong>Error:</strong> ${error.error}</p>
          </div>
          <hr />
        `).join('')}
      </div>
    </div>
  ` : '';

  // Generate overall summary card HTML
  const overallSummaryCard = `
    <div class="overall-summary">
      <h2>Overall Summary</h2>
      <div class="summary">
        <div class="summary-card">
          <h3>Total Applications</h3>
          <p><strong>${summary.totalApplications}</strong></p>
        </div>
        
        <div class="summary-card">
          <h3>Successfully Processed</h3>
          <p><strong>${applications.length - (errors ? errors.length : 0)}</strong></p>
        </div>
        
        <div class="summary-card">
          <h3>Failed Applications</h3>
          <p><strong>${errors ? errors.length : 0}</strong></p>
        </div>
        
        <div class="summary-card">
          <h3>GitHub Code Issues</h3>
          <p><strong>${summary.totalGithubCodeScanningIssues}</strong></p>
        </div>
        
        <div class="summary-card">
          <h3>GitHub Dependency Issues</h3>
          <p><strong>${summary.totalGithubDependencyScanningIssues}</strong></p>
        </div>
        
        <div class="summary-card">
          <h3>Azure DevOps Code Issues</h3>
          <p><strong>${summary.totalAzureDevOpsCodeScanningIssues}</strong></p>
        </div>
        
        <div class="summary-card">
          <h3>Azure DevOps Dependency Issues</h3>
          <p><strong>${summary.totalAzureDevOpsDependencyScanningIssues}</strong></p>
        </div>
      </div>
      
      <div class="severity-summary">
        <h3>Severity Summary</h3>
        <div class="summary">
          <div class="summary-card">
            <h3>Critical</h3>
            <p><strong>${summary.severitySummary.critical}</strong></p>
          </div>
          <div class="summary-card">
            <h3>High</h3>
            <p><strong>${summary.severitySummary.high}</strong></p>
          </div>
          <div class="summary-card">
            <h3>Medium</h3>
            <p><strong>${summary.severitySummary.medium}</strong></p>
          </div>
          <div class="summary-card">
            <h3>Low</h3>
            <p><strong>${summary.severitySummary.low}</strong></p>
          </div>
          <div class="summary-card">
            <h3>Warning</h3>
            <p><strong>${summary.severitySummary.warning}</strong></p>
          </div>
          <div class="summary-card">
            <h3>Note</h3>
            <p><strong>${summary.severitySummary.note}</strong></p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Construct the full HTML document for multi-application report
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Multi-Application Dependency and Code Scanning Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      .header { background-color: #f5f5f5; padding: 20px; border-radius: 5px; }
      .summary { display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0; }
      .summary-card { 
        border: 1px solid #ddd; 
        border-radius: 5px; 
        padding: 15px; 
        flex: 1; 
        min-width: 130px; 
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
      h3 { color: #555; }
      h4 { color: #666; margin-top: 25px; }
      h5 { color: #777; margin-top: 20px; }
      hr { margin: 40px 0; border: 0; border-top: 1px solid #eee; }
      .overall-summary { margin-bottom: 40px; }
      .severity-summary { margin-top: 30px; }
      .error-section { margin: 40px 0; padding: 20px; border: 1px solid #ffcccc; background-color: #fff5f5; border-radius: 5px; }
      .error-item { margin: 20px 0; padding: 15px; background-color: #ffffff; border: 1px solid #ffdddd; border-radius: 3px; }
      .error-item h3 { margin-top: 0; color: #d00; }
      
      /* Application Grid Styles */
      .application-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 20px;
        margin: 30px 0;
      }
      
      .application-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        background-color: #fafafa;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .app-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      }
      
      .app-header h3 {
        margin: 0;
        color: #333;
      }
      
      .repo-type {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 0.8em;
        font-weight: bold;
        color: white;
      }
      
      .repo-type.github {
        background-color: #24292e;
      }
      
      .repo-type.azure-devops {
        background-color: #0078d7;
      }
      
      .branch {
        margin: 8px 0;
        color: #666;
        font-style: italic;
      }
      
      .app-summary {
        margin: 15px 0;
      }
      
      .total-issues {
        font-weight: bold;
        margin-bottom: 10px;
      }
      
      .severity-breakdown {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .severity {
        padding: 4px 8px;
        border-radius: 3px;
        font-size: 0.85em;
        font-weight: bold;
      }
      
      .severity.critical { color: #b30000; }
      .severity.high { color: #e68a00; }
      .severity.medium { color: #cc7a00; }
      .severity.low { color: #666600; }
      
      .app-details {
        margin-top: 15px;
      }
      
      .app-details summary {
        cursor: pointer;
        padding: 8px;
        background-color: #eee;
        border-radius: 4px;
        font-weight: bold;
      }
      
      .app-details[open] summary {
        margin-bottom: 15px;
      }
      
      .app-results {
        padding-top: 10px;
        border-top: 1px solid #eee;
      }
      
      @media (max-width: 768px) {
        .application-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Multi-Application Dependency and Code Scanning Report</h1>
      <p><strong>Generated:</strong> ${timestamp.toISOString()}</p>
    </div>

    ${overallSummaryCard}

    ${errorSection}

    ${applicationGrid}

    <footer>
      <hr />
      <p>Generated by Multi-Application Dependency Analysis Tool at ${timestamp.toISOString()}</p>
    </footer>
  </body>
</html>`;
};