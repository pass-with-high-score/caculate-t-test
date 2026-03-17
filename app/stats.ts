import jstat from 'jstat';

export interface DescriptiveStats {
  n: number;
  mean: number;
  median: number;
  mode: number | number[]; // Can be multiple modes
  stdDev: number;
}

export interface InferentialStats {
  tStat: number;
  df: number;
  pValueOneTailed: number;
  pValueTwoTailed: number;
}

export interface AnalysisResult {
  controlStats: DescriptiveStats;
  experimentalStats: DescriptiveStats;
  inferentialStats: InferentialStats;
}

// Custom mode function since jstat doesn't have a robust one for arrays of numbers natively
// returns an array of the most frequent values, or a single value if there's only one mode
function calculateMode(arr: number[]): number | number[] {
  if (arr.length === 0) return NaN;
  const counts = new Map<number, number>();
  let maxCount = 0;

  for (const num of arr) {
    const count = (counts.get(num) || 0) + 1;
    counts.set(num, count);
    if (count > maxCount) {
      maxCount = count;
    }
  }

  const modes: number[] = [];
  for (const [num, count] of counts.entries()) {
    if (count === maxCount) {
      modes.push(num);
    }
  }

  return modes.length === 1 ? modes[0] : modes;
}

// Calculate descriptive statistics for a single group
function calculateDescriptiveStats(scores: number[]): DescriptiveStats {
  if (scores.length === 0) {
    return {
      n: 0,
      mean: NaN,
      median: NaN,
      mode: NaN,
      stdDev: NaN,
    };
  }

  // Sample standard deviation (ddof=1)
  // jstat.stdev(arr, true) computes the sample standard deviation
  return {
    n: scores.length,
    mean: jstat.mean(scores),
    median: jstat.median(scores),
    mode: calculateMode(scores),
    stdDev: jstat.stdev(scores, true),
  };
}

/**
 * Calculates Descriptive and Inferential Statistics for two independent samples.
 * Uses Welch's t-test for unequal variances.
 */
export function calculateStats(controlScores: number[], experimentalScores: number[]): AnalysisResult {
  const controlStats = calculateDescriptiveStats(controlScores);
  const experimentalStats = calculateDescriptiveStats(experimentalScores);

  let n1 = controlStats.n;
  let n2 = experimentalStats.n;

  // Need at least 2 samples in each group for standard deviation and t-test
  if (n1 < 2 || n2 < 2) {
    return {
      controlStats,
      experimentalStats,
      inferentialStats: {
        tStat: NaN,
        df: NaN,
        pValueOneTailed: NaN,
        pValueTwoTailed: NaN,
      }
    };
  }

  let var1 = Math.pow(controlStats.stdDev, 2);
  let var2 = Math.pow(experimentalStats.stdDev, 2);

  let mean1 = controlStats.mean;
  let mean2 = experimentalStats.mean;

  // Welch's t-statistic
  let tStat = (mean1 - mean2) / Math.sqrt((var1 / n1) + (var2 / n2));

  // Welch-Satterthwaite equation for degrees of freedom
  let dfNumerator = Math.pow((var1 / n1) + (var2 / n2), 2);
  let dfDenominator = (Math.pow(var1 / n1, 2) / (n1 - 1)) + (Math.pow(var2 / n2, 2) / (n2 - 1));
  let df = dfNumerator / dfDenominator;

  // For p-value, we need the cumulative distribution function (CDF) of the t-distribution
  // jstat.studentt.cdf(x, dof) gives the area to the left of x
  // We take the absolute value of tStat to easily get the tail areas
  let absT = Math.abs(tStat);
  
  // 1-tailed p-value (area in one tail)
  let pValueOneTailed = 1 - jstat.studentt.cdf(absT, df);
  
  // 2-tailed p-value (area in both tails)
  let pValueTwoTailed = pValueOneTailed * 2;

  return {
    controlStats,
    experimentalStats,
    inferentialStats: {
      tStat,
      df,
      pValueOneTailed,
      pValueTwoTailed,
    }
  };
}
