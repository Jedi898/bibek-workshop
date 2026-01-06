import { Location } from '@/types';

export class AstronomyService {
  static calculateSunTimes(latitude: number, longitude: number, date: Date) {
    // Convert to Julian day
    const julianDay = this.toJulianDay(date);
    
    // Calculate solar noon
    const solarNoon = this.calculateSolarNoon(julianDay, longitude);
    
    // Calculate sunrise and sunset
    const sunrise = this.calculateSunrise(julianDay, latitude, solarNoon);
    const sunset = this.calculateSunset(julianDay, latitude, solarNoon);
    
    // Calculate golden hours (magic hours)
    const goldenHourAM = this.calculateGoldenHour(sunrise, 'am');
    const goldenHourPM = this.calculateGoldenHour(sunset, 'pm');
    
    // Calculate blue hours
    const blueHourAM = this.calculateBlueHour(sunrise, 'am');
    const blueHourPM = this.calculateBlueHour(sunset, 'pm');
    
    return {
      sunrise,
      sunset,
      solarNoon,
      goldenHourAM,
      goldenHourPM,
      blueHourAM,
      blueHourPM,
      dayLength: this.calculateDayLength(sunrise, sunset)
    };
  }

  static getOptimalShootingTimes(
    location: Location,
    date: Date,
    sceneRequirements: {
      timeOfDay: 'day' | 'night' | 'golden-hour' | 'blue-hour';
      naturalLight: boolean;
    }
  ) {
    const sunTimes = this.calculateSunTimes(
      this.extractLatitude(location),
      this.extractLongitude(location),
      date
    );

    let optimalTimes = [];

    switch (sceneRequirements.timeOfDay) {
      case 'golden-hour':
        optimalTimes.push({
          type: 'golden-hour-am',
          start: sunTimes.goldenHourAM,
          end: sunTimes.sunrise,
          description: 'Morning golden hour'
        });
        optimalTimes.push({
          type: 'golden-hour-pm',
          start: sunTimes.sunset,
          end: sunTimes.goldenHourPM,
          description: 'Evening golden hour'
        });
        break;

      case 'blue-hour':
        optimalTimes.push({
          type: 'blue-hour-am',
          start: sunTimes.blueHourAM,
          end: sunTimes.sunrise,
          description: 'Morning blue hour'
        });
        optimalTimes.push({
          type: 'blue-hour-pm',
          start: sunTimes.sunset,
          end: sunTimes.blueHourPM,
          description: 'Evening blue hour'
        });
        break;

      case 'day':
        optimalTimes.push({
          type: 'daylight',
          start: new Date(sunTimes.sunrise.getTime() + 3600000), // 1 hour after sunrise
          end: new Date(sunTimes.sunset.getTime() - 3600000), // 1 hour before sunset
          description: 'Full daylight'
        });
        break;

      case 'night':
        optimalTimes.push({
          type: 'night',
          start: new Date(sunTimes.sunset.getTime() + 3600000), // 1 hour after sunset
          end: new Date(sunTimes.sunrise.getTime() - 3600000), // 1 hour before sunrise
          description: 'Night time'
        });
        break;
    }

    // Filter based on natural light requirement
    if (sceneRequirements.naturalLight) {
      optimalTimes = optimalTimes.filter(time => 
        time.type !== 'night' && !time.type.includes('blue')
      );
    }

    return optimalTimes;
  }

  static calculateBestShootingDays(
    location: Location,
    startDate: Date,
    endDate: Date,
    requiredConditions: {
      minDaylightHours: number;
      goldenHourRequired: boolean;
      avoidRain: boolean;
    }
  ) {
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const sunTimes = this.calculateSunTimes(
        this.extractLatitude(location),
        this.extractLongitude(location),
        currentDate
      );

      let score = 0;
      
      // Score based on daylight hours
      if (sunTimes.dayLength >= requiredConditions.minDaylightHours * 3600000) {
        score += 3;
      } else if (sunTimes.dayLength >= requiredConditions.minDaylightHours * 3600000 * 0.7) {
        score += 1;
      }
      
      // Bonus for golden hour availability
      if (requiredConditions.goldenHourRequired) {
        score += 2;
      }
      
      days.push({
        date: new Date(currentDate),
        sunTimes,
        score,
        recommended: score >= 3
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days.sort((a, b) => b.score - a.score);
  }

  private static toJulianDay(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
           Math.floor(y / 4) - Math.floor(y / 100) + 
           Math.floor(y / 400) - 32045;
  }

  private static calculateSolarNoon(julianDay: number, longitude: number): Date {
    // Simplified calculation - in production, use a more accurate algorithm
    const n = julianDay - 2451545.0 + 0.0008;
    const jStar = n - (longitude / 360);
    const m = 357.5291 + 0.98560028 * jStar;
    const c = 1.9148 * Math.sin(this.toRadians(m)) + 
              0.0200 * Math.sin(this.toRadians(2 * m)) + 
              0.0003 * Math.sin(this.toRadians(3 * m));
    const lambda = this.toRadians(m + 102.9372 + c + 180);
    const jTransit = 2451545.0 + jStar + 0.0053 * Math.sin(this.toRadians(m)) - 
                     0.0069 * Math.sin(2 * lambda);
    
    return this.julianToDate(jTransit);
  }

  private static calculateSunrise(julianDay: number, latitude: number, solarNoon: Date): Date {
    // Simplified sunrise calculation
    const date = new Date(solarNoon);
    const latRad = this.toRadians(latitude);
    const declination = this.toRadians(23.45 * Math.sin(this.toRadians(360/365 * (julianDay - 81))));
    const hourAngle = Math.acos((Math.sin(this.toRadians(-0.833)) - Math.sin(latRad) * Math.sin(declination)) / 
                                (Math.cos(latRad) * Math.cos(declination)));
    const sunriseHours = 12 - (this.toDegrees(hourAngle) / 15);
    
    date.setHours(Math.floor(sunriseHours), (sunriseHours % 1) * 60, 0, 0);
    return date;
  }

  private static calculateSunset(julianDay: number, latitude: number, solarNoon: Date): Date {
    const date = new Date(solarNoon);
    const latRad = this.toRadians(latitude);
    const declination = this.toRadians(23.45 * Math.sin(this.toRadians(360/365 * (julianDay - 81))));
    const hourAngle = Math.acos((Math.sin(this.toRadians(-0.833)) - Math.sin(latRad) * Math.sin(declination)) / 
                                (Math.cos(latRad) * Math.cos(declination)));
    const sunsetHours = 12 + (this.toDegrees(hourAngle) / 15);
    
    date.setHours(Math.floor(sunsetHours), (sunsetHours % 1) * 60, 0, 0);
    return date;
  }

  private static calculateGoldenHour(sunTime: Date, period: 'am' | 'pm'): Date {
    const goldenHour = new Date(sunTime);
    
    if (period === 'am') {
      goldenHour.setHours(goldenHour.getHours() + 1);
    } else {
      goldenHour.setHours(goldenHour.getHours() - 1);
    }
    
    return goldenHour;
  }

  private static calculateBlueHour(sunTime: Date, period: 'am' | 'pm'): Date {
    const blueHour = new Date(sunTime);
    
    if (period === 'am') {
      blueHour.setHours(blueHour.getHours() - 0.5);
    } else {
      blueHour.setHours(blueHour.getHours() + 0.5);
    }
    
    return blueHour;
  }

  private static calculateDayLength(sunrise: Date, sunset: Date): number {
    return sunset.getTime() - sunrise.getTime();
  }

  private static extractLatitude(location: Location): number {
    // In production, use geocoding service to get coordinates from address
    // For now, return mock coordinates
    return 40.7128; // NYC latitude
  }

  private static extractLongitude(location: Location): number {
    return -74.0060; // NYC longitude
  }

  private static toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  private static toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }

  private static julianToDate(julian: number): Date {
    const jd = julian + 0.5;
    const z = Math.floor(jd);
    const f = jd - z;
    let a = z;
    
    if (z >= 2299161) {
      const alpha = Math.floor((z - 1867216.25) / 36524.25);
      a = z + 1 + alpha - Math.floor(alpha / 4);
    }
    
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    
    const day = b - d - Math.floor(30.6001 * e) + f;
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;
    
    const date = new Date(year, month - 1, day);
    const hours = (date.getHours() + (day % 1) * 24) % 24;
    date.setHours(Math.floor(hours), (hours % 1) * 60, 0, 0);
    
    return date;
  }
}