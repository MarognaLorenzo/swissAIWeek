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

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  answer: string;
  timestamp: string;
}

interface UserProfile {
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  age: number | '';
  gender: 'male' | 'female' | 'other' | '';
  weight: number | '';
  fitness: 'low' | 'moderate' | 'high' | 'very-high';
  hikeDifficulty: 'easy' | 'moderate' | 'difficult' | 'very-difficult';
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
    assessmentDetails: false,
    chat: false,
    userProfile: false
  })

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    experience: 'intermediate',
    age: '',
    gender: '',
    weight: '',
    fitness: 'moderate',
    hikeDifficulty: 'moderate'
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile: userProfile
        })
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

  const sendChatMessage = async () => {
    if (!currentQuestion.trim() || !riskData || !selectedLocation) {
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: currentQuestion,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentQuestion('')
    setChatLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/risk/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: selectedLocation,
          question: currentQuestion,
          floodRisk: riskData.floodRisk,
          landslideRisk: riskData.landslideRisk,
          userProfile: userProfile
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const chatResponse: ChatResponse = await response.json()
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '_assistant',
        type: 'assistant',
        content: chatResponse.answer,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setChatLoading(false)
    }
  }

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendChatMessage()
    }
  }

  const updateUserProfile = (field: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const createUserContextString = () => {
    const profileStrings = []
    
    if (userProfile.age) profileStrings.push(`${userProfile.age} years old`)
    if (userProfile.gender) profileStrings.push(`${userProfile.gender}`)
    if (userProfile.weight) profileStrings.push(`${userProfile.weight}kg`)
    profileStrings.push(`${userProfile.experience} hiking experience`)
    profileStrings.push(`${userProfile.fitness} fitness level`)
    profileStrings.push(`planning a ${userProfile.hikeDifficulty} difficulty hike`)
    
    return profileStrings.join(', ')
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
        <h1>🇨🇭TheSwissHiker🇨🇭</h1>
        <p className="subtitle">Get comprehensive hiking information for any location in Switzerland</p>
      </header>

      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter location (e.g., Zermatt, Interlaken, Grindelwald...)"
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

      {/* User Profile Section */}
      <div className="user-profile-section">
        <div className="profile-header">
          <h3>🧗‍♂️ Tell us about you!</h3>
          <p>Help us personalize your recommendations</p>
        </div>
        
        <div className="profile-grid">
          <div className="profile-field">
            <label>Hiking Experience</label>
            <select 
              value={userProfile.experience} 
              onChange={(e) => updateUserProfile('experience', e.target.value)}
              className="profile-select"
            >
              <option value="beginner">Beginner (0-2 years)</option>
              <option value="intermediate">Intermediate (2-5 years)</option>
              <option value="advanced">Advanced (5+ years)</option>
              <option value="expert">Expert (10+ years)</option>
            </select>
          </div>

          <div className="profile-field">
            <label>Age</label>
            <input 
              type="number" 
              value={userProfile.age} 
              onChange={(e) => updateUserProfile('age', e.target.value ? parseInt(e.target.value) : '')}
              placeholder="25"
              min="1"
              max="100"
              className="profile-input"
            />
          </div>

          <div className="profile-field">
            <label>Gender</label>
            <select 
              value={userProfile.gender} 
              onChange={(e) => updateUserProfile('gender', e.target.value)}
              className="profile-select"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="profile-field">
            <label>Weight (kg)</label>
            <input 
              type="number" 
              value={userProfile.weight} 
              onChange={(e) => updateUserProfile('weight', e.target.value ? parseInt(e.target.value) : '')}
              placeholder="70"
              min="1"
              max="300"
              className="profile-input"
            />
          </div>

          <div className="profile-field">
            <label>Fitness Level</label>
            <select 
              value={userProfile.fitness} 
              onChange={(e) => updateUserProfile('fitness', e.target.value)}
              className="profile-select"
            >
              <option value="low">Low - Occasional exercise</option>
              <option value="moderate">Moderate - Regular exercise</option>
              <option value="high">High - Very active</option>
              <option value="very-high">Very High - Athlete level</option>
            </select>
          </div>

          <div className="profile-field">
            <label>Planned Hike Difficulty</label>
            <select 
              value={userProfile.hikeDifficulty} 
              onChange={(e) => updateUserProfile('hikeDifficulty', e.target.value)}
              className="profile-select"
            >
              <option value="easy">Easy - Well-marked trails, gentle slopes</option>
              <option value="moderate">Moderate - Some steep sections, 4-6 hours</option>
              <option value="difficult">Difficult - Challenging terrain, 6-8 hours</option>
              <option value="very-difficult">Very Difficult - Expert level, 8+ hours</option>
            </select>
          </div>
        </div>
      </div>

      {(riskData || loading) && (
        <div className="results-section">
          <h2>
            {loading ? 'Analyzing conditions for...' : `Hiking Information for ${selectedLocation}`}
          </h2>
          
          {/* Risk Assessment Cards */}
          <div className="collapsible-section">
            <button 
              className="section-header"
              onClick={() => toggleSection('riskAssessment')}
              disabled={loading}
            >
              <span className="section-title">
                🏔️ Risk Assessment
              </span>
              <span className={`chevron ${sectionsOpen.riskAssessment ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`section-content ${sectionsOpen.riskAssessment ? 'open' : ''}`}>
              {loading ? (
                <div className="loading-content">
                  <div className="risk-cards">
                    <div className="risk-card loading">
                      <div className="risk-header">
                        <h3>Flood Risk</h3>
                        <div className="loading-placeholder risk-value">
                          <div className="shimmer"></div>
                        </div>
                      </div>
                      <div className="loading-placeholder risk-level">
                        <div className="shimmer"></div>
                      </div>
                    </div>

                    <div className="risk-card loading">
                      <div className="risk-header">
                        <h3>Landslide Risk</h3>
                        <div className="loading-placeholder risk-value">
                          <div className="shimmer"></div>
                        </div>
                      </div>
                      <div className="loading-placeholder risk-level">
                        <div className="shimmer"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="risk-cards">
                  <div className="risk-card">
                    <div className="risk-header">
                      <h3>Flood Risk</h3>
                      <div 
                        className="risk-value"
                        style={{ color: getRiskColor(riskData!.floodRisk) }}
                      >
                        {riskData!.floodRisk.toFixed(1)}/5.0
                      </div>
                    </div>
                    <div className="risk-level" style={{ color: getRiskColor(riskData!.floodRisk) }}>
                      {getRiskLevel(riskData!.floodRisk)}
                    </div>
                  </div>

                  <div className="risk-card">
                    <div className="risk-header">
                      <h3>Landslide Risk</h3>
                      <div 
                        className="risk-value"
                        style={{ color: getRiskColor(riskData!.landslideRisk) }}
                      >
                        {riskData!.landslideRisk.toFixed(1)}/5.0
                      </div>
                    </div>
                    <div className="risk-level" style={{ color: getRiskColor(riskData!.landslideRisk) }}>
                      {getRiskLevel(riskData!.landslideRisk)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assessment Details Section */}
          <div className="collapsible-section">
            <button 
              className="section-header"
              onClick={() => toggleSection('assessmentDetails')}
              disabled={loading}
            >
              <span className="section-title">
                📋 Assessment Details
              </span>
              <span className={`chevron ${sectionsOpen.assessmentDetails ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`section-content ${sectionsOpen.assessmentDetails ? 'open' : ''}`}>
              {loading ? (
                <div className="loading-content">
                  <div className="description-section loading">
                    <div className="loading-placeholder text-block">
                      <div className="shimmer"></div>
                    </div>
                    <div className="loading-placeholder text-block">
                      <div className="shimmer"></div>
                    </div>
                  </div>
                </div>
              ) : riskDescription ? (
                <div className="description-section">
                  <p className="description-text">
                    {riskDescription.description}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Weather Analysis Section */}
          <div className="collapsible-section">
            <button 
              className="section-header"
              onClick={() => toggleSection('weatherAnalysis')}
              disabled={loading}
            >
              <span className="section-title">
                🌤️ Current Weather Analysis
              </span>
              <span className={`chevron ${sectionsOpen.weatherAnalysis ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`section-content ${sectionsOpen.weatherAnalysis ? 'open' : ''}`}>
              {loading ? (
                <div className="loading-content">
                  <div className="weather-section-content loading">
                    <div className="loading-placeholder text-block">
                      <div className="shimmer"></div>
                    </div>
                    <div className="loading-placeholder text-block">
                      <div className="shimmer"></div>
                    </div>
                  </div>
                </div>
              ) : weather ? (
                <div className="weather-section-content">
                  <p className="weather-text">
                    {weather}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="collapsible-section">
            <button 
              className="section-header"
              onClick={() => toggleSection('recommendations')}
              disabled={loading}
            >
              <span className="section-title">
                🎒 Recommended Items to Bring
                {!loading && recommendations && (
                  <span className="item-count">
                    ({Object.values(checkedItems).filter(Boolean).length}/{recommendations.recommendations.length} packed)
                  </span>
                )}
                {loading && (
                  <span className="item-count">
                    (Analyzing your needs...)
                  </span>
                )}
              </span>
              <span className={`chevron ${sectionsOpen.recommendations ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`section-content ${sectionsOpen.recommendations ? 'open' : ''}`}>
              {loading ? (
                <div className="loading-content">
                  <div className="recommendations-content loading">
                    <div className="loading-placeholder text-block">
                      <div className="shimmer"></div>
                    </div>
                    <div className="recommendations-grid">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="recommendation-item loading">
                          <div className="loading-placeholder item-header">
                            <div className="shimmer"></div>
                          </div>
                          <div className="loading-placeholder item-reason">
                            <div className="shimmer"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : recommendations ? (
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
              ) : null}
            </div>
          </div>

          {/* Chat Assistant Section */}
          <div className="collapsible-section">
            <button 
              className="section-header"
              onClick={() => toggleSection('chat')}
              disabled={loading}
            >
              <span className="section-title">
                💬 Ask TheSwissHiker Assistant
                <span className="chat-subtitle">
                  Get personalized advice about clothing and preparations
                </span>
              </span>
              <span className={`chevron ${sectionsOpen.chat ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`section-content ${sectionsOpen.chat ? 'open' : ''}`}>
              <div className="chat-container">
                <div className="chat-messages">
                  {chatMessages.length === 0 && (
                    <div className="chat-welcome">
                      <p>👋 Hi! I'm your TheSwissHiker assistant. Ask me anything about:</p>
                      <ul>
                        <li>What clothing to wear for the current weather</li>
                        <li>Safety precautions for the risk levels</li>
                        <li>What gear to bring for specific activities</li>
                        <li>Hiking tips for the conditions</li>
                      </ul>
                    </div>
                  )}
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`chat-message ${message.type}`}>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-sender">
                            {message.type === 'user' ? '👤 You' : '🤖 TheSwissHiker Assistant'}
                          </span>
                          <span className="message-time">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="message-text">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="chat-message assistant">
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-sender">🤖 TheSwissHiker Assistant</span>
                        </div>
                        <div className="message-text typing">
                          <span className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </span>
                          Thinking...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="chat-input-container">
                  <div className="chat-input-wrapper">
                    <textarea
                      value={currentQuestion}
                      onChange={(e) => setCurrentQuestion(e.target.value)}
                      onKeyPress={handleChatKeyPress}
                      placeholder="Ask me about clothing, gear, safety tips..."
                      className="chat-input"
                      rows={2}
                      disabled={chatLoading}
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={!currentQuestion.trim() || chatLoading}
                      className="chat-send-button"
                    >
                      {chatLoading ? '...' : '📤'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
