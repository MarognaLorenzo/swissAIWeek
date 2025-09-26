import { riskData } from '../data/riskData.js';

// Simulate processing delay (like real API calls)
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// GET /api/risk/assessment?location=<location>
export const getRiskAssessment = async (req, res) => {
  try {
    const { location } = req.query;
    console.log("location: " + location);
    

    if (!location) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Location parameter is required'
      });
    }

    // Simulate API processing time
    await simulateDelay(800);

    const locationKey = location.toLowerCase().trim();
    
    // Check if we have specific data for this location
    let assessment = riskData[locationKey];
    
    if (!assessment) {
      // Generate dynamic risk assessment for unknown locations
      assessment = generateDynamicAssessment(location);
    }

    // Add metadata
    const response = {
      location: location,
      timestamp: new Date().toISOString(),
      ...assessment,
      source: assessment.source || 'SafeLand Risk Database'
    };

    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error in getRiskAssessment:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process risk assessment'
    });
  }
};

// Generate dynamic risk assessment for locations not in our database
const generateDynamicAssessment = (location) => {
  // Simple algorithm to generate somewhat realistic risk values
  const locationHash = location.toLowerCase().split('').reduce((hash, char) => {
    return hash + char.charCodeAt(0);
  }, 0);
  
  // Use location name to seed "random" but consistent values
  const floodSeed = (locationHash * 7) % 100;
  const landslideSeed = (locationHash * 13) % 100;
  
  // Convert to risk scale (0-5) with some logic
  const floodRisk = Math.min(5, (floodSeed / 20) + Math.random() * 1);
  const landslideRisk = Math.min(5, (landslideSeed / 20) + Math.random() * 1);
  
  return {
    floodRisk: Math.round(floodRisk * 10) / 10,
    landslideRisk: Math.round(landslideRisk * 10) / 10,
    description: `Risk assessment for ${location}: Based on geographical analysis and available data, this location shows ${getRiskDescription(floodRisk)} flood risk and ${getRiskDescription(landslideRisk)} landslide risk. Consider local topography, water proximity, and soil composition for detailed evaluation.`,
    source: 'SafeLand Dynamic Assessment'
  };
};

// Helper function to get risk description
const getRiskDescription = (riskValue) => {
  if (riskValue < 1.5) return 'low';
  if (riskValue < 3) return 'moderate';
  if (riskValue < 4) return 'high';
  return 'very high';
};