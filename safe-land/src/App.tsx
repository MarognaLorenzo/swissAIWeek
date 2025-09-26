import { useState } from 'react'
import './App.css'

interface RiskData {
  floodRisk: number;
  landslideRisk: number;
}

interface Description {
  description: string;
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState('')
  const [location, setLocation] = useState('')
  const [riskData, setRiskData] = useState<RiskData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [riskDescription, setRiskDescription] = useState<Description | null> (null)

  // API function to fetch risk data from backend
  const fetchRiskData = async (locationQuery: string): Promise<RiskData> => {
    setSelectedLocation(locationQuery)
    setLocation('')
    
    try {

      const response_riskValues = await fetch(`http://localhost:3001/api/risk/assessment?location=${encodeURIComponent(locationQuery)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response_riskValues.ok) {
        throw new Error(`HTTP error! status: ${response_riskValues.status}`)
      }

      const risk_values = await response_riskValues.json()
      return risk_values
    } catch (error) {
      console.error('Error fetching risk_values:', error)
      throw new Error('Failed to fetch risk_values from server')
    }
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
      setRiskDescription(null)
      const response_summary = await fetch(`http://localhost:3001/api/risk/summarize?fr=${encodeURIComponent(data.floodRisk)}&lr=${encodeURIComponent(data.landslideRisk)}&location=${encodeURIComponent(location)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response_summary.ok) {
        throw new Error(`HTTP error! status: ${response_summary.status}`)
      }

      const description = await response_summary.json()
      setRiskDescription(description)

    } catch (err) {
      console.error('API Error:', err)
      if (err instanceof Error) {
        setError(`Error: ${err.message}. Make sure the backend server is running on port 3001.`)
      } else {
        setError('Failed to fetch risk data. Please make sure the backend server is running.')
      }
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
    if (value < 1.5) return '#38a169' // forest green
    if (value < 3) return '#d69e2e' // warm amber
    if (value < 4) return '#c05621' // warm orange-brown
    return '#c53030' // deep red
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
          <h2>Risk Assessment for {selectedLocation}</h2>
          
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
          {riskDescription && (
            <div className="description-section">
              <h3>Assessment Details</h3>
              <p className="description-text">
                {riskDescription.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
