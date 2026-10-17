import { KnapsackItem, KnapsackResult } from '../types/index.js';

/**
 * Solves the 0/1 Min-Cost Covering Knapsack problem using Dynamic Programming.
 * 
 * Objective: Minimize total reward cost
 * Subject to: Total load reduction >= targetReductionKw
 * Scale factor: 10 (0.1 kW precision)
 */
export function solveKnapsack(
  targetReductionKw: number,
  items: KnapsackItem[]
): KnapsackResult {
  // Edge Case 1: Target reduction <= 0
  if (targetReductionKw <= 0) {
    return {
      selectedItems: [],
      totalReductionKw: 0,
      totalCost: 0,
      targetReductionKw: 0,
      isFeasible: true,
      efficiencyRatio: 0
    };
  }

  // Edge Case 2: No items available
  if (!items || items.length === 0) {
    return {
      selectedItems: [],
      totalReductionKw: 0,
      totalCost: 0,
      targetReductionKw,
      isFeasible: false,
      efficiencyRatio: 0
    };
  }

  const SCALE = 10;
  const scaledTarget = Math.ceil(targetReductionKw * SCALE);

  // Filter out non-positive load items
  const validItems = items.filter(it => it.flexibleLoadKw > 0 && it.rewardCost >= 0);
  if (validItems.length === 0) {
    return {
      selectedItems: [],
      totalReductionKw: 0,
      totalCost: 0,
      targetReductionKw,
      isFeasible: false,
      efficiencyRatio: 0
    };
  }

  const n = validItems.length;
  const weights = validItems.map(it => Math.max(1, Math.round(it.flexibleLoadKw * SCALE)));
  const costs = validItems.map(it => it.rewardCost);

  const totalAvailableWeight = weights.reduce((acc, w) => acc + w, 0);

  // Infeasible if total flexible load cannot satisfy target
  if (totalAvailableWeight < scaledTarget) {
    const totalReduction = validItems.reduce((acc, it) => acc + it.flexibleLoadKw, 0);
    const totalCost = validItems.reduce((acc, it) => acc + it.rewardCost, 0);
    return {
      selectedItems: validItems,
      totalReductionKw: parseFloat(totalReduction.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      targetReductionKw,
      isFeasible: false,
      efficiencyRatio: totalReduction > 0 ? parseFloat((totalCost / totalReduction).toFixed(2)) : 0
    };
  }

  // DP table: dp[i][j] is the min cost using subset of first i items to get at least j weight
  // j ranges from 0 to scaledTarget
  const dp: number[][] = Array.from({ length: n + 1 }, () => 
    new Array(scaledTarget + 1).fill(Infinity)
  );

  // Base cases: 0 weight needed costs 0
  for (let i = 0; i <= n; i++) {
    dp[i][0] = 0;
  }

  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const c = costs[i - 1];

    for (let j = 1; j <= scaledTarget; j++) {
      // Option 1: Do not pick item i - 1
      const notPick = dp[i - 1][j];

      // Option 2: Pick item i - 1
      const prevWeightReq = Math.max(0, j - w);
      const pick = dp[i - 1][prevWeightReq] + c;

      dp[i][j] = Math.min(notPick, pick);
    }
  }

  const minCost = dp[n][scaledTarget];
  if (!Number.isFinite(minCost)) {
    return {
      selectedItems: [],
      totalReductionKw: 0,
      totalCost: 0,
      targetReductionKw,
      isFeasible: false,
      efficiencyRatio: 0
    };
  }

  // Backtracking to find selected items
  const selected: KnapsackItem[] = [];
  let currWeight = scaledTarget;

  for (let i = n; i >= 1; i--) {
    if (currWeight === 0) break;

    const w = weights[i - 1];
    const c = costs[i - 1];
    const prevWeightReq = Math.max(0, currWeight - w);

    // If picking item matches the optimal subproblem cost
    if (Math.abs(dp[i][currWeight] - (dp[i - 1][prevWeightReq] + c)) < 1e-6) {
      selected.push(validItems[i - 1]);
      currWeight = prevWeightReq;
    }
  }

  selected.reverse();

  const totalAchievedKw = selected.reduce((acc, it) => acc + it.flexibleLoadKw, 0);
  const actualCost = selected.reduce((acc, it) => acc + it.rewardCost, 0);

  return {
    selectedItems: selected,
    totalReductionKw: parseFloat(totalAchievedKw.toFixed(2)),
    totalCost: parseFloat(actualCost.toFixed(2)),
    targetReductionKw,
    isFeasible: true,
    efficiencyRatio: totalAchievedKw > 0 ? parseFloat((actualCost / totalAchievedKw).toFixed(2)) : 0
  };
}
