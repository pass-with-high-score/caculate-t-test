/**
 * Utility to parse score data from various messy formats, especially those pasted from Word or Excel.
 * 
 * Test cases (Jest-style):
 * 
 * describe('parseScores', () => {
 *   it('should parse messy string with "/ 10" stuck to numbers', () => {
 *     const input = '6 / 104 / 104 / 105 / 102 / 10';
 *     const result = parseScores(input);
 *     expect(result).toEqual([6, 4, 4, 5, 2]);
 *   });
 * 
 *   it('should parse standard comma-separated values', () => {
 *     const input = '6, 4, 5, 2';
 *     const result = parseScores(input);
 *     expect(result).toEqual([6, 4, 5, 2]);
 *   });
 * 
 *   it('should parse space-separated values', () => {
 *     const input = '6 4 5 2';
 *     const result = parseScores(input);
 *     expect(result).toEqual([6, 4, 5, 2]);
 *   });
 * 
 *   it('should parse newline-separated values', () => {
 *     const input = `6
 * 4
 * 5
 * 2`;
 *     const result = parseScores(input);
 *     expect(result).toEqual([6, 4, 5, 2]);
 *   });
 * 
 *   it('should filter out invalid strings and NaN', () => {
 *     const input = '6, 4, abc, 5, 2, , ';
 *     const result = parseScores(input);
 *     expect(result).toEqual([6, 4, 5, 2]);
 *   });
 * });
 */
export function parseScores(input: string): number[] {
  if (!input || input.trim() === '') return [];

  // Replace occurrences of "/ 10", "/10", or similar fractional denominators with a space.
  // This turns something like '6 / 104' into '6 4', safely segregating the numbers.
  const cleanedInput = input.replace(/\s*\/\s*10\s*/g, ' ');

  // Split by any white space, commas, or semicolons
  const parts = cleanedInput.split(/[\s,;]+/);

  const scores = parts
    .map((p) => p.trim())
    .filter((p) => p !== '')
    .map((p) => Number(p))
    .filter((n) => !isNaN(n));

  return scores;
}
