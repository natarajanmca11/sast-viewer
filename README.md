# Dependency Analysis Tool

A TypeScript-based Node.js application that retrieves code scanning and dependency scanning results from both GitHub and Azure DevOps, and generates a React-based HTML report.

## Features

- Fetch code scanning results from GitHub and Azure DevOps
- Fetch dependency scanning results from GitHub and Azure DevOps
- Generate comprehensive HTML reports with aggregated results
- Support for multiple severity levels and issue types
- Timestamped report generation

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dependency-analysis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Create a `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your specific configuration:
   ```bash
   # GitHub Configuration
   GITHUB_ORG_NAME=your-github-org
   GITHUB_TOKEN=your-personal-access-token
   GITHUB_BASE_URL=https://api.github.com

   # Azure DevOps Configuration
   AZURE_DEVOPS_ORG_NAME=your-azure-devops-organization
   AZURE_DEVOPS_PROJECT_NAME=your-project-name
   AZURE_DEVOPS_TOKEN=your-personal-access-token
   AZURE_DEVOPS_BASE_URL= # Optional, defaults to Azure DevOps URL

   # Application Configuration
   # For GitHub applications: GITHUB_APPLICATION_NAMES=repo1,repo2,repo3
   GITHUB_APPLICATION_NAMES=your-github-repo-name
   # For Azure DevOps applications: AZURE_DEVOPS_APPLICATION_NAMES=project1/app1,project2/app2,standalone-app
   AZURE_DEVOPS_APPLICATION_NAMES=your-azure-devops-app-name
   # For backward compatibility, APPLICATION_NAME can be used for both (deprecated)
   # APPLICATION_NAME=your-application-name
   BRANCH_NAME=main # The branch to scan (applies to all applications)
   OUTPUT_DIR=./output # Directory for generated reports
   ```

### Required Permissions

- **GitHub Token**: Requires `security_events` permission to read code scanning alerts
- **Azure DevOps Token**: Requires `Code (read)` and `Build (read)` permissions

## Usage

### Build the application
```bash
npm run build
```

### Run the analysis
```bash
npm start
```

### Run with a single command
```bash
npm run analyze
```

### Development mode (watch for changes)
```bash
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_ORG_NAME` | GitHub organization name | Yes |
| `GITHUB_TOKEN` | GitHub personal access token | Yes |
| `GITHUB_BASE_URL` | GitHub API base URL (default: https://api.github.com) | No |
| `AZURE_DEVOPS_ORG_NAME` | Azure DevOps organization name | Yes |
| `AZURE_DEVOPS_PROJECT_NAME` | Default Azure DevOps project name. Used when AZURE_DEVOPS_APPLICATION_NAMES doesn't contain '/'. Can be overridden per application using format `projectname/applicationname` | Yes |
| `AZURE_DEVOPS_TOKEN` | Azure DevOps personal access token | Yes |
| `GITHUB_APPLICATION_NAMES` | GitHub repository names to analyze. For single repository: `repo1`. For multiple repositories: `repo1,repo2,repo3` | No |
| `AZURE_DEVOPS_APPLICATION_NAMES` | Azure DevOps application names to analyze. For single application with project: `projectname/applicationname`. For multiple applications: `project1/app1,project2/app2,standalone-app` | No |
| `APPLICATION_NAME` | **Deprecated**: Use GITHUB_APPLICATION_NAMES and/or AZURE_DEVOPS_APPLICATION_NAMES instead. For backward compatibility: For single application: `app1`. For Azure DevOps with project override: `projectname/applicationname`. For multiple applications: `app1,app2,project1/app1,project2/app2` | No |
| `BRANCH_NAME` | Branch name to analyze (default: main). Applied to all applications. | No |
| `OUTPUT_DIR` | Directory to save reports (default: ./output) | No |

## Output

The application generates a timestamped HTML report in the `output` directory (configurable via `OUTPUT_DIR` environment variable).

- For single application: The filename format is `YYYY-MM-DDTHH-MM-SSZ.html` (e.g., `2025-10-24T12-00-00Z.html`)
- For multiple applications: The filename format is `multi-app-report-YYYY-MM-DDTHH-MM-SSZ.html` (e.g., `multi-app-report-2025-10-24T12-00-00Z.html`)

The report includes:
- **Single Application Report**: Summary cards with issue counts by severity and tool, detailed tables for code and dependency scanning results from both platforms, and a generation timestamp
- **Multi-Application Report**: Overall summary showing total counts across all applications, detailed breakdown by severity, and individual application sections with their own summaries and detailed results

## Project Structure

```
src/
├── index.ts                    # Main application entry point
├── interfaces/
│   └── scanning-result.interface.ts  # Type definitions
├── services/
│   ├── GitHubService/
│   │   ├── GitHubCodeScanningResultService.ts
│   │   └── GitHubDependencyScanningResultService.ts
│   └── AzureDevOpsService/
│       ├── AzureDevOpsCodeScanningResultService.ts
│       └── AzureDevOpsDependencyScanningResultService.ts
├── report/
│   └── Report.tsx             # React report component
├── utils/
│   └── reportRenderer.ts      # Report rendering utility
└── config/
    └── environment.ts         # Environment configuration
```

## Development

### Build
```bash
npm run build        # Compile TypeScript
npm run build:watch  # Watch for changes and rebuild
```

### Testing
```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Linting
```bash
npm run lint          # Check for linting issues
npm run lint:fix      # Fix linting issues automatically
```

## License

This project is licensed under the ISC License.