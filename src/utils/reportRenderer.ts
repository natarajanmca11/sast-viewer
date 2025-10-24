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
  
  // Generate HTML for each application's detailed results
  const applicationSections = applications.map(app => {
    // Count total issues by severity for this application
    const countIssuesBySeverity = (results: any[]) => {
      const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, warning: 0, note: 0 };
      
      results.forEach(result => {
        const severity = result.severity;
        counts[severity] = (counts[severity] || 0) + 1;
      });
      
      return counts;
    };

    // Calculate GitHub results counts for this application
    const ghCodeCounts = countIssuesBySeverity(app.githubResults.codeScanning);
    const ghDependencyCounts = countIssuesBySeverity(app.githubResults.dependencyScanning);
    
    // Calculate Azure DevOps results counts for this application
    const adoCodeCounts = countIssuesBySeverity(app.azureDevOpsResults.codeScanning);
    const adoDependencyCounts = countIssuesBySeverity(app.azureDevOpsResults.dependencyScanning);

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

    return `
      <div class="application-section">
        <h2>Application: ${app.applicationName}</h2>
        <p><strong>Branch:</strong> ${app.branchName}</p>
        
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
          <h3>GitHub Results</h3>
          
          <div class="github-code">
            ${renderResultsTable(app.githubResults.codeScanning, "Code Scanning Results")}
          </div>
          
          <div class="github-dependency">
            ${renderResultsTable(app.githubResults.dependencyScanning, "Dependency Scanning Results")}
          </div>
        </div>

        <div class="tool-section">
          <h3>Azure DevOps Results</h3>
          
          <div class="azure-devops-code">
            ${renderResultsTable(app.azureDevOpsResults.codeScanning, "Code Scanning Results")}
          </div>
          
          <div class="azure-devops-dependency">
            ${renderResultsTable(app.azureDevOpsResults.dependencyScanning, "Dependency Scanning Results")}
          </div>
        </div>
      </div>
      <hr />
    `;
  }).join('');

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
      hr { margin: 40px 0; border: 0; border-top: 1px solid #eee; }
      .overall-summary { margin-bottom: 40px; }
      .severity-summary { margin-top: 30px; }
      .error-section { margin: 40px 0; padding: 20px; border: 1px solid #ffcccc; background-color: #fff5f5; border-radius: 5px; }
      .error-item { margin: 20px 0; padding: 15px; background-color: #ffffff; border: 1px solid #ffdddd; border-radius: 3px; }
      .error-item h3 { margin-top: 0; color: #d00; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Multi-Application Dependency and Code Scanning Report</h1>
      <p><strong>Generated:</strong> ${timestamp.toISOString()}</p>
    </div>

    ${overallSummaryCard}

    ${errorSection}

    ${applicationSections}

    <footer>
      <hr />
      <p>Generated by Multi-Application Dependency Analysis Tool at ${timestamp.toISOString()}</p>
    </footer>
  </body>
</html>`;
};