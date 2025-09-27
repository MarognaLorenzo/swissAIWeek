import express from 'express';
import { getRiskAssessment } from '../controllers/riskControllerRisk.js';
import { getRiskSummary } from '../controllers/riskControllerSummary.js';
import { getWeatherForecast } from '../controllers/weather.js';
import { getComprehensiveRecommendations } from '../controllers/recommendations.js';
import { getChatResponse } from '../controllers/chat.js';

const router = express.Router();

// GET /api/risk/assessment?location=<location>
router.get('/assessment', getRiskAssessment);

router.get('/summarize', getRiskSummary);

router.get('/weather', getWeatherForecast);

router.post('/recommendations', getComprehensiveRecommendations);

router.post('/chat', getChatResponse);

export default router;