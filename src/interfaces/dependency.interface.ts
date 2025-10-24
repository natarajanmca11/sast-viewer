/**
 * Interface for dependency analysis results
 */
export interface DependencyResult {
  name: string;
  version: string;
  dependencies: DependencyResult[];
  devDependencies?: DependencyResult[];
}

export interface AnalysisOptions {
  includeDevDependencies?: boolean;
  includePeerDependencies?: boolean;
  maxDepth?: number;
}