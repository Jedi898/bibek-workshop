import { WeatherData, Location } from '@/types';

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.weatherapi.com/v1/forecast.json';

export class WeatherService {
  static async getForecast(location: Location, date: Date): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location.address)}&dt=${date.toISOString().split('T')[0]}`
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }
      
      const data = await response.json();
      
      // Get astronomy data for sunrise/sunset
      const astronomyResponse = await fetch(
        `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location.address)}&dt=${date.toISOString().split('T')[0]}&aqi=no&alerts=no`
      );
      
      const astronomyData = await astronomyResponse.json();
      
      const forecast = data.forecast?.forecastday?.[0];
      const astronomy = astronomyData.forecast?.forecastday?.[0]?.astro;
      
      return {
        date,
        locationId: location.id,
        temperature: forecast?.day?.avgtemp_c || 0,
        condition: forecast?.day?.condition?.text || 'Unknown',
        precipitation: forecast?.day?.daily_chance_of_rain || 0,
        humidity: forecast?.day?.avghumidity || 0,
        windSpeed: forecast?.day?.maxwind_kph || 0,
        sunrise: this.parseAstroTime(astronomy?.sunrise, date),
        sunset: this.parseAstroTime(astronomy?.sunset, date),
        goldenHourAM: this.calculateGoldenHour(this.parseAstroTime(astronomy?.sunrise, date), 'am'),
        goldenHourPM: this.calculateGoldenHour(this.parseAstroTime(astronomy?.sunset, date), 'pm')
      };
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      return this.getMockForecast(location, date);
    }
  }

  static async getWeeklyForecast(location: Location): Promise<WeatherData[]> {
    try {
      const response = await fetch(
        `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location.address)}&days=7`
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }
      
      const data = await response.json();
      const forecasts: WeatherData[] = [];
      
      for (const forecastDay of data.forecast?.forecastday || []) {
        const date = new Date(forecastDay.date);
        forecasts.push({
          date,
          locationId: location.id,
          temperature: forecastDay.day.avgtemp_c,
          condition: forecastDay.day.condition.text,
          precipitation: forecastDay.day.daily_chance_of_rain,
          humidity: forecastDay.day.avghumidity,
          windSpeed: forecastDay.day.maxwind_kph,
          sunrise: this.parseAstroTime(forecastDay.astro.sunrise, date),
          sunset: this.parseAstroTime(forecastDay.astro.sunset, date),
          goldenHourAM: this.calculateGoldenHour(this.parseAstroTime(forecastDay.astro.sunrise, date), 'am'),
          goldenHourPM: this.calculateGoldenHour(this.parseAstroTime(forecastDay.astro.sunset, date), 'pm')
        });
      }
      
      return forecasts;
    } catch (error) {
      console.error('Failed to fetch weekly forecast:', error);
      return this.getMockWeeklyForecast(location);
    }
  }

  static shouldRescheduleForWeather(weather: WeatherData, sceneRequirements: any): boolean {
    const { condition, precipitation, windSpeed } = weather;
    
    // Check for severe weather
    const severeConditions = ['Thunderstorm', 'Heavy rain', 'Snow', 'Ice', 'Fog'];
    if (severeConditions.some(cond => condition.includes(cond))) {
      return true;
    }
    
    // Check precipitation
    if (sceneRequirements?.noRain && precipitation > 20) {
      return true;
    }
    
    // Check wind for outdoor scenes
    if (sceneRequirements?.outdoor && windSpeed > 30) {
      return true;
    }
    
    return false;
  }

  private static parseAstroTime(timeString: string, date: Date): Date {
    if (!timeString) return new Date(date.setHours(6, 0, 0)); // Default 6 AM
    
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour = hours;
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    const result = new Date(date);
    result.setHours(hour, minutes, 0, 0);
    return result;
  }

  private static calculateGoldenHour(sunTime: Date, period: 'am' | 'pm'): Date {
    const goldenHour = new Date(sunTime);
    
    if (period === 'am') {
      // Golden hour AM is 1 hour after sunrise
      goldenHour.setHours(goldenHour.getHours() + 1);
    } else {
      // Golden hour PM is 1 hour before sunset
      goldenHour.setHours(goldenHour.getHours() - 1);
    }
    
    return goldenHour;
  }

  private static getMockForecast(location: Location, date: Date): WeatherData {
    // Mock data for development/testing
    return {
      date,
      locationId: location.id,
      temperature: 22,
      condition: 'Partly cloudy',
      precipitation: 10,
      humidity: 65,
      windSpeed: 15,
      sunrise: new Date(date.setHours(6, 30, 0)),
      sunset: new Date(date.setHours(18, 45, 0)),
      goldenHourAM: new Date(date.setHours(7, 30, 0)),
      goldenHourPM: new Date(date.setHours(17, 45, 0))
    };
  }

  private static getMockWeeklyForecast(location: Location): WeatherData[] {
    const forecasts: WeatherData[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      forecasts.push(this.getMockForecast(location, date));
    }
    
    return forecasts;
  }
}