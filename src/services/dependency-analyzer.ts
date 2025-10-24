/**
 * Service for analyzing project dependencies
 */
import { DependencyResult, AnalysisOptions } from '../interfaces/dependency.interface';
import { utils } from '../utils/dependency-utils';
import * as fs from 'fs/promises';
// import * as path from 'path'; // Commenting out unused import

export async function analyzeDependencies(
  packagePath: string, 
  options: AnalysisOptions = {}
): Promise<DependencyResult> {
  
  const { includeDevDependencies = false } /* , maxDepth = 5 */ = options; // Commenting out unused parameter
  
  try {
    // Read and parse the package.json file
    const packageContent = await fs.readFile(packagePath, 'utf-8');
    const pkg = utils.parsePackageJson(packageContent);
    
    // Get dependencies based on options
    const dependencies = utils.getAllDependencies(pkg, includeDevDependencies);
    
    // Process each dependency (simplified implementation)
    const processedDeps: DependencyResult[] = [];
    
    for (const [name, version] of Object.entries(dependencies)) {
      processedDeps.push({
        name: name as string,
        version: version as string,
        dependencies: [] // Simplified - in a full implementation, we would recursively analyze these
      });
    }
    
    return {
      name: pkg.name || 'unknown',
      version: pkg.version || 'unknown',
      dependencies: processedDeps
    };
    
  } catch (error: any) {
    throw new Error(`Failed to analyze dependencies: ${error.message}`);
  }
}