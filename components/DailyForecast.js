import { useMemo } from 'react';
import WeatherIcon from './WeatherIcon';

export default function DailyForecast({ forecastData, unit, toTemp }) {
  const dailyForecast = useMemo(() => {
    if (!forecastData?.list) return [];

    const daily = {};
    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!daily[date]) {
        daily[date] = {
          date,
          min: item.main.temp_min,
          max: item.main.temp_max,
          icon: item.weather[0].icon,
          condition: item.weather[0].main,
        };
      } else {
        daily[date].min = Math.min(daily[date].min, item.main.temp_min);
        daily[date].max = Math.max(daily[date].max, item.main.temp_max);
      }
    });

    return Object.values(daily).slice(0, 5);
  }, [forecastData]);

  if (!dailyForecast.length) return null;

  return (
    <div className="mt-10 text-left space-y-3">
      <h3 className="text-[1.02rem] font-bold tracking-[-0.03em] text-taupe-800">5-Day Forecast</h3>
      <div className="rounded-2xl bg-taupe-100 divide-y divide-taupe-200 overflow-hidden">
        {dailyForecast.map((day) => (
          <div key={day.date} className="flex items-center px-5 py-4 text-[1rem] font-semibold tracking-[-0.03em]">
            <span className="w-12 text-taupe-700">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
            <WeatherIcon iconCode={day.icon} size={40} className="mx-3" />
            <span className="text-[0.85rem] font-medium text-taupe-400">{day.condition}</span>
            <span className="ml-auto tabular-nums">
              <span className="text-taupe-800">{toTemp(day.max)}°</span>
              <span className="text-taupe-400 mx-1">/</span>
              <span className="text-taupe-400">{toTemp(day.min)}°</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
