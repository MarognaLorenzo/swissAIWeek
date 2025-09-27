import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const weatherApiKey = process.env.WEATHER_KEY || "3ad18473c0d9465584512445252709";
const openaiApiKey = process.env.SWISS_AI_PLATFORM_API_KEY;

if (!openaiApiKey) {
  console.error('SWISS_AI_PLATFORM_API_KEY environment variable is not set');
  process.exit(1);
}

const client = new OpenAI({
  apiKey: openaiApiKey,
  baseURL: "https://api.swisscom.com/layer/swiss-ai-weeks/apertus-70b/v1"
});

export const getComprehensiveRecommendations = async (req, res) => {
  try {
    const { location, floodRisk, landslideRisk } = req.query;

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
    const current = weatherData.current;
    const forecastDay = weatherData.forecast?.forecastday?.[0];
    const day = forecastDay?.day;

    // Create comprehensive context for recommendations
    const contextData = {
      location: `${weatherData.location.name}, ${weatherData.location.country}`,
      weather: {
        condition: current.condition.text,
        temperature: current.temp_c,
        feelsLike: current.feelslike_c,
        humidity: current.humidity,
        windSpeed: current.wind_kph,
        precipitation: current.precip_mm,
        visibility: current.vis_km,
        uvIndex: current.uv,
        isNight: current.is_day === 0
      },
      forecast: day ? {
        maxTemp: day.maxtemp_c,
        minTemp: day.mintemp_c,
        chanceOfRain: day.daily_chance_of_rain,
        condition: day.condition.text
      } : null,
      risks: {
        flood: parseFloat(floodRisk) || 0,
        landslide: parseFloat(landslideRisk) || 0
      },
      alerts: weatherData.alerts?.alert || []
    };

    const recommendationPrompt = `Based on the following conditions, provide comprehensive recommendations for items to bring when visiting this location:

Location: ${contextData.location}
Weather: ${contextData.weather.condition}, ${contextData.weather.temperature}°C (feels like ${contextData.weather.feelsLike}°C)
Humidity: ${contextData.weather.humidity}%, Wind: ${contextData.weather.windSpeed} km/h
Precipitation: ${contextData.weather.precipitation}mm, Visibility: ${contextData.weather.visibility}km
UV Index: ${contextData.weather.uvIndex}, Time: ${contextData.weather.isNight ? 'Night' : 'Day'}
${contextData.forecast ? `Today's forecast: ${contextData.forecast.minTemp}°C to ${contextData.forecast.maxTemp}°C, ${contextData.forecast.condition}, ${contextData.forecast.chanceOfRain}% chance of rain` : ''}
Flood Risk: ${contextData.risks.flood}/5.0, Landslide Risk: ${contextData.risks.landslide}/5.0
${contextData.alerts.length > 0 ? `Weather Alerts: ${contextData.alerts.map(a => a.headline).join(', ')}` : 'No active alerts'}

Please respond with ONLY a JSON object in this exact format:
{
  "analysis": "Brief analysis of conditions (2-3 sentences)",
  "recommendations": [
    {"item": "item name", "reason": "why this item is needed", "priority": "high|medium|low"},
    {"item": "another item", "reason": "explanation", "priority": "medium"}
  ]
}

Consider items like: torch/flashlight, waterproof jacket, umbrella, warm clothing, sunscreen, hat/cap, sturdy boots, first aid kit, emergency whistle, reflective vest, portable charger, water bottle, snacks, etc. Base priority on safety needs and weather severity.`;

    const completion = await client.chat.completions.create({
      model: "swiss-ai/Apertus-70B",
      messages: [
        {"role": "system", "content": "You are an expert outdoor safety advisor. Analyze weather and risk conditions to recommend essential items for safety and comfort. Always respond with valid JSON format only."},
        {"role": "user", "content": recommendationPrompt}
      ],
      stream: false
    });

    const aiResponse = completion.choices[0]?.message?.content || '';
    console.log("AI Recommendations Response:", aiResponse);

    // Parse AI response
    let recommendationsData = {};
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendationsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing recommendations:', parseError);
      // Fallback recommendations based on conditions
      recommendationsData = {
        analysis: "Weather and risk analysis unavailable, showing basic recommendations.",
        recommendations: [
          {"item": "torch", "reason": "general safety", "priority": "medium"},
          {"item": "first aid kit", "reason": "emergency preparedness", "priority": "high"},
          {"item": "water bottle", "reason": "stay hydrated", "priority": "medium"}
        ]
      };
    }

    const response = {
      timestamp: new Date().toISOString(),
      location: contextData.location,
      analysis: recommendationsData.analysis,
      recommendations: recommendationsData.recommendations || [],
      conditions: {
        weather: contextData.weather,
        forecast: contextData.forecast,
        risks: contextData.risks
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error in getComprehensiveRecommendations:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate recommendations: ' + error.message
    });
  }
};