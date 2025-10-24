import './browser-env';
import { test } from './test-framework';

test.describe('Simple Test', () => {
  test.it('should work', () => {
    const result = test.expect('hello');
    console.log('Result:', result);
    console.log('Type:', typeof result);
    console.log('Constructor:', result?.constructor?.name);
    
    result.toContain('hello');
  });
});