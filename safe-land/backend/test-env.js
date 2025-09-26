import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Environment Variables Test:');
console.log('========================');
console.log('SWISS_AI_PLATFORM_API_KEY:', process.env.SWISS_AI_PLATFORM_API_KEY ? 'LOADED ✓' : 'NOT FOUND ✗');
console.log('PORT:', process.env.PORT || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');

if (!process.env.SWISS_AI_PLATFORM_API_KEY) {
  console.log('\n❌ API key not found. Make sure .env file exists and contains SWISS_AI_PLATFORM_API_KEY');
  process.exit(1);
} else {
  console.log('\n✅ All environment variables loaded successfully!');
}