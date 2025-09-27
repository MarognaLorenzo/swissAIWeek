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

export const getChatResponse = async (req, res) => {
  try {
    const { location, question, floodRisk, landslideRisk } = req.body;

    if (!location || !question) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Location and question parameters are required'
      });
    }

    // Fetch current weather data for context
    const weatherResponse = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${encodeURIComponent(location)}&days=1&aqi=no&alerts=yes`);
    
    let weatherContext = "Weather data unavailable";
    if (weatherResponse.ok) {
      const weatherData = await weatherResponse.json();
      const current = weatherData.current;
      const forecast = weatherData.forecast?.forecastday?.[0];
      const day = forecast?.day;
      
      weatherContext = `Current weather in ${weatherData.location.name}: ${current.condition.text}, ${current.temp_c}°C (feels like ${current.feelslike_c}°C), ` +
        `humidity ${current.humidity}%, wind ${current.wind_kph} km/h from ${current.wind_dir}, ` +
        `${current.precip_mm}mm precipitation, visibility ${current.vis_km}km, UV index ${current.uv}. ` +
        (day ? `Today's forecast: ${day.mintemp_c}°C to ${day.maxtemp_c}°C, ${day.condition.text}, ${day.daily_chance_of_rain}% chance of rain. ` : '');
    }

    // Create comprehensive context for the AI
    const contextPrompt = `You are a helpful outdoor safety and travel assistant. A user is asking about preparations for visiting ${location}. 

CURRENT CONDITIONS:
${weatherContext}
Flood Risk: ${floodRisk || 'Unknown'}/5.0
Landslide Risk: ${landslideRisk || 'Unknown'}/5.0

USER QUESTION: ${question}

Please provide a helpful, practical response considering the weather conditions and risk levels. Be specific about clothing, gear, safety precautions, or activities as relevant to their question. Keep your response conversational, friendly, and under 200 words.`;

    const completion = await client.chat.completions.create({
      model: "swiss-ai/Apertus-70B",
      messages: [
        {
          "role": "system", 
          "content": "You are a knowledgeable outdoor safety advisor and travel expert. Provide practical, safety-focused advice based on weather conditions and risk assessments. Be friendly, concise, and helpful. Always prioritize user safety while being encouraging about their trip planning."
        },
        {
          "role": "user", 
          "content": contextPrompt
        }
      ],
      stream: false,
      max_tokens: 300
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response at this time.';

    const response = {
      timestamp: new Date().toISOString(),
      question: question,
      answer: aiResponse.trim(),
      location: location,
      context: {
        weather: weatherContext,
        risks: {
          flood: floodRisk || 'Unknown',
          landslide: landslideRisk || 'Unknown'
        }
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error in getChatResponse:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process chat request: ' + error.message
    });
  }
};