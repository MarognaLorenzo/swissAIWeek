// Test the weather data formatting
const sampleWeatherData = {
  location: {
    name: 'Bern',
    region: '',
    country: 'Switzerland',
    lat: 46.9167,
    lon: 7.4667,
    tz_id: 'Europe/Zurich',
    localtime_epoch: 1758940123,
    localtime: '2025-09-27 04:28'
  },
  current: {
    last_updated_epoch: 1758939300,
    last_updated: '2025-09-27 04:15',
    temp_c: 9.2,
    temp_f: 48.6,
    is_day: 0,
    condition: {
      text: 'Partly cloudy',
      icon: '//cdn.weatherapi.com/weather/64x64/night/116.png',
      code: 1003
    },
    wind_mph: 2.7,
    wind_kph: 4.3,
    wind_degree: 140,
    wind_dir: 'SE',
    pressure_mb: 1020,
    pressure_in: 30.12,
    precip_mm: 0.89,
    precip_in: 0.03,
    humidity: 100,
    cloud: 75,
    feelslike_c: 9.1,
    feelslike_f: 48.3,
    windchill_c: 6.9,
    windchill_f: 44.4,
    heatindex_c: 7.2,
    heatindex_f: 45,
    dewpoint_c: 6.8,
    dewpoint_f: 44.3,
    vis_km: 10,
    vis_miles: 6,
    uv: 0,
    gust_mph: 3.8,
    gust_kph: 6.2
  },
  forecast: { 
    forecastday: [{ 
      day: {
        maxtemp_c: 15.2,
        maxtemp_f: 59.4,
        mintemp_c: 8.1,
        mintemp_f: 46.6,
        condition: {
          text: 'Moderate rain'
        },
        daily_chance_of_rain: 85,
        totalprecip_mm: 12.3,
        maxwind_kph: 18.7,
        avghumidity: 88,
        uv: 2
      }
    }] 
  },
  alerts: { alert: [] }
};

// Function to convert weather data to LLM-friendly format (same as in controller)
const formatWeatherForLLM = (weatherData) => {
  const { location, current, forecast } = weatherData;
  const forecastDay = forecast?.forecastday?.[0];
  const day = forecastDay?.day;
  const alerts = weatherData.alerts?.alert || [];

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

  return naturalLanguageDescription;
};

console.log("=== LLM-Friendly Weather Format ===");
console.log(formatWeatherForLLM(sampleWeatherData));
console.log("\n=== This format is perfect for LLM processing because: ===");
console.log("✓ All data is in natural language");
console.log("✓ Units are clearly specified");
console.log("✓ Information flows logically");
console.log("✓ No complex nested objects");
console.log("✓ Ready for direct text analysis");