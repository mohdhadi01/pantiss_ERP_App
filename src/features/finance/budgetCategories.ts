export const budgetCategories = [
  'Personnel',
  'Programme activities',
  'Equipment & materials',
  'Travel & field operations',
  'Monitoring & evaluation',
  'Administration',
] as const;

export type BudgetCategory = (typeof budgetCategories)[number];

export const allocationShares: Record<BudgetCategory, number> = {
  Personnel: 0.24,
  'Programme activities': 0.31,
  'Equipment & materials': 0.18,
  'Travel & field operations': 0.11,
  'Monitoring & evaluation': 0.08,
  Administration: 0.08,
};
