import { useState } from 'react'
import './App.css'

interface RiskData {
  floodRisk: number;
  landslideRisk: number;
  description: string;
}

function App() {
  const [location, setLocation] = useState('')
  const [riskData, setRiskData] = useState<RiskData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock function to simulate backend API call
  const fetchRiskData = async (locationQuery: string): Promise<RiskData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data based on location - in real app, this would be an actual API call
    const mockResponses: Record<string, RiskData> = {
      'zurich': {
        floodRisk: 3.2,
        landslideRisk: 1.8,
        description: 'Zurich has moderate flood risk due to proximity to Lake Zurich and the Limmat River. Landslide risk is low due to stable urban terrain.'
      },
      'bern': {
        floodRisk: 2.1,
        landslideRisk: 2.5,
        description: 'Bern shows low to moderate flood risk from the Aare River. Moderate landslide risk exists in surrounding hillside areas.'
      },
      'geneva': {
        floodRisk: 4.1,
        landslideRisk: 1.2,
        description: 'Geneva faces higher flood risk due to Lake Geneva and the Rhône River. Landslide risk is minimal in the urban center.'
      },
      'basel': {
        floodRisk: 3.8,
        landslideRisk: 1.5,
        description: 'Basel has elevated flood risk from the Rhine River, especially during heavy rainfall periods. Landslide risk remains low.'
      }
    }

    const key = locationQuery.toLowerCase()
    const response = mockResponses[key] || {
      floodRisk: Math.random() * 5,
      landslideRisk: Math.random() * 5,
      description: `Risk assessment for ${locationQuery}: Based on geographical analysis, this location shows variable risk levels. Consider local topography and water proximity for detailed evaluation.`
    }

    return response
  }

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const data = await fetchRiskData(location)
      setRiskData(data)
    } catch (err) {
      setError('Failed to fetch risk data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getRiskLevel = (value: number): string => {
    if (value < 1.5) return 'Low'
    if (value < 3) return 'Moderate'
    if (value < 4) return 'High'
    return 'Very High'
  }

  const getRiskColor = (value: number): string => {
    if (value < 1.5) return '#4ade80' // green
    if (value < 3) return '#facc15' // yellow
    if (value < 4) return '#fb923c' // orange
    return '#f87171' // red
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>SafeLand Risk Assessment</h1>
        <p className="subtitle">Get flood and landslide risk information for any location</p>
      </header>

      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter location (e.g., Zurich, Bern, Geneva...)"
            className="search-input"
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="search-button"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {riskData && (
        <div className="results-section">
          <h2>Risk Assessment for {location}</h2>
          
          <div className="risk-cards">
            <div className="risk-card">
              <div className="risk-header">
                <h3>Flood Risk</h3>
                <div 
                  className="risk-value"
                  style={{ color: getRiskColor(riskData.floodRisk) }}
                >
                  {riskData.floodRisk.toFixed(1)}/5.0
                </div>
              </div>
              <div className="risk-level" style={{ color: getRiskColor(riskData.floodRisk) }}>
                {getRiskLevel(riskData.floodRisk)}
              </div>
            </div>

            <div className="risk-card">
              <div className="risk-header">
                <h3>Landslide Risk</h3>
                <div 
                  className="risk-value"
                  style={{ color: getRiskColor(riskData.landslideRisk) }}
                >
                  {riskData.landslideRisk.toFixed(1)}/5.0
                </div>
              </div>
              <div className="risk-level" style={{ color: getRiskColor(riskData.landslideRisk) }}>
                {getRiskLevel(riskData.landslideRisk)}
              </div>
            </div>
          </div>

          <div className="description-section">
            <h3>Assessment Details</h3>
            <p className="description-text">
              {riskData.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
