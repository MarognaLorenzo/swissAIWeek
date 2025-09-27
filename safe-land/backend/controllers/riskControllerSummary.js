
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if API key is available
const apiKey = process.env.SWISS_AI_PLATFORM_API_KEY;

if (!apiKey) {
  console.error('SWISS_AI_PLATFORM_API_KEY environment variable is not set');
  process.exit(1);
}

const client = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.swisscom.com/layer/swiss-ai-weeks/apertus-70b/v1"
});

export const getRiskSummary = async (req, res) => {
  try {
    const {location} = req.query
    console.log("location desc: " + location)
    const {fr} = req.query
    const {lr} = req.query
    console.log("fr: " + fr)
    console.log("lr: " + lr)

    // Generate AI description using Swiss AI Platform
    let prepare_desc = "";
    
    const stream = await client.chat.completions.create({
      model: "swiss-ai/Apertus-70B",
      messages: [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": generateRiskExplanation(location, fr, lr)}
      ],
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        prepare_desc += content;
      }
    }
    
    console.log("llm answer: " + prepare_desc)

    // Add metadata
    const response = {
      timestamp: new Date().toISOString(),
      // description: "Situation in " + location + " is very weird with value for flood " + fr + " and value " + lr + " for landslides."
      description: prepare_desc.trim()
    };

    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error in getRiskAssessment:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process risk assessment'
    });
  }
};


const system_prompt = "You need to create a description in a webpage that explains why in a certain location that it will be given to you by the user there are certain values for flood risk and landscape. You can use your geographic knowledge of the location. As your answer will be fed directly in the webpage, please be extremely compact with your answer, while keeping a friendly tone. Your answer really shouldn't go over two sentences"
const generateRiskExplanation = (location, fr, lr) => {
  return `Provide a brief explanation (3-4 lines) about the situation in ${location}. Justify why the flood risk is rated as ${fr} and the landslide risk is rated as ${lr}.`;
};