/**
 * Basic tests for the dependency analysis tool
 */
import { main } from '../src/index';

describe('Dependency Analysis Main Function', () => {
  it('should be defined', () => {
    // Check that the main function exists
    expect(main).toBeDefined();
  });

  it('should be a function', () => {
    // Check that the main export is a function
    expect(typeof main).toBe('function');
  });
});