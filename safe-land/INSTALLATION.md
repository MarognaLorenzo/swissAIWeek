# 🏔️ TheSwissHiker - Installation Guide

A comprehensive hiking preparation app for Switzerland with AI-powered recommendations, interactive maps, and real-time weather analysis.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

### API Keys Required
You'll need to obtain the following API keys:

1. **Swiss AI Platform API Key**
   - Contact Swisscom for access to the Swiss AI Platform
   - Used for AI-powered recommendations and chat assistance

2. **Weather API Key**
   - Sign up at [WeatherAPI.com](https://www.weatherapi.com/)
   - Free tier available (up to 1M requests/month)
   - Used for real-time weather data and location resolution

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/MarognaLorenzo/swissAiWeek.git
cd swissAiWeek/safe-land
```

### 2. Install Frontend Dependencies

```bash
# Install frontend packages
npm install

# If you need the Leaflet mapping library (for interactive maps)
npm install leaflet @types/leaflet
```

### 3. Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install backend packages
npm install

# Go back to root directory
cd ..
```

### 4. Configure Environment Variables

#### Backend Configuration
Navigate to the `backend` directory and ensure the `.env` file exists with the following configuration:

```bash
cd backend
```

Create or verify your `.env` file contains:

```env
# Swiss AI Platform API Configuration
SWISS_AI_PLATFORM_API_KEY=your_swiss_ai_platform_api_key_here

# Weather API Configuration  
WEATHER_KEY=your_weather_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

**⚠️ Important:** Replace the placeholder values with your actual API keys:
- Replace `your_swiss_ai_platform_api_key_here` with your Swiss AI Platform API key
- Replace `your_weather_api_key_here` with your WeatherAPI.com API key

### 5. Verify Project Structure

Your project should have the following structure:

```
safe-land/
├── src/                    # Frontend React source code
│   ├── App.tsx            # Main application component
│   ├── App.css            # Styling
│   ├── MapComponent.tsx   # Interactive map component
│   └── MapComponent.css   # Map styling
├── backend/               # Backend Node.js server
│   ├── server.js          # Main server file
│   ├── .env              # Environment variables (DO NOT commit)
│   ├── controllers/       # API controllers
│   │   ├── weather.js     # Weather API handler
│   │   ├── chat.js        # AI chat handler
│   │   ├── recommendations.js # AI recommendations
│   │   └── ...
│   └── routes/            # API routes
├── public/                # Static assets
├── package.json           # Frontend dependencies
└── README.md
```

## 🏃‍♂️ Running the Application

### Start the Backend Server

Open a terminal and navigate to the backend directory:

```bash
cd backend

# Start the development server with auto-reload
npm run dev

# OR start the production server
npm start
```

The backend server will start on `http://localhost:3001`

### Start the Frontend Development Server

Open a **new terminal** and navigate to the root directory:

```bash
# Make sure you're in the root directory (safe-land/)
npm run dev
```

The frontend will start on `http://localhost:5173`

### Access the Application

Open your web browser and navigate to:
```
http://localhost:5173
```

## 🧪 Testing the Installation

### 1. Backend Health Check
Visit `http://localhost:3001` - you should see a basic response from the server.

### 2. Frontend Features Test
- **Search functionality**: Try entering a Swiss location (e.g., "Zermatt")
- **Interactive map**: Click on the map to select coordinates
- **Weather data**: Verify weather information loads
- **AI recommendations**: Check that packing suggestions appear
- **Chat assistant**: Test the AI-powered hiking advice chat

## 🔧 Troubleshooting

### Common Issues

#### Backend won't start
- **Check Node.js version**: Ensure you have Node.js v18+
- **Verify environment variables**: Make sure your `.env` file exists in the `backend/` directory
- **Check API keys**: Ensure your API keys are valid and properly set
- **Port conflicts**: If port 3001 is in use, change the `PORT` in `.env`

#### Frontend build errors
- **Clear node_modules**: `rm -rf node_modules package-lock.json && npm install`
- **TypeScript errors**: Run `npm run build` to see detailed TypeScript errors
- **Missing dependencies**: Run `npm install leaflet @types/leaflet` if map features don't work

#### API Connection Issues
- **CORS errors**: Verify the `FRONTEND_URL` in backend `.env` matches your frontend URL
- **Network issues**: Ensure both servers are running and accessible
- **Firewall**: Check if your firewall is blocking the ports

#### Map not loading
- **Missing dependencies**: Install Leaflet with `npm install leaflet @types/leaflet`
- **Internet connection**: The map requires internet connection for tiles

### Getting Help

If you encounter issues:

1. **Check the browser console** for error messages
2. **Check the backend terminal** for server errors
3. **Verify your API keys** are correct and active
4. **Ensure all dependencies** are installed correctly

## 🌍 Environment-Specific Notes

### Development
- Frontend auto-reloads on changes
- Backend auto-reloads with nodemon
- Detailed error logging enabled

### Production Deployment
- Build the frontend: `npm run build`
- Set `NODE_ENV=production` in backend `.env`
- Use a process manager like PM2 for the backend
- Serve frontend build files through a web server (nginx, Apache)

## 📦 Optional Enhancements

### Additional Map Features
If you want enhanced mapping capabilities:

```bash
# Install additional mapping libraries
npm install react-leaflet
npm install @types/leaflet
```

### Development Tools
For enhanced development experience:

```bash
# Backend hot-reload (already included)
cd backend && npm install -g nodemon

# Frontend development tools
npm install -g @vitejs/plugin-react
```

## ✅ Installation Complete!

Your TheSwissHiker application should now be running with:
- 🗺️ Interactive map for location selection
- 🌤️ Real-time weather analysis
- 🎒 AI-powered packing recommendations  
- 💬 Intelligent hiking assistant chat
- 🏔️ Risk assessment for Swiss locations

Enjoy your Swiss hiking adventures! 🇨🇭⛰️