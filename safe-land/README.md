## Getting Started

0. Install npm

1. Install dependencies and start front end (folder `safe-land`):
```bash
npm install
npm run dev
```
2. In a different terminal, repeat the same inside the `safe-land/backend` folder
```bash
npm install
npm run dev
```

3. Generate a file `.env` inside the folder backend. You can rename the following and add the api keys:
```bash
# Swiss AI Platform API Configuration
SWISS_AI_PLATFORM_API_KEY=<keyForApertusAPI>

# Weather API Configuration - Leaving my key because it's a free trial account
WEATHER_KEY=3ad18473c0d9465584512445252709

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```


3. Open your browser and navigate to the local development URL (typically `http://localhost:5173`)

## Usage

1. Enter a location in the search bar (e.g., "Zurich", "Bern", "Geneva"). Alternatively, pick a location from the map
2. Insert your personal info
3. Click "Search" or press Enter
4. Enjoy the tutor!
