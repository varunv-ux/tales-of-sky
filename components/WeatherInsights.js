import { useMemo } from 'react';

function degToCompass(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function WeatherInsights({ weatherData, forecastData, unit, toTemp }) {
  const data = useMemo(() => {
    if (!weatherData || !forecastData?.list) return null;

    const now = Date.now() / 1000;
    const { sunrise, sunset } = weatherData.sys;
    const timezone = weatherData.timezone;

    // Summary
    const desc = weatherData.weather?.[0]?.description || '';
    const temp = toTemp(weatherData.main.temp);
    const feelsLike = toTemp(weatherData.main.feels_like);
    const windDir = weatherData.wind?.deg != null ? degToCompass(weatherData.wind.deg) : '';
    const windSpeed = unit === 'C' ? `${(weatherData.wind.speed * 3.6).toFixed(0)} km/h` : `${(weatherData.wind.speed * 2.237).toFixed(0)} mph`;
    const humidity = weatherData.main.humidity;
    const feelsLikeDelta = Math.abs(feelsLike - temp);

    let summaryLine = `${desc.charAt(0).toUpperCase() + desc.slice(1)}`;
    if (feelsLikeDelta >= 2) summaryLine += `, feels like ${feelsLike}\u00b0`;
    summaryLine += '.';
    const windLine = windDir ? `${windDir} at ${windSpeed}` : `${windSpeed}`;

    // Daylight
    const daylightMin = (sunset - sunrise) / 60;
    const daylightStr = formatDuration(daylightMin);
    const isDaytime = now > sunrise && now < sunset;
    let countdownLabel, countdownValue;
    if (isDaytime) {
      countdownLabel = 'Sunset in';
      countdownValue = formatDuration((sunset - now) / 60);
    } else if (now < sunrise) {
      countdownLabel = 'Sunrise in';
      countdownValue = formatDuration((sunrise - now) / 60);
    } else {
      countdownLabel = 'Sun has set';
      countdownValue = '';
    }
    const daylightPct = isDaytime ? Math.min(100, Math.round(((now - sunrise) / (sunset - sunrise)) * 100)) : 0;

    // Local time
    const localDate = new Date((now + timezone) * 1000);
    const localTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    }).format(localDate);

    // Forecast analysis
    const dailyConditions = {};
    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyConditions[date]) dailyConditions[date] = { conditions: [], pops: [], date };
      dailyConditions[date].conditions.push(item.weather[0].main);
      dailyConditions[date].pops.push(item.pop || 0);
    });

    const days = Object.values(dailyConditions);
    const rainyDays = [];
    const clearDays = [];
    days.forEach((day) => {
      const dominant = day.conditions.sort((a, b) =>
        day.conditions.filter((c) => c === b).length - day.conditions.filter((c) => c === a).length
      )[0];
      const avgPop = day.pops.reduce((a, b) => a + b, 0) / day.pops.length;
      if (['Rain', 'Drizzle', 'Thunderstorm'].includes(dominant)) rainyDays.push(day);
      else if (['Clear', 'Clouds'].includes(dominant) && avgPop < 0.2) clearDays.push(day);
    });

    let outlookText;
    if (rainyDays.length >= 3) {
      const lastRainy = new Date(rainyDays[rainyDays.length - 1].date).toLocaleDateString(undefined, { weekday: 'long' });
      const clearDay = clearDays.length > 0 ? new Date(clearDays[0].date).toLocaleDateString(undefined, { weekday: 'long' }) : null;
      outlookText = clearDay ? `Rain through ${lastRainy}. Clears ${clearDay}.` : `Rain through ${lastRainy}.`;
    } else if (rainyDays.length > 0) {
      const nextRain = new Date(rainyDays[0].date).toLocaleDateString(undefined, { weekday: 'long' });
      outlookText = `Rain on ${nextRain}. Otherwise clear.`;
    } else {
      outlookText = 'Dry all week.';
    }

    // Best day
    let bestDayName = null;
    if (days.length >= 3) {
      let bestDay = null, bestScore = -Infinity;
      days.forEach((day, i) => {
        if (i === 0) return;
        const clearCount = day.conditions.filter((c) => c === 'Clear').length;
        const cloudCount = day.conditions.filter((c) => c === 'Clouds').length;
        const rainCount = day.conditions.filter((c) => ['Rain', 'Drizzle', 'Thunderstorm', 'Snow'].includes(c)).length;
        const avgPop = day.pops.reduce((a, b) => a + b, 0) / day.pops.length;
        const score = (clearCount * 3) + (cloudCount * 1) - (rainCount * 5) - (avgPop * 10);
        if (score > bestScore) { bestScore = score; bestDay = day; }
      });
      if (bestDay) bestDayName = new Date(bestDay.date).toLocaleDateString(undefined, { weekday: 'long' });
    }

    // Build items array with consistent shape
    const items = [];

    // Daylight
    let daylightText;
    if (isDaytime) {
      daylightText = `${daylightStr} of daylight today. Sunset in ${formatDuration((sunset - now) / 60)}.`;
    } else if (now < sunrise) {
      daylightText = `${daylightStr} of daylight today. Sunrise in ${formatDuration((sunrise - now) / 60)}.`;
    } else {
      daylightText = `${daylightStr} of daylight today. The sun has set.`;
    }
    items.push({ label: 'Daylight', text: daylightText });

    // Local Time
    items.push({ label: 'Local time', text: `It's ${localTime} in ${weatherData.name}. ${isDaytime ? 'Currently daytime.' : 'Currently nighttime.'}` });

    // Outlook
    items.push({ label: 'Outlook', text: outlookText });

    // Best Day
    if (bestDayName) {
      items.push({ label: 'Best day', text: `${bestDayName} is your best bet this week for outdoor plans.` });
    }

    return items;
  }, [weatherData, forecastData, unit, toTemp]);

  if (!data?.length) return null;

  return (
    <div className="mt-10 text-left space-y-3">
      <h3 className="text-[1.02rem] font-bold tracking-[-0.03em] text-taupe-800">Insights</h3>

      <div className="grid grid-cols-2 gap-2.5">
        {data.map((item) => (
          <div key={item.label} className={`bg-taupe-100 rounded-2xl px-5 py-5 ${item.span === 2 ? 'col-span-2' : ''}`}>
            <p className="text-[1.25rem] leading-[1.3] tracking-[0.02em] text-taupe-700">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
