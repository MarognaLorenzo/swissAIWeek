import { useState } from 'react'
import './App.css'

interface RiskData {
  floodRisk: number;
  landslideRisk: number;
}

interface Description {
  description: string;
}

interface Recommendation {
  item: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecommendationsData {
  analysis: string;
  recommendations: Recommendation[];
  location: string;
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState('')
  const [location, setLocation] = useState('')
  const [riskData, setRiskData] = useState<RiskData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [riskDescription, setRiskDescription] = useState<Description | null>(null)
  const [weather, setWeather] = useState('')
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  
  // Collapsible sections state
  const [sectionsOpen, setSectionsOpen] = useState({
    riskAssessment: true,
    weatherAnalysis: false,
    recommendations: false,
    assessmentDetails: false
  })

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

      const response_weather = await fetch(`http://localhost:3001/api/risk/weather?location=${encodeURIComponent(location)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response_weather.ok) {
        throw new Error(`HTTP error! status: ${response_weather.status}`)
      }

      const weath = await response_weather.json()
      setWeather(weath.description)

      // Fetch recommendations based on weather and risk data
      const response_recommendations = await fetch(`http://localhost:3001/api/risk/recommendations?location=${encodeURIComponent(location)}&floodRisk=${encodeURIComponent(data.floodRisk)}&landslideRisk=${encodeURIComponent(data.landslideRisk)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response_recommendations.ok) {
        console.warn('Recommendations API error:', response_recommendations.status)
      } else {
        const recommendationsData = await response_recommendations.json()
        setRecommendations(recommendationsData)
        
        // Initialize checkbox states (all unchecked initially)
        const initialCheckedState: Record<string, boolean> = {}
        recommendationsData.recommendations.forEach((rec: Recommendation) => {
          initialCheckedState[rec.item] = false
        })
        setCheckedItems(initialCheckedState)
      }


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

  const handleCheckboxChange = (item: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }))
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#c53030' // red
      case 'medium': return '#d69e2e' // amber
      case 'low': return '#38a169' // green
      default: return '#4a5568' // gray
    }
  }

  const getPriorityIcon = (priority: string): string => {
    switch (priority) {
      case 'high': return '🚨'
      case 'medium': return '⚠️'
      case 'low': return 'ℹ️'
      default: return '📝'
    }
  }

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
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
          
          {/* Risk Assessment Cards - Always visible as main content */}
          <div className="collapsible-section">
            <button 
              className="section-header"
              onClick={() => toggleSection('riskAssessment')}
            >
              <span className="section-title">
                🏔️ Risk Assessment
              </span>
              <span className={`chevron ${sectionsOpen.riskAssessment ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`section-content ${sectionsOpen.riskAssessment ? 'open' : ''}`}>
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
            </div>
          </div>

          {/* Assessment Details Section */}
          {riskDescription && (
            <div className="collapsible-section">
              <button 
                className="section-header"
                onClick={() => toggleSection('assessmentDetails')}
              >
                <span className="section-title">
                  📋 Assessment Details
                </span>
                <span className={`chevron ${sectionsOpen.assessmentDetails ? 'open' : ''}`}>
                  ▼
                </span>
              </button>
              <div className={`section-content ${sectionsOpen.assessmentDetails ? 'open' : ''}`}>
                <div className="description-section">
                  <p className="description-text">
                    {riskDescription.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Weather Analysis Section */}
          {weather && (
            <div className="collapsible-section">
              <button 
                className="section-header"
                onClick={() => toggleSection('weatherAnalysis')}
              >
                <span className="section-title">
                  🌤️ Current Weather Analysis
                </span>
                <span className={`chevron ${sectionsOpen.weatherAnalysis ? 'open' : ''}`}>
                  ▼
                </span>
              </button>
              <div className={`section-content ${sectionsOpen.weatherAnalysis ? 'open' : ''}`}>
                <div className="weather-section-content">
                  <p className="weather-text">
                    {weather}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations Section */}
          {recommendations && (
            <div className="collapsible-section">
              <button 
                className="section-header"
                onClick={() => toggleSection('recommendations')}
              >
                <span className="section-title">
                  🎒 Recommended Items to Bring
                  <span className="item-count">
                    ({Object.values(checkedItems).filter(Boolean).length}/{recommendations.recommendations.length} packed)
                  </span>
                </span>
                <span className={`chevron ${sectionsOpen.recommendations ? 'open' : ''}`}>
                  ▼
                </span>
              </button>
              <div className={`section-content ${sectionsOpen.recommendations ? 'open' : ''}`}>
                <div className="recommendations-content">
                  <p className="recommendations-analysis">
                    {recommendations.analysis}
                  </p>
                  <div className="recommendations-grid">
                    {recommendations.recommendations.map((rec, index) => (
                      <div key={index} className={`recommendation-item priority-${rec.priority}`}>
                        <label className="recommendation-label">
                          <input
                            type="checkbox"
                            checked={checkedItems[rec.item] || false}
                            onChange={() => handleCheckboxChange(rec.item)}
                            className="recommendation-checkbox"
                          />
                          <span className="checkbox-custom"></span>
                          <div className="recommendation-content">
                            <div className="recommendation-header">
                              <span className="priority-icon">{getPriorityIcon(rec.priority)}</span>
                              <span className="item-name">{rec.item}</span>
                              <span className="priority-badge" style={{ backgroundColor: getPriorityColor(rec.priority) }}>
                                {rec.priority}
                              </span>
                            </div>
                            <p className="item-reason">{rec.reason}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="packing-summary">
                    <p>
                      Items packed: {Object.values(checkedItems).filter(Boolean).length} / {recommendations.recommendations.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
