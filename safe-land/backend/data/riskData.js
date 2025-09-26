// Risk assessment data for known locations
export const riskData = {
  'zurich': {
    floodRisk: 3.2,
    landslideRisk: 1.8,
    description: 'Zurich has moderate flood risk due to proximity to Lake Zurich and the Limmat River. The city has implemented comprehensive flood management systems, but climate change poses increasing challenges. Landslide risk is low due to stable urban terrain and well-maintained infrastructure.',
    coordinates: { lat: 47.3769, lon: 8.5417 },
    lastUpdated: '2025-09-25'
  },
  
  'bern': {
    floodRisk: 2.1,
    landslideRisk: 2.5,
    description: 'Bern shows low to moderate flood risk from the Aare River, with historical flood defenses providing good protection. Moderate landslide risk exists in surrounding hillside areas, particularly during heavy rainfall periods. The old town is well-protected but requires continued monitoring.',
    coordinates: { lat: 46.9480, lon: 7.4474 },
    lastUpdated: '2025-09-24'
  },
  
  'geneva': {
    floodRisk: 4.1,
    landslideRisk: 1.2,
    description: 'Geneva faces higher flood risk due to Lake Geneva and the Rhône River, especially during spring melts and heavy rainfall. The lake\'s water level regulation helps but cannot eliminate all risks. Landslide risk is minimal in the urban center due to stable geological conditions.',
    coordinates: { lat: 46.2044, lon: 6.1432 },
    lastUpdated: '2025-09-26'
  },
  
  'basel': {
    floodRisk: 3.8,
    landslideRisk: 1.5,
    description: 'Basel has elevated flood risk from the Rhine River, especially during heavy rainfall periods and spring snowmelt. The city has invested heavily in flood protection infrastructure. Landslide risk remains low due to the flat terrain in most urban areas.',
    coordinates: { lat: 47.5596, lon: 7.5886 },
    lastUpdated: '2025-09-23'
  },
  
  'lausanne': {
    floodRisk: 2.3,
    landslideRisk: 3.1,
    description: 'Lausanne shows moderate flood risk primarily from local streams and Lake Geneva proximity. Higher landslide risk exists due to the city\'s hillside location and varying soil stability. Historical landslides have been recorded in certain districts.',
    coordinates: { lat: 46.5197, lon: 6.6323 },
    lastUpdated: '2025-09-22'
  },
  
  'lucerne': {
    floodRisk: 2.8,
    landslideRisk: 2.2,
    description: 'Lucerne faces moderate flood risk from Lake Lucerne and the Reuss River. The lake\'s natural regulation provides some protection, but extreme weather events pose risks. Moderate landslide risk in surrounding areas, particularly in districts near the mountains.',
    coordinates: { lat: 47.0502, lon: 8.3093 },
    lastUpdated: '2025-09-21'
  },
  
  'winterthur': {
    floodRisk: 2.5,
    landslideRisk: 1.7,
    description: 'Winterthur has moderate flood risk from local rivers and streams. The city\'s flood management has improved significantly in recent years. Low landslide risk due to relatively stable terrain, though some hillside areas require monitoring.',
    coordinates: { lat: 47.4979, lon: 8.7242 },
    lastUpdated: '2025-09-20'
  },
  
  'st. gallen': {
    floodRisk: 1.9,
    landslideRisk: 2.8,
    description: 'St. Gallen shows low flood risk due to its elevated position and good drainage systems. However, higher landslide risk exists due to the hilly terrain and geological composition. Some areas have experienced slope instability during extreme weather.',
    coordinates: { lat: 47.4245, lon: 9.3767 },
    lastUpdated: '2025-09-19'
  },
  
  // International examples for testing
  'paris': {
    floodRisk: 3.5,
    landslideRisk: 1.1,
    description: 'Paris faces significant flood risk from the Seine River, with historical floods causing major damage. The city has extensive flood defenses, but climate change poses ongoing challenges. Landslide risk is minimal due to relatively stable terrain.',
    coordinates: { lat: 48.8566, lon: 2.3522 },
    lastUpdated: '2025-09-18'
  },
  
  'london': {
    floodRisk: 3.9,
    landslideRisk: 0.8,
    description: 'London has high flood risk from the Thames River and increasing coastal flood risks. The Thames Barrier provides significant protection, but sea level rise poses long-term challenges. Landslide risk is very low due to stable geological conditions.',
    coordinates: { lat: 51.5074, lon: -0.1278 },
    lastUpdated: '2025-09-17'
  }
};

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