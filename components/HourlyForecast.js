import WeatherIcon from './WeatherIcon';

export default function HourlyForecast({ forecastData, unit, toTemp }) {
  if (!forecastData?.list) return null;

  return (
    <div className="mt-10 text-left space-y-3">
      <h3 className="text-[1.02rem] font-bold tracking-[-0.03em] text-taupe-800 dark:text-taupe-200">3-Hour Forecast</h3>
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
        {forecastData.list.slice(0, 12).map((hour) => (
          <div
            key={hour.dt}
            className="bg-taupe-100 dark:bg-taupe-800 rounded-xl px-3 py-3 text-center min-w-[80px] text-base flex flex-col items-center"
          >
            <div className="text-[0.82rem] font-semibold tracking-[-0.02em] text-taupe-500 dark:text-taupe-400">
              {new Date(hour.dt * 1000).getHours()}:00
            </div>
            <WeatherIcon iconCode={hour.weather[0].icon} size={44} className="my-1" />
            <div className="text-[0.95rem] font-semibold text-taupe-800 dark:text-taupe-200">
              {toTemp(hour.main.temp)}°
            </div>
            <div className="text-[0.75rem] text-taupe-400 dark:text-taupe-500 mt-0.5">
              {hour.weather[0].main}
            </div>
            {hour.pop > 0.1 && (
              <div className="text-[0.72rem] font-medium text-blue-500 mt-0.5">
                {Math.round(hour.pop * 100)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
