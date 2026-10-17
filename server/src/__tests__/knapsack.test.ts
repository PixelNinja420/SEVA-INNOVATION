import { describe, it, expect } from 'vitest';
import { solveKnapsack } from '../optimization/knapsack.js';
import { KnapsackItem } from '../types/index.js';

describe('Knapsack Optimizer (0/1 Min-Cost Covering)', () => {
  it('should handle zero or negative target reduction', () => {
    const items: KnapsackItem[] = [
      { id: '1', consumerId: 'c1', flexibleLoadKw: 5.0, rewardCost: 50 },
      { id: '2', consumerId: 'c2', flexibleLoadKw: 3.0, rewardCost: 30 }
    ];

    const result = solveKnapsack(0, items);
    expect(result.isFeasible).toBe(true);
    expect(result.totalReductionKw).toBe(0);
    expect(result.totalCost).toBe(0);
    expect(result.selectedItems.length).toBe(0);

    const negResult = solveKnapsack(-5, items);
    expect(negResult.isFeasible).toBe(true);
    expect(negResult.selectedItems.length).toBe(0);
  });

  it('should handle empty items array', () => {
    const result = solveKnapsack(10, []);
    expect(result.isFeasible).toBe(false);
    expect(result.selectedItems.length).toBe(0);
    expect(result.totalReductionKw).toBe(0);
  });

  it('should detect infeasible target when total capacity is insufficient', () => {
    const items: KnapsackItem[] = [
      { id: '1', consumerId: 'c1', flexibleLoadKw: 2.0, rewardCost: 20 },
      { id: '2', consumerId: 'c2', flexibleLoadKw: 3.0, rewardCost: 35 }
    ];

    const result = solveKnapsack(10.0, items); // needs 10, only 5 available
    expect(result.isFeasible).toBe(false);
    expect(result.totalReductionKw).toBe(5.0);
  });

  it('should find optimal minimum-cost combination to satisfy target reduction', () => {
    // 3 consumers:
    // Item 1: 5.0 kW, cost $100 (ratio: 20/kW)
    // Item 2: 3.0 kW, cost $30  (ratio: 10/kW)
    // Item 3: 4.0 kW, cost $44  (ratio: 11/kW)
    // Target: 6.0 kW
    // Possible subsets >= 6 kW:
    // - (1, 2): 8.0 kW, cost 130
    // - (1, 3): 9.0 kW, cost 144
    // - (2, 3): 7.0 kW, cost 74  <- Optimal!
    // - (1, 2, 3): 12.0 kW, cost 174
    const items: KnapsackItem[] = [
      { id: 'item-1', consumerId: 'c1', flexibleLoadKw: 5.0, rewardCost: 100 },
      { id: 'item-2', consumerId: 'c2', flexibleLoadKw: 3.0, rewardCost: 30 },
      { id: 'item-3', consumerId: 'c3', flexibleLoadKw: 4.0, rewardCost: 44 }
    ];

    const result = solveKnapsack(6.0, items);
    expect(result.isFeasible).toBe(true);
    expect(result.totalCost).toBe(74);
    expect(result.totalReductionKw).toBe(7.0);
    expect(result.selectedItems.map(i => i.id).sort()).toEqual(['item-2', 'item-3']);
  });

  it('should pick single smaller item if it exactly matches or satisfies target at lower cost', () => {
    const items: KnapsackItem[] = [
      { id: 'item-large', consumerId: 'c1', flexibleLoadKw: 10.0, rewardCost: 150 },
      { id: 'item-cheap', consumerId: 'c2', flexibleLoadKw: 2.0, rewardCost: 15 }
    ];

    const result = solveKnapsack(2.0, items);
    expect(result.isFeasible).toBe(true);
    expect(result.selectedItems.length).toBe(1);
    expect(result.selectedItems[0].id).toBe('item-cheap');
    expect(result.totalCost).toBe(15);
  });
});
