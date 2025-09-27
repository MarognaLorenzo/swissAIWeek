import express from 'express';
import { getRiskAssessment } from '../controllers/riskControllerRisk.js';
import { getRiskSummary } from '../controllers/riskControllerSummary.js';
import { getWeatherForecast } from '../controllers/weather.js';

const router = express.Router();

// GET /api/risk/assessment?location=<location>
router.get('/assessment', getRiskAssessment);

router.get('/summarize', getRiskSummary);

router.get('/weather', getWeatherForecast)
export default router;