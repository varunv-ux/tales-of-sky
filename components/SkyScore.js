import { useMemo } from 'react';

// Score the day 0–100 based on how pleasant it is outside
export default function SkyScore({ weatherData, unit, toTemp }) {
  const score = useMemo(() => {
    if (!weatherData) return null;

    const temp = weatherData.main.temp; // always in °C from API
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed * 3.6; // m/s to km/h
    const condition = weatherData.weather?.[0]?.main;
    const visibility = weatherData.visibility;

    let s = 100;

    // Temperature: ideal is 20-25°C
    const tempDiff = temp < 20 ? 20 - temp : temp > 25 ? temp - 25 : 0;
    s -= Math.min(tempDiff * 2.5, 35);

    // Humidity: ideal is 40-60%
    if (humidity < 30) s -= (30 - humidity) * 0.3;
    else if (humidity > 70) s -= (humidity - 70) * 0.5;

    // Wind: calm is best
    if (windSpeed > 15) s -= Math.min((windSpeed - 15) * 0.8, 15);

    // Conditions penalty
    const penalties = { Clear: 0, Clouds: 5, Haze: 10, Mist: 12, Fog: 15, Drizzle: 20, Rain: 25, Snow: 20, Thunderstorm: 35, Smoke: 25, Dust: 20 };
    s -= penalties[condition] || 10;

    // Visibility bonus/penalty
    if (visibility != null && visibility < 3000) s -= 5;

    return Math.max(0, Math.min(100, Math.round(s)));
  }, [weatherData]);

  const label = useMemo(() => {
    if (score === null) return '';
    if (score >= 85) return 'Perfection. Go outside immediately.';
    if (score >= 70) return 'A genuinely good day out there.';
    if (score >= 55) return 'Decent enough. No complaints.';
    if (score >= 40) return 'Could be worse. Could be better.';
    if (score >= 25) return 'The sky is testing your patience.';
    return 'Stay inside. Trust us on this one.';
  }, [score]);

  if (score === null) return null;

  return (
    <div className="mt-6 flex flex-col items-center">
      <div className="text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-taupe-400 dark:text-taupe-500 mb-1">Sky Score</div>
      <div className="text-[3.5rem] leading-none font-bold tracking-[-0.04em] text-taupe-900 dark:text-taupe-100 tabular-nums">
        {score}
      </div>
      <div className="text-[0.88rem] font-medium text-taupe-500 dark:text-taupe-400 mt-1 tracking-[-0.01em]">
        {label}
      </div>
    </div>
  );
}
