
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if API keys are available
const weatherApiKey = process.env.WEATHER_KEY;
const openaiApiKey = process.env.SWISS_AI_PLATFORM_API_KEY;

if (!weatherApiKey) {
  console.error('WEATHER_KEY environment variable is not set');
  process.exit(1);
}

if (!openaiApiKey) {
  console.error('SWISS_AI_PLATFORM_API_KEY environment variable is not set');
  process.exit(1);
}

const client = new OpenAI({
  apiKey: openaiApiKey,
  baseURL: "https://api.swisscom.com/layer/swiss-ai-weeks/apertus-70b/v1"
});

// Function to convert weather data to LLM-friendly format
const formatWeatherForLLM = (weatherData) => {
  const { location, current, forecast } = weatherData;
  const forecastDay = forecast?.forecastday?.[0];
  const day = forecastDay?.day;
  const alerts = weatherData.alerts?.alert || [];

  // Create a comprehensive weather summary
  const weatherSummary = {
    location: {
      name: location.name,
      country: location.country,
      coordinates: `${location.lat}, ${location.lon}`,
      localTime: location.localtime,
      timezone: location.tz_id
    },
    current: {
      condition: current.condition.text,
      temperature: `${current.temp_c}°C (${current.temp_f}°F)`,
      feelsLike: `${current.feelslike_c}°C (${current.feelslike_f}°F)`,
      humidity: `${current.humidity}%`,
      windSpeed: `${current.wind_kph} km/h (${current.wind_mph} mph)`,
      windDirection: current.wind_dir,
      pressure: `${current.pressure_mb} mb`,
      visibility: `${current.vis_km} km`,
      cloudCover: `${current.cloud}%`,
      precipitation: `${current.precip_mm} mm`,
      uvIndex: current.uv
    },
    forecast: day ? {
      maxTemp: `${day.maxtemp_c}°C (${day.maxtemp_f}°F)`,
      minTemp: `${day.mintemp_c}°C (${day.mintemp_f}°F)`,
      condition: day.condition.text,
      chanceOfRain: `${day.daily_chance_of_rain}%`,
      totalPrecipitation: `${day.totalprecip_mm} mm`,
      maxWindSpeed: `${day.maxwind_kph} km/h`,
      avgHumidity: `${day.avghumidity}%`,
      uvIndex: day.uv
    } : null,
    alerts: alerts.map(alert => ({
      headline: alert.headline,
      severity: alert.severity,
      areas: alert.areas,
      category: alert.category
    }))
  };

  // Create natural language description for LLM
  const naturalLanguageDescription = 
    `Weather conditions for ${location.name}, ${location.country}: ` +
    `Currently ${current.condition.text.toLowerCase()} with ${current.temp_c}°C, feeling like ${current.feelslike_c}°C. ` +
    `Humidity at ${current.humidity}%, wind from ${current.wind_dir} at ${current.wind_kph} km/h. ` +
    `Atmospheric pressure is ${current.pressure_mb} mb with ${current.cloud}% cloud cover. ` +
    (current.precip_mm > 0 ? `Recent precipitation: ${current.precip_mm} mm. ` : '') +
    (day ? `Today's forecast: High ${day.maxtemp_c}°C, low ${day.mintemp_c}°C, ${day.condition.text.toLowerCase()}. ` +
           `Chance of rain: ${day.daily_chance_of_rain}%. ` : '') +
    (alerts.length > 0 ? `Weather alerts active: ${alerts.map(a => a.headline).join(', ')}. ` : 'No weather alerts active. ') +
    `Visibility: ${current.vis_km} km, UV index: ${current.uv}.`;

  return {
    structured: weatherSummary,
    naturalLanguage: naturalLanguageDescription
  };
};

// New endpoint to get only location name from coordinates (no LLM involved)
export const getLocationName = async (req, res) => {
  try {
    const {location} = req.query;
    console.log("\n\nGetting location name for coordinates: " + location + "\n\n");

    if (!location) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Location parameter is required'
      });
    }

    // Fetch weather data (we only need the location info)
    const weatherResponse = await fetch(`http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${encodeURIComponent(location)}&aqi=no`);
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    console.log("Location resolved:", weatherData.location?.name);

    // Return only the location information
    res.status(200).json({
      location: {
        name: weatherData.location.name,
        region: weatherData.location.region,
        country: weatherData.location.country,
        lat: weatherData.location.lat,
        lon: weatherData.location.lon,
        tz_id: weatherData.location.tz_id,
        localtime: weatherData.location.localtime
      }
    });
    
  } catch (error) {
    console.error('Error in getLocationName:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get location name: ' + error.message
    });
  }
};

export const getWeatherForecast = async (req, res) => {
  try {
    const {location} = req.query;
    console.log("\n\nLocation for weather: " + location+ "\n\n");

    if (!location) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Location parameter is required'
      });
    }

    // Fetch weather data
    const weatherResponse = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${encodeURIComponent(location)}&days=1&aqi=no&alerts=yes`);
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    console.log("Raw weather data received for:", weatherData.location?.name);

    // Convert to LLM-friendly format
    const formattedWeather = formatWeatherForLLM(weatherData);

    // Generate AI analysis of the weather data with recommendations
    const weatherPrompt = `Analyze the following weather conditions and risk data, then provide two things:

1. A brief weather analysis (2-3 sentences) highlighting important aspects for outdoor activities
2. A list of recommended items to bring based on the conditions

Weather data: ${formattedWeather.naturalLanguage}

Please format your response as JSON with this structure:
{
  "analysis": "Brief weather analysis text here",
  "recommendations": [
    {"item": "torch", "reason": "low visibility expected"},
    {"item": "waterproof jacket", "reason": "high chance of rain"},
    {"item": "warm clothing", "reason": "temperature below 10°C"}
  ]
}

Consider factors like temperature, precipitation, wind, visibility, UV index, and time of day. Recommend practical items like: torch/flashlight, waterproof clothing, warm layers, sun protection, sturdy footwear, umbrella, etc.`;

    const stream = await client.chat.completions.create({
      model: "swiss-ai/Apertus-70B",
      messages: [
        {"role": "system", "content": "You are a practical outdoor safety advisor. Analyze weather conditions and recommend specific items people should bring. Always respond with valid JSON format. Be concise but helpful."},
        {"role": "user", "content": weatherPrompt}
      ],
      stream: true
    });

    let aiResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        aiResponse += content;
      }
    }

    console.log("AI Response:", aiResponse);

    // Parse AI response to extract analysis and recommendations
    let analysisData = {};
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if JSON parsing fails
        analysisData = {
          analysis: aiResponse.trim(),
          recommendations: []
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      analysisData = {
        analysis: aiResponse.trim(),
        recommendations: []
      };
    }

    // Prepare response
    const response = {
      timestamp: new Date().toISOString(),
      description: analysisData.analysis || aiResponse.trim(),
      recommendations: analysisData.recommendations || [],
      weatherSummary: formattedWeather.naturalLanguage,
      structuredData: formattedWeather.structured
    };

    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error in getWeatherForecast:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process weather request: ' + error.message
    });
  }
};