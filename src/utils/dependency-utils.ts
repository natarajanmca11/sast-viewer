/**
 * Utility functions for dependency analysis
 */

export const utils = {
  /**
   * Parse a package.json file
   */
  parsePackageJson: (content: string): any => {
    try {
      return JSON.parse(content);
    } catch (error: any) {
      throw new Error(`Invalid package.json: ${error.message}`);
    }
  },

  /**
   * Check if a dependency is a dev dependency
   */
  isDevDependency: (dependencyName: string, pkg: any): boolean => {
    return pkg.devDependencies && pkg.devDependencies[dependencyName] !== undefined;
  },

  /**
   * Get all dependencies (regular + dev if specified)
   */
  getAllDependencies: (pkg: any, includeDev: boolean = false): Record<string, string> => {
    const deps = pkg.dependencies ? { ...pkg.dependencies } : {};
    
    if (includeDev && pkg.devDependencies) {
      Object.assign(deps, pkg.devDependencies);
    }
    
    return deps;
  }
};