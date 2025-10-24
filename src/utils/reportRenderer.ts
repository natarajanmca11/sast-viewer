import { AggregatedScanningResult, MultiApplicationAggregatedScanningResult, VulnerabilityReportItem } from '../interfaces/scanning-result.interface';

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
  
  // Create a comprehensive array of all vulnerabilities from all applications
  const allVulnerabilities: VulnerabilityReportItem[] = [];
  
  applications.forEach(app => {
    // Add GitHub Code Scanning results
    app.githubResults.codeScanning.forEach(result => {
      allVulnerabilities.push({
        application: app.applicationName,
        tool: 'GitHub',
        type: 'Code Scanning',
        id: result.id,
        name: result.name,
        severity: result.severity,
        description: result.description,
        state: result.state,
        url: result.url,
        additionalInfo: {
          ruleId: result.ruleId,
          ruleName: result.ruleName,
          ruleSeverity: result.ruleSeverity,
          filePath: result.filePath,
          startLine: result.startLine,
          endLine: result.endLine,
          startColumn: result.startColumn,
          endColumn: result.endColumn,
          codeSnippet: result.codeSnippet,
          cwes: result.cwes,
          tags: result.tags
        }
      });
    });
    
    // Add GitHub Dependency Scanning results
    app.githubResults.dependencyScanning.forEach(result => {
      allVulnerabilities.push({
        application: app.applicationName,
        tool: 'GitHub',
        type: 'Dependency Scanning',
        id: result.id,
        name: result.name,
        severity: result.severity,
        description: result.description,
        state: result.state,
        url: result.url,
        additionalInfo: {
          ecosystem: result.ecosystem,
          packageName: result.packageName,
          version: result.version,
          fixedVersion: result.fixedVersion,
          cveId: result.cveId,
          cvss: result.cvss
        }
      });
    });
    
    // Add Azure DevOps Code Scanning results
    app.azureDevOpsResults.codeScanning.forEach(result => {
      allVulnerabilities.push({
        application: app.applicationName,
        tool: 'Azure DevOps',
        type: 'Code Scanning',
        id: result.id,
        name: result.name,
        severity: result.severity,
        description: result.description,
        state: result.state,
        url: result.url,
        additionalInfo: {
          ruleId: result.ruleId,
          ruleName: result.ruleName,
          ruleSeverity: result.ruleSeverity,
          filePath: result.filePath,
          line: result.line,
          column: result.column,
          snippet: result.snippet,
          type: result.type
        }
      });
    });
    
    // Add Azure DevOps Dependency Scanning results
    app.azureDevOpsResults.dependencyScanning.forEach(result => {
      allVulnerabilities.push({
        application: app.applicationName,
        tool: 'Azure DevOps',
        type: 'Dependency Scanning',
        id: result.id,
        name: result.name,
        severity: result.severity,
        description: result.description,
        state: result.state,
        url: result.url,
        additionalInfo: {
          package: result.package,
          packageVersion: result.packageVersion,
          vulnerabilityId: result.vulnerabilityId,
          cvssScore: result.cvssScore,
          severityLevel: result.severityLevel
        }
      });
    });
  });
  
  // Generate the material design table HTML
  const vulnerabilitiesTable = `
    <div class="vulnerabilities-table-container">
      <h2>Security Issues Summary</h2>
      <table class="material-table">
        <thead>
          <tr>
            <th>Application</th>
            <th>Type</th>
            <th>Tool</th>
            <th>Severity</th>
            <th>Name</th>
            <th>Status</th>
            <th>Expand</th>
          </tr>
        </thead>
        <tbody>
          ${allVulnerabilities.map(vuln => `
            <tr>
              <td>${vuln.application}</td>
              <td class="type">${vuln.type}</td>
              <td class="tool">${vuln.tool}</td>
              <td class="severity severity-${vuln.severity}">${vuln.severity.toUpperCase()}</td>
              <td>${vuln.name}</td>
              <td>${vuln.state}</td>
              <td>
                <button class="expand-btn" onclick="toggleRowDetails(this)">Expand</button>
              </td>
            </tr>
            <tr class="details-row hidden">
              <td colspan="7" class="details-content">
                <div class="details-panel">
                  <div class="detail-item">
                    <strong>ID:</strong> ${vuln.id}
                  </div>
                  <div class="detail-item">
                    <strong>Description:</strong> ${vuln.description}
                  </div>
                  ${vuln.url ? `<div class="detail-item">
                    <strong>Link:</strong> <a href="${vuln.url}" target="_blank">View in ${vuln.tool}</a>
                  </div>` : ''}
                  ${vuln.type === 'Dependency Scanning' ? `
                    <div class="detail-item">
                      <strong>Package:</strong> ${vuln.additionalInfo.packageName || vuln.additionalInfo.package || 'N/A'}
                    </div>
                    <div class="detail-item">
                      <strong>Version:</strong> ${vuln.additionalInfo.version || vuln.additionalInfo.packageVersion || 'N/A'}
                    </div>
                    <div class="detail-item">
                      <strong>Fixed in:</strong> ${vuln.additionalInfo.fixedVersion || 'N/A'}
                    </div>
                    <div class="detail-item">
                      <strong>CVE:</strong> ${vuln.additionalInfo.cveId || vuln.additionalInfo.vulnerabilityId || 'N/A'}
                    </div>
                    <div class="detail-item">
                      <strong>CVSS:</strong> ${vuln.additionalInfo.cvss || vuln.additionalInfo.cvssScore || 'N/A'}
                    </div>
                  ` : `
                    <div class="detail-item">
                      <strong>File:</strong> ${vuln.additionalInfo.filePath || 'N/A'}
                    </div>
                    <div class="detail-item">
                      <strong>Location:</strong> Line ${vuln.additionalInfo.startLine || vuln.additionalInfo.line || 'N/A'}, Column ${vuln.additionalInfo.startColumn || vuln.additionalInfo.column || 'N/A'}
                    </div>
                    <div class="detail-item">
                      <strong>Rule ID:</strong> ${vuln.additionalInfo.ruleId}
                    </div>
                    <div class="detail-item">
                      <strong>Rule Name:</strong> ${vuln.additionalInfo.ruleName}
                    </div>
                  `}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
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

  // Construct the full HTML document for multi-application report with material design table
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Multi-Application Security Scanning Report</title>
    <style>
      body { 
        font-family: 'Roboto', Arial, sans-serif; 
        margin: 20px; 
        background-color: #f5f5f5;
      }
      .header { 
        background-color: white; 
        padding: 20px; 
        border-radius: 4px; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
      }
      .summary { 
        display: flex; 
        flex-wrap: wrap; 
        gap: 15px; 
        margin: 20px 0; 
      }
      .summary-card { 
        border: 1px solid #ddd; 
        border-radius: 4px; 
        padding: 16px; 
        flex: 1; 
        min-width: 130px; 
        background-color: white;
        box-shadow: 0 2px 2px rgba(0,0,0,0.1);
      }
      .summary-card h3 { 
        margin-top: 0; 
        font-size: 14px;
        color: #666;
      }
      .summary-card p { 
        margin: 5px 0 0; 
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }
      
      /* Material Design Table Styles */
      .vulnerabilities-table-container {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
        overflow: hidden;
      }
      
      .material-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }
      
      .material-table th {
        background-color: #f5f5f5;
        padding: 12px 16px;
        text-align: left;
        font-weight: 600;
        color: #666;
        border-bottom: 1px solid #ddd;
      }
      
      .material-table td {
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
        color: #333;
      }
      
      .material-table tbody tr:hover {
        background-color: #f9f9f9;
      }
      
      .severity-critical { color: #d32f2f; font-weight: bold; }
      .severity-high { color: #f57c00; font-weight: bold; }
      .severity-medium { color: #efbc00; }
      .severity-low { color: #777; }
      .severity-warning { color: #ffa000; }
      .severity-note { color: #9e9e9e; }
      
      .type {
        text-transform: capitalize;
        font-weight: 500;
      }
      
      .tool {
        font-weight: 500;
        color: #555;
      }
      
      .expand-btn {
        background-color: #e0e0e0;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .expand-btn:hover {
        background-color: #d5d5d5;
      }
      
      .details-row {
        background-color: #f9f9f9;
      }
      
      .details-content {
        padding: 0 !important;
      }
      
      .details-panel {
        padding: 16px;
        border-top: 1px solid #eee;
      }
      
      .detail-item {
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid #eee;
      }
      
      .detail-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
      
      .hidden {
        display: none;
      }
      
      h2 { 
        color: #333; 
        border-bottom: none; 
        padding-bottom: 10px; 
        margin-top: 0;
        font-weight: 500;
      }
      hr { 
        margin: 40px 0; 
        border: 0; 
        border-top: 1px solid #eee; 
      }
      .overall-summary { 
        margin-bottom: 40px; 
      }
      .severity-summary { 
        margin-top: 30px; 
      }
      .error-section { 
        margin: 40px 0; 
        padding: 20px; 
        border: 1px solid #ffcccc; 
        background-color: #fff5f5; 
        border-radius: 4px; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .error-item { 
        margin: 20px 0; 
        padding: 15px; 
        background-color: white; 
        border: 1px solid #ffdddd; 
        border-radius: 3px; 
      }
      .error-item h3 { 
        margin-top: 0; 
        color: #d00; 
      }
      
      footer {
        background-color: white;
        padding: 20px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        text-align: center;
        color: #666;
      }
      
      @media (max-width: 768px) {
        .summary-card {
          min-width: 100px;
          flex: 1 1 100px;
        }
        
        .material-table {
          font-size: 12px;
        }
        
        .material-table th,
        .material-table td {
          padding: 8px;
        }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Multi-Application Security Scanning Report</h1>
      <p><strong>Generated:</strong> ${timestamp.toISOString()}</p>
    </div>

    ${overallSummaryCard}

    ${errorSection}

    ${vulnerabilitiesTable}

    <footer>
      <p>Generated by Multi-Application Dependency Analysis Tool at ${timestamp.toISOString()}</p>
    </footer>

    <script>
      function toggleRowDetails(button) {
        const row = button.closest('tr');
        const detailsRow = row.nextElementSibling;
        
        if (detailsRow && detailsRow.classList.contains('details-row')) {
          if (detailsRow.classList.contains('hidden')) {
            detailsRow.classList.remove('hidden');
            button.textContent = 'Collapse';
          } else {
            detailsRow.classList.add('hidden');
            button.textContent = 'Expand';
          }
        }
      }
    </script>
  </body>
</html>`;
};