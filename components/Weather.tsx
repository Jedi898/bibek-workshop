'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from './LanguageContext'

const Weather = () => {
  const { t } = useLanguage()
  const [weather, setWeather] = useState<any>(null)
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      () => {
        setError('Unable to retrieve your location. Please allow location access.')
        setLoading(false)
      }
    )
  }, [])

  useEffect(() => {
    if (location) {
      const weatherPromise = fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&daily=sunrise,sunset&timezone=auto`
      ).then(res => res.json());

      const locationPromise = fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lon}`
      ).then(res => res.json());

      Promise.all([weatherPromise, locationPromise])
        .then(([weatherData, locationData]) => {
          setWeather(weatherData);
          const address = locationData.address;
          const name = address.city || address.town || address.village || address.county || t('Unknown Location');
          setLocationName(name);
        })
        .catch((err) => {
          console.error("Failed to fetch data:", err);
          setError('Failed to fetch weather or location data');
        })
        .finally(() => {
          setLoading(false)
        });
    }
  }, [location, t])

  const getWeatherDescription = (code: number) => {
    // WMO Weather interpretation codes
    if (code === 0) return t('Clear sky ☀️')
    if (code >= 1 && code <= 3) return t('Partly cloudy ⛅')
    if (code >= 45 && code <= 48) return t('Fog 🌫️')
    if (code >= 51 && code <= 55) return t('Drizzle 🌧️')
    if (code >= 61 && code <= 67) return t('Rain 🌧️')
    if (code >= 71 && code <= 77) return t('Snow ❄️')
    if (code >= 80 && code <= 82) return t('Showers 🌦️')
    if (code >= 95 && code <= 99) return t('Thunderstorm ⚡')
    return t('Unknown')
  }

  if (loading) return <div className="p-6 text-white">{t('Loading weather data...')}</div>
  if (error) return <div className="p-6 text-red-400">{t(error) || error}</div>

  return (
    <div className="p-6 text-white h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">{t('Real-time Weather')}</h2>
      {weather && weather.current_weather && (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-auto md:mx-0">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{getWeatherDescription(weather.current_weather.weathercode).split(' ')[1]}</div>
            <h3 className="text-5xl font-bold mb-2">{weather.current_weather.temperature}°C</h3>
            <p className="text-xl text-gray-300 capitalize">{getWeatherDescription(weather.current_weather.weathercode).split(' ')[0]}</p>
            <p className="text-2xl text-gray-400 mt-2">{locationName}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 border-t border-gray-700 pt-6">
            <div>
              <span className="block text-gray-400 text-sm uppercase tracking-wider">{t('Wind Speed')}</span>
              <span className="text-xl font-semibold">{weather.current_weather.windspeed} km/h</span>
            </div>
            <div>
              <span className="block text-gray-400 text-sm uppercase tracking-wider">{t('Wind Direction')}</span>
              <span className="text-xl font-semibold">{weather.current_weather.winddirection}°</span>
            </div>
             {weather.daily && weather.daily.sunrise && (
              <>
                <div>
                  <span className="block text-gray-400 text-sm uppercase tracking-wider">🌅 {t('Sunrise')}</span>
                  <span className="text-xl font-semibold">{new Date(weather.daily.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div>
                  <span className="block text-gray-400 text-sm uppercase tracking-wider">🌇 {t('Sunset')}</span>
                  <span className="text-xl font-semibold">{new Date(weather.daily.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Weather