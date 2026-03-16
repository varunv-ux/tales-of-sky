import { useMemo } from 'react';

// Generate a 5-color sky palette based on time of day + weather condition
const palettes = {
  'clear-day': ['#87CEEB', '#5DADE2', '#F4D03F', '#F5B041', '#E8DAEF'],
  'clear-dawn': ['#FDEBD0', '#F5B7B1', '#D2B4DE', '#AED6F1', '#85C1E9'],
  'clear-dusk': ['#F1948A', '#E74C3C', '#AF7AC5', '#5B2C6F', '#1B2631'],
  'clear-night': ['#1B2631', '#212F3D', '#2E4053', '#34495E', '#5D6D7E'],
  'cloudy-day': ['#D5D8DC', '#AEB6BF', '#85929E', '#ABB2B9', '#BFC9CA'],
  'cloudy-night': ['#2C3E50', '#34495E', '#5D6D7E', '#7F8C8D', '#95A5A6'],
  'rain-day': ['#5D6D7E', '#2E4053', '#1B4F72', '#2471A3', '#85929E'],
  'rain-night': ['#1B2631', '#1B4F72', '#154360', '#1A5276', '#2C3E50'],
  'snow-day': ['#F2F4F4', '#D5DBDB', '#AEB6BF', '#E8F8F5', '#D1F2EB'],
  'snow-night': ['#2C3E50', '#AEB6BF', '#D5D8DC', '#85929E', '#5D6D7E'],
  'storm-day': ['#4A235A', '#6C3483', '#2C3E50', '#1C2833', '#566573'],
  'storm-night': ['#1B2631', '#4A235A', '#1C2833', '#2E4053', '#512E5F'],
  'mist': ['#D5D8DC', '#E5E7E9', '#F2F3F4', '#CACFD2', '#BDC3C7'],
};

function getPaletteKey(condition, hour) {
  const isDawn = hour >= 5 && hour < 8;
  const isDusk = hour >= 17 && hour < 20;
  const isNight = hour >= 20 || hour < 5;

  if (['Thunderstorm'].includes(condition)) return isNight ? 'storm-night' : 'storm-day';
  if (['Rain', 'Drizzle'].includes(condition)) return isNight ? 'rain-night' : 'rain-day';
  if (['Snow'].includes(condition)) return isNight ? 'snow-night' : 'snow-day';
  if (['Mist', 'Fog', 'Haze', 'Smoke', 'Dust'].includes(condition)) return 'mist';
  if (['Clouds'].includes(condition)) return isNight ? 'cloudy-night' : 'cloudy-day';
  // Clear
  if (isDawn) return 'clear-dawn';
  if (isDusk) return 'clear-dusk';
  if (isNight) return 'clear-night';
  return 'clear-day';
}

export function getSkyPalette(condition, timezone) {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const localHour = new Date(utcMs + timezone * 1000).getHours();
  const key = getPaletteKey(condition, localHour);
  return palettes[key] || palettes['clear-day'];
}

export default function SkyPalette({ weatherData }) {
  const colors = useMemo(() => {
    if (!weatherData) return null;
    const condition = weatherData.weather?.[0]?.main || 'Clear';
    return getSkyPalette(condition, weatherData.timezone);
  }, [weatherData]);

  if (!colors) return null;

  const gradient = `linear-gradient(to right, ${colors.join(', ')})`;

  return (
    <div className="mt-2">
      <div
        className="w-full h-3 rounded-full"
        style={{ background: gradient }}
        aria-label="Sky color palette"
      />
      <div className="flex justify-between mt-1.5">
        {colors.map((color, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className="w-5 h-5 rounded-full border border-taupe-200/50 dark:border-taupe-700/50"
              style={{ backgroundColor: color }}
            />
            <span className="text-[0.6rem] text-taupe-400 dark:text-taupe-500 mt-0.5 font-mono">{color}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
