import { Project, SourceFile, FunctionDeclaration } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test Function Serializer using AST-based extraction
 * Converts TypeScript test functions to executable JavaScript strings
 * using the ts-morph library for TypeScript AST parsing
 */

export interface ExtractedTestFunction {
  name: string;
  sourceCode: string;
  originalFunction: FunctionDeclaration;
}

/**
 * Extract test function from a source file using AST parsing
 * Returns the function body as a JavaScript string
 */
export function extractTestFunctionBody(func: FunctionDeclaration): string {
  const body = func.getBody();

  if (!body) {
    throw new Error(`Test function ${func.getName()} has no body`);
  }

  // Get the source code of the function body
  let bodySource = body.getText();

  // Remove surrounding curly braces
  if (bodySource.startsWith('{') && bodySource.endsWith('}')) {
    bodySource = bodySource.slice(1, -1).trim();
  }

  return bodySource;
}

/**
 * Generate JavaScript code that wraps a test function for execution in the Rust browser
 * Handles variable scoping and error reporting
 */
export function wrapTestFunction(
  testName: string,
  testBody: string,
  suiteName: string,
): string {
  return `
(async function() {
  try {
    // Test body
    ${testBody}

    // Report success
    reportTestResult("${suiteName} > ${testName}", true, "All assertions passed");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "";
    reportTestResult("${suiteName} > ${testName}", false, \`\${message}\\n\${stack}\`);
  }
})();
`;
}

/**
 * Parse a test file and extract all test functions
 */
export function extractTestFunctionsFromFile(
  filePath: string,
): ExtractedTestFunction[] {
  const sourceFile = createProject().addSourceFileAtPath(filePath);
  const tests: ExtractedTestFunction[] = [];

  // Find all calls to `test()` function
  const testCalls = sourceFile.getDescendantsOfKind(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('ts-morph').SyntaxKind.CallExpression,
  );

  for (const callExpr of testCalls) {
    try {
      const expression = (callExpr as any).getExpression?.();
      if (!expression) continue;

      // Check if this is a call to `test()`
      const expressionText = expression.getText?.();
      if (expressionText === 'test') {
        const args = (callExpr as any).getArguments?.();
        if (args && args.length >= 2) {
          // First argument is the test name
          const nameArg = args[0].getText();
          const testName = nameArg
            .replace(/^["']|["']$/g, '')
            .replace(/\\./g, (m) => m[1]);

          // Second argument is the test function
          const funcArg = args[1];
          if (funcArg.getKind?.() === require('ts-morph').SyntaxKind.ArrowFunction) {
            const arrowFunc = funcArg.asKind?.(require('ts-morph').SyntaxKind.ArrowFunction);
            if (arrowFunc) {
              const body = arrowFunc.getBody?.();
              const bodyText = body ? body.getText() : '';

              tests.push({
                name: testName,
                sourceCode: bodyText,
                originalFunction: funcArg as any,
              });
            }
          }
        }
      }
    } catch (e) {
      // Skip errors in AST parsing - ts-morph API may vary
      continue;
    }
  }

  return tests;
}

/**
 * Create a new ts-morph project for parsing
 */
function createProject() {
  return new Project({
    compilerOptions: {
      target: require('typescript').ScriptTarget.ES2020,
      module: require('typescript').ModuleKind.CommonJS,
      lib: ['ES2020', 'DOM'],
      strict: true,
      declaration: true,
      sourceMap: true,
    },
  });
}

/**
 * Generate a complete JavaScript test code from TypeScript test function
 */
export function generateJavaScriptTestCode(
  testName: string,
  testBody: string,
  suiteName: string,
): string {
  return wrapTestFunction(testName, testBody, suiteName);
}
