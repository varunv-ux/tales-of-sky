import Image from 'next/image';
import { useState, useMemo } from 'react';
import WeatherIcon from './WeatherIcon';

// Map weather conditions to fallback images
const conditionImageMap = {
  Clear: 'clear',
  Clouds: 'clouds',
  Rain: 'rain',
  Drizzle: 'rain',
  Thunderstorm: 'thunderstorm',
  Snow: 'snow',
  Mist: 'mist',
  Fog: 'mist',
  Haze: 'haze',
};

export default function WeatherCard({ location, weatherData, isLoading, funnyLine, unit, setUnit, toTemp }) {
  if (!weatherData) return null;

  const condition = weatherData.weather?.[0]?.main;
  const slug = useMemo(() => location.toLowerCase().replace(/ /g, '-'), [location]);
  const conditionSlug = conditionImageMap[condition] || 'default';
  const [imgFallbackLevel, setImgFallbackLevel] = useState(0);

  const imgSrc = useMemo(() => {
    if (imgFallbackLevel === 0) return `/ghibli/${slug}.jpg`;
    if (imgFallbackLevel === 1) return `/ghibli/${conditionSlug}.jpg`;
    return '/ghibli/default.jpg';
  }, [slug, conditionSlug, imgFallbackLevel]);

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

      <div className="relative w-full h-[250px] rounded-[1.5rem] overflow-hidden shadow-sm">
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
