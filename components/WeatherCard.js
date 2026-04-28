import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import WeatherIcon from './WeatherIcon';

// Map OWM conditions to our 7 image condition slugs
const conditionImageMap = {
  Clear: 'clear',
  Clouds: 'cloudy',
  Rain: 'rain',
  Drizzle: 'rain',
  Thunderstorm: 'thunderstorm',
  Snow: 'snow',
  Mist: 'mist',
  Fog: 'mist',
  Haze: 'mist',
  Smoke: 'mist',
  Dust: 'mist',
};

// Cities that have dedicated image folders
const SUPPORTED_CITIES = new Set([
  'seattle', 'new-york', 'london', 'tokyo', 'paris',
  'delhi', 'new-delhi', 'dubai', 'sydney', 'san-francisco', 'singapore',
]);

function getSeason(lat, timezone) {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const localMonth = new Date(utcMs + timezone * 1000).getMonth(); // 0-11
  const isNorthern = lat >= 0;

  // Mar-May=spring, Jun-Aug=summer, Sep-Nov=autumn, Dec-Feb=winter (northern)
  if (localMonth >= 2 && localMonth <= 4) return isNorthern ? 'spring' : 'autumn';
  if (localMonth >= 5 && localMonth <= 7) return isNorthern ? 'summer' : 'winter';
  if (localMonth >= 8 && localMonth <= 10) return isNorthern ? 'autumn' : 'spring';
  return isNorthern ? 'winter' : 'summer';
}

export default function WeatherCard({ location, weatherData, isLoading, funnyLine, unit, setUnit, toTemp }) {
  if (!weatherData) return null;

  const condition = weatherData.weather?.[0]?.main;
  const citySlug = useMemo(() => location.toLowerCase().replace(/ /g, '-'), [location]);
  const conditionSlug = conditionImageMap[condition] || 'clear';
  const season = useMemo(() => getSeason(weatherData.coord?.lat || 0, weatherData.timezone || 0), [weatherData]);
  const [imgFallbackLevel, setImgFallbackLevel] = useState(0);

  // Reset fallback when city/condition/season changes
  useEffect(() => {
    setImgFallbackLevel(0);
  }, [citySlug, conditionSlug, season]);

  const imgSrc = useMemo(() => {
    const imageFile = `${season}-${conditionSlug}.webp`;
    if (imgFallbackLevel === 0 && SUPPORTED_CITIES.has(citySlug)) {
      return `/weather-images/${citySlug}/${imageFile}`;
    }
    if (imgFallbackLevel <= 1) {
      return `/weather-images/generic/${imageFile}`;
    }
    return '/ghibli/default.jpg';
  }, [citySlug, conditionSlug, season, imgFallbackLevel]);

  const handleImageError = () => {
    setImgFallbackLevel((prev) => Math.min(prev + 1, 2));
  };

  const iconCode = weatherData?.weather?.[0]?.icon;

  return (
    <>
      <h2 className="text-[1.15rem] leading-6 font-semibold tracking-[-0.03em] text-taupe-800 dark:text-taupe-200">{location}</h2>

      <div className="flex items-center justify-center gap-2">
        {iconCode && <WeatherIcon iconCode={iconCode} size={72} />}
        <div className="text-[4.6rem] leading-[0.88] font-bold tracking-[-0.06em] text-taupe-900 dark:text-taupe-100">
          {weatherData ? toTemp(weatherData.main.temp) : '--'}°{unit}
        </div>
      </div>

      <p className="text-[1.35rem] leading-8 font-medium text-taupe-600 dark:text-taupe-400 tracking-[-0.025em]">
        {isLoading ? 'Checking the sky...' : funnyLine}
      </p>

      <div className="relative w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden shadow-sm">
        <Image
          src={imgSrc}
          alt={location}
          fill
          className="object-cover"
          onError={handleImageError}
          priority
        />
      </div>
    </>
  );
}
