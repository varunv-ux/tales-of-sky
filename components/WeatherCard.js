import Image from 'next/image';
import { useState } from 'react';
import WeatherIcon from './WeatherIcon';

export default function WeatherCard({ location, weatherData, isLoading, funnyLine, unit, setUnit, toTemp }) {
  const slug = location.toLowerCase().replace(/ /g, '-');
  const [imgSrc, setImgSrc] = useState(`/ghibli/${slug}.jpg`);
  const [prevLocation, setPrevLocation] = useState(location);

  // Reset image source when location changes
  if (location !== prevLocation) {
    setImgSrc(`/ghibli/${location.toLowerCase().replace(/ /g, '-')}.jpg`);
    setPrevLocation(location);
  }

  const iconCode = weatherData?.weather?.[0]?.icon;

  return (
    <>
      <h2 className="text-[1.15rem] leading-6 font-semibold tracking-[-0.03em] text-taupe-800">{location}</h2>

      <div className="flex items-center justify-center gap-2">
        {iconCode && <WeatherIcon iconCode={iconCode} size={72} />}
        <div className="text-[4.6rem] leading-[0.88] font-bold tracking-[-0.06em] text-taupe-900">
          {weatherData ? toTemp(weatherData.main.temp) : '--'}°{unit}
        </div>
      </div>

      <p className="text-[1.35rem] leading-8 font-medium text-taupe-600 tracking-[-0.025em]">
        {isLoading ? 'Checking the sky...' : funnyLine}
      </p>

      <div className="relative w-full h-[250px] rounded-[1.5rem] overflow-hidden shadow-sm">
        <Image
          src={imgSrc}
          alt={location}
          fill
          className="object-cover"
          onError={() => setImgSrc('/ghibli/default.jpg')}
          priority
        />
      </div>
    </>
  );
}
