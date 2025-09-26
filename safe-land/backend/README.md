# SafeLand Backend API

A simple Express.js backend API for the SafeLand risk assessment application.

## Features

- 🚀 Express.js server with modern ES6+ modules
- 🛡️ Security middleware (Helmet, CORS)
- 📊 Risk assessment API endpoints
- 🗄️ Mock data for Swiss and international locations
- 🔧 Development tools (Nodemon)
- 🌍 Environment configuration

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and health information.

### Risk Assessment
```
GET /api/risk/assessment?location=<location>
```
Returns flood and landslide risk data for the specified location.

**Query Parameters:**
- `location` (required): The location to assess (e.g., "Zurich", "Bern")

**Response Format:**
```json
{
  "location": "Zurich",
  "timestamp": "2025-09-26T10:30:00.000Z",
  "floodRisk": 3.2,
  "landslideRisk": 1.8,
  "description": "Risk assessment description...",
  "coordinates": {
    "lat": 47.3769,
    "lon": 8.5417
  },
  "lastUpdated": "2025-09-25",
  "source": "SafeLand Risk Database"
}
```

## Quick Start

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```
Edit `.env` file and add your Swiss AI Platform API key:
```
SWISS_AI_PLATFORM_API_KEY=your_actual_api_key_here
```

3. **Start development server:**
```bash
npm run dev
```

4. **Test the API:**
```bash
# Health check
curl http://localhost:3001/health

# Risk assessment
curl "http://localhost:3001/api/risk/assessment?location=Zurich"
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (placeholder)

## Project Structure

```
backend/
├── controllers/          # Request handlers
│   └── riskController.js
├── data/                 # Mock data and constants
│   └── riskData.js
├── routes/               # API routes
│   └── risk.js
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js             # Main server file
```

## Supported Locations

The API has detailed risk data for these locations:
- **Swiss Cities**: Zurich, Bern, Geneva, Basel, Lausanne, Lucerne, Winterthur, St. Gallen
- **International**: Paris, London

For other locations, the API generates dynamic risk assessments based on location characteristics.

## Risk Scale

- **0.0 - 1.4**: Low Risk
- **1.5 - 2.9**: Moderate Risk  
- **3.0 - 3.9**: High Risk
- **4.0 - 5.0**: Very High Risk

## Environment Variables

Key environment variables (see `.env.example`):

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `SWISS_AI_PLATFORM_API_KEY` - API key for Swiss AI Platform (required for AI-generated risk summaries)

## Development Notes

- Uses ES6 modules (`"type": "module"` in package.json)
- CORS configured for frontend integration
- Morgan logging for request monitoring
- Helmet for security headers
- Simulated API delays for realistic testing

## Future Enhancements

- Database integration
- Authentication/authorization
- Real geological data integration
- Caching with Redis
- Rate limiting
- API versioning
- Unit tests
- Docker containerization

## Integration with Frontend

Update your frontend's `fetchRiskData` function to use the real API:

```javascript
const fetchRiskData = async (locationQuery) => {
  const response = await fetch(`http://localhost:3001/api/risk/assessment?location=${encodeURIComponent(locationQuery)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch risk data');
  }
  return await response.json();
};
```