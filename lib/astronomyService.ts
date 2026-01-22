import { Location } from '@/types/index';

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  goldenHour: Date;
  dawn: Date;
  dusk: Date;
}

export class AstronomyService {
  static calculateSunTimes(latitude: number, longitude: number, date: Date): SunTimes {
    // Simplified calculation (mock) for development
    // In a real production app, you would use a library like 'suncalc'
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    return {
      sunrise: new Date(d.getTime() + 6 * 3600 * 1000),      // 06:00
      sunset: new Date(d.getTime() + 18 * 3600 * 1000),      // 18:00
      goldenHour: new Date(d.getTime() + 17.5 * 3600 * 1000), // 17:30
      dawn: new Date(d.getTime() + 5.5 * 3600 * 1000),       // 05:30
      dusk: new Date(d.getTime() + 18.5 * 3600 * 1000)       // 18:30
    };
  }

  static getForLocation(location: Location, date: Date): SunTimes | null {
    if (location.coordinates) {
      return this.calculateSunTimes(location.coordinates.lat, location.coordinates.lng, date);
    }
    return null;
  }
}