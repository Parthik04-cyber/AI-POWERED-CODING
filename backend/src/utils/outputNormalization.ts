/**
 * Output normalization utilities for comparing expected vs actual outputs
 * Handles various formatting and whitespace issues
 */

interface NormalizationOptions {
  trimWhitespace?: boolean;
  normalizeNewlines?: boolean;
  normalizeNumbers?: boolean;
  ignoreCase?: boolean;
  ignoreTrailingWhitespace?: boolean;
  normalizeArrayFormat?: boolean;
}

const DEFAULT_OPTIONS: NormalizationOptions = {
  trimWhitespace: true,
  normalizeNewlines: true,
  normalizeNumbers: false,
  ignoreCase: false,
  ignoreTrailingWhitespace: true,
  normalizeArrayFormat: true,
};

/**
 * Normalize output string for comparison
 */
export const normalizeOutput = (
  output: string,
  options: NormalizationOptions = DEFAULT_OPTIONS
): string => {
  let normalized = output;

  // Remove trailing whitespace from each line
  if (options.ignoreTrailingWhitespace) {
    normalized = normalized
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n');
  }

  // Trim overall whitespace
  if (options.trimWhitespace) {
    normalized = normalized.trim();
  }

  // Normalize newlines (CRLF -> LF)
  if (options.normalizeNewlines) {
    normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  // Normalize multiple spaces/tabs to single space (within lines)
  normalized = normalized.replace(/[ \t]+/g, ' ');

  // Normalize multiple newlines to single newline
  normalized = normalized.replace(/\n\n+/g, '\n');

  // Handle array format normalization: "[1, 2, 3]" vs "[1,2,3]"
  if (options.normalizeArrayFormat) {
    // Remove spaces after commas within arrays/brackets
    normalized = normalized.replace(/(\[\s*|\[\s*)\s+/g, '[');
    normalized = normalized.replace(/,\s+/g, ',');
    normalized = normalized.replace(/\s+(\]|\})/g, '$1');
  }

  // Case insensitive comparison
  if (options.ignoreCase) {
    normalized = normalized.toLowerCase();
  }

  return normalized;
};

/**
 * Compare two outputs for equality after normalization
 */
export const compareOutputs = (
  actual: string,
  expected: string,
  options: NormalizationOptions = DEFAULT_OPTIONS
): boolean => {
  const normalizedActual = normalizeOutput(actual, options);
  const normalizedExpected = normalizeOutput(expected, options);
  return normalizedActual === normalizedExpected;
};

/**
 * Get difference between normalized outputs for display
 */
export const getOutputDifference = (
  actual: string,
  expected: string,
  options: NormalizationOptions = DEFAULT_OPTIONS
): string => {
  const normalizedActual = normalizeOutput(actual, options);
  const normalizedExpected = normalizeOutput(expected, options);

  if (normalizedActual === normalizedExpected) {
    return '';
  }

  // Show character-by-character difference at the first mismatch point
  for (let i = 0; i < Math.max(normalizedActual.length, normalizedExpected.length); i++) {
    if (normalizedActual[i] !== normalizedExpected[i]) {
      const actualPreview = normalizedActual.substring(Math.max(0, i - 10), i + 30);
      const expectedPreview = normalizedExpected.substring(Math.max(0, i - 10), i + 30);
      return `First difference at position ${i}:\nYour: ...${actualPreview}...\nExpected: ...${expectedPreview}...`;
    }
  }

  return `Output length mismatch: Got ${normalizedActual.length}, Expected ${normalizedExpected.length}`;
};

/**
 * Strict comparison without normalization
 */
export const compareOutputsStrict = (actual: string, expected: string): boolean => {
  return actual === expected;
};

/**
 * Normalize output across multiple lines (for multi-line outputs)
 */
export const normalizeMultilineOutput = (output: string): string[] => {
  return output
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

/**
 * Compare multi-line outputs
 */
export const compareMultilineOutputs = (
  actual: string,
  expected: string
): boolean => {
  const actualLines = normalizeMultilineOutput(actual);
  const expectedLines = normalizeMultilineOutput(expected);

  if (actualLines.length !== expectedLines.length) {
    return false;
  }

  return actualLines.every((line, idx) => line === expectedLines[idx]);
};
