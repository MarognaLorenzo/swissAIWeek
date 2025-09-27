// Risk level classifications
export const riskLevels = {
  low: { min: 0, max: 1.4, color: '#4ade80' },
  moderate: { min: 1.5, max: 2.9, color: '#facc15' },
  high: { min: 3.0, max: 3.9, color: '#fb923c' },
  veryHigh: { min: 4.0, max: 5.0, color: '#f87171' }
};

// Helper function to get risk level from value
export const getRiskLevel = (value) => {
  if (value <= riskLevels.low.max) return 'Low';
  if (value <= riskLevels.moderate.max) return 'Moderate';
  if (value <= riskLevels.high.max) return 'High';
  return 'Very High';
};