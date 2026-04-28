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

// --- Creative Content ---

export const weatherHaikus = {
  Clear: [
    'Sun spills gold like wine\nnot a cloud dares to speak up\nthe sky chose today',
    'Blue from edge to edge\nthe horizon holds its breath\nlight pours endlessly',
    'No clouds, no excuses\nthe sun showed up for work\nand so should you',
  ],
  Clouds: [
    'Grey wool overhead\nthe sky forgot to get dressed\nmoody, but make it art',
    'Soft ceiling of grey\nthe sun is there, just hiding\npatience, it returns',
    'Clouds stack like pillows\nthe sky is building a fort\nwe were not invited',
  ],
  Rain: [
    'Rain taps on the glass\nthe world goes soft at its edges\nstay a while inside',
    'Puddles learn to sing\nthe gutters run with silver\numbrellas bloom wide',
    'Steady, the rain falls\neach drop a small commitment\nthe sky means it today',
  ],
  Drizzle: [
    'Barely there, the rain\nindecisive little drops\nthe sky can\'t commit',
    'A whisper of wet\nnot enough to ruin plans\njust enough to feel',
  ],
  Thunderstorm: [
    'Sky cracks its knuckles\nlightning writes its signature\nnature chose violence',
    'Thunder rolls its drums\nthe sky rehearses fury\nwe watch from inside',
  ],
  Snow: [
    'White erases all\nthe city holds its cold breath\nsilence falls like snow',
    'Flakes drift without rush\nthe world wrapped in a blanket\ntime slows to a hush',
  ],
  Mist: [
    'The air wears a veil\nshapes dissolve into whispers\nnothing is quite real',
  ],
  Fog: [
    'The world softly blurs\nstreetlights glow like fallen moons\nfog keeps its secrets',
  ],
  Haze: [
    'Air thick with nothing\nthe horizon disappears\nsoft focus on life',
  ],
};

const dearSkyLetters = {
  Clear: [
    "Dear Sky, you didn't have to go this hard today. Respectfully, {city}.",
    "Dear Sky, this is suspiciously beautiful. What's the catch? Sincerely, {city}.",
    "Dear Sky, we don't deserve you today. Gratefully, {city}.",
  ],
  Clouds: [
    "Dear Sky, we need to talk about your grey phase. With concern, {city}.",
    "Dear Sky, you're giving overcast chic. We see you. Fondly, {city}.",
    "Dear Sky, take your time. We'll be here when you're ready. Patiently, {city}.",
  ],
  Rain: [
    "Dear Sky, we get it. You're sad. We're all sad. Love, {city}.",
    "Dear Sky, our umbrellas send their regards. Wetly, {city}.",
    "Dear Sky, this is a lot. Even for you. Soggily, {city}.",
  ],
  Drizzle: [
    "Dear Sky, if you're going to rain, commit. Half-heartedly, {city}.",
    "Dear Sky, this isn't rain. This is atmospheric indecision. Dryly, {city}.",
  ],
  Thunderstorm: [
    "Dear Sky, that was dramatic. Even for you. Nervously, {city}.",
    "Dear Sky, we heard you the first time. Respectfully alarmed, {city}.",
  ],
  Snow: [
    "Dear Sky, the aesthetic? Immaculate. The commute? Unacceptable. Signed, {city}.",
    "Dear Sky, we didn't ask for a snow globe. But fine. Bundled up, {city}.",
  ],
  Mist: [
    "Dear Sky, the mystery is appreciated but the visibility is not. Squinting, {city}.",
  ],
  Fog: [
    "Dear Sky, we can't see you but we know you're there. Blindly, {city}.",
  ],
  Haze: [
    "Dear Sky, who turned down the render distance? Confused, {city}.",
  ],
};

const moodOutfits = {
  'clear-warm': 'Sunglasses and main character energy.',
  'clear-mild': 'Light layers. Easy confidence.',
  'clear-cold': 'Puffy jacket with mysterious scarf energy.',
  'clouds-warm': 'T-shirt philosopher vibes.',
  'clouds-mild': 'Cozy cardigan contemplation mode.',
  'clouds-cold': 'Full coat, no regrets.',
  'rain': 'Umbrella protagonist era.',
  'drizzle': 'Hoodie up, unbothered.',
  'snow': 'Blanket burrito season. Activated.',
  'storm': 'Indoor fort-building weather.',
  'mist': 'Trench coat and thoughtful stare.',
  'hot': 'Minimal fabric, maximum hydration.',
};

const profaneMoodOutfits = {
  'clear-warm': 'Sunglasses and zero f*cks energy.',
  'clear-mild': 'Light layers. Main character sh*t.',
  'clear-cold': 'Puffy jacket and a "don\'t talk to me" scarf.',
  'clouds-warm': 'T-shirt and existential dread. Classic.',
  'clouds-mild': 'Cozy cardigan, dead inside. Vibes.',
  'clouds-cold': 'Full coat, no regrets, no will to live.',
  'rain': 'Umbrella protagonist energy. You dramatic b*tch.',
  'drizzle': 'Hoodie up. Unbothered. Moisturized. Thriving.',
  'snow': 'Blanket burrito or death. No in-between.',
  'storm': 'Stay the f*ck inside weather.',
  'mist': 'Trench coat and murder mystery protagonist.',
  'hot': 'Minimal fabric. Maximum sweating. Gross.',
};

function getMoodKey(condition, tempC) {
  if (['Thunderstorm'].includes(condition)) return 'storm';
  if (['Rain'].includes(condition)) return 'rain';
  if (['Drizzle'].includes(condition)) return 'drizzle';
  if (['Snow'].includes(condition)) return 'snow';
  if (['Mist', 'Fog', 'Haze', 'Smoke'].includes(condition)) return 'mist';
  if (tempC > 32) return 'hot';
  const tempBand = tempC > 22 ? 'warm' : tempC > 12 ? 'mild' : 'cold';
  const sky = condition === 'Clear' ? 'clear' : 'clouds';
  return `${sky}-${tempBand}`;
}

function pick(arr) {
  if (!arr || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function WeatherInsights({ weatherData, forecastData, unit, toTemp, cardClassName, cardStyle, textClassName, headingClassName, profanityMode }) {
  const data = useMemo(() => {
    if (!weatherData || !forecastData?.list) return null;

    const now = Date.now() / 1000;
    const { sunrise, sunset } = weatherData.sys;
    const timezone = weatherData.timezone;
    const condition = weatherData.weather?.[0]?.main || 'Clear';
    const tempC = weatherData.main.temp;
    const cityName = weatherData.name;

    // Daylight
    const daylightMin = (sunset - sunrise) / 60;
    const daylightStr = formatDuration(daylightMin);
    const isDaytime = now > sunrise && now < sunset;

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

    // Build items
    const items = [];

    // Mood
    const moodKey = getMoodKey(condition, tempC);
    const moodSource = profanityMode ? profaneMoodOutfits : moodOutfits;
    const mood = moodSource[moodKey];
    if (mood) items.push({ label: 'Mood', text: mood });

    // Daylight
    let daylightText;
    if (isDaytime) {
      const timeToSunset = formatDuration((sunset - now) / 60);
      daylightText = profanityMode
        ? `${daylightStr} of daylight. Sun dips in ${timeToSunset}. Tick tock, b*tch.`
        : `${daylightStr} of daylight today. Sunset in ${timeToSunset}.`;
    } else if (now < sunrise) {
      const timeToSunrise = formatDuration((sunrise - now) / 60);
      daylightText = profanityMode
        ? `Still dark. Sunrise in ${timeToSunrise}. Go back to bed.`
        : `${daylightStr} of daylight ahead. Sunrise in ${timeToSunrise}.`;
    } else {
      const nextSunrise = sunrise + 86400;
      const timeToNextSunrise = formatDuration((nextSunrise - now) / 60);
      daylightText = profanityMode
        ? `Sun\'s gone. ${daylightStr} of daylight today. Next sunrise in ~${timeToNextSunrise}. Deal with it.`
        : `${daylightStr} of daylight today. The night is here. Next sunrise in ~${timeToNextSunrise}.`;
    }
    items.push({ label: 'Daylight', text: daylightText });

    // Outlook
    let outlookFinal = outlookText;
    if (profanityMode) {
      if (rainyDays.length >= 3) outlookFinal = `Rain won\'t shut the f*ck up this week.`;
      else if (rainyDays.length > 0) outlookFinal = outlookText.replace('Otherwise clear.', 'Otherwise clear. Lucky bastards.');
      else outlookFinal = 'Dry all week. Don\'t get used to it.';
    }
    items.push({ label: 'Outlook', text: outlookFinal });

    // Best Day
    if (bestDayName) {
      const bestDayText = profanityMode
        ? `${bestDayName} is the least sh*tty day this week. Plan accordingly.`
        : `${bestDayName} is your best bet this week for outdoor plans.`;
      items.push({ label: 'Best day', text: bestDayText });
    }

    return items;
  }, [weatherData, forecastData, unit, toTemp, profanityMode]);

  if (!data?.length) return null;

  return (
    <div className="mt-10 text-left space-y-3">
      <h3 className={headingClassName || "text-[1.02rem] font-bold tracking-[-0.03em] text-taupe-800 dark:text-taupe-200"}>Insights</h3>

      <div className="grid grid-cols-2 gap-2.5">
        {data.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl px-5 py-5 ${cardClassName || "bg-taupe-100 dark:bg-taupe-800"}`}
            style={cardStyle}
          >
            <p className={textClassName || "text-[1.25rem] leading-[1.3] tracking-[0.02em] text-taupe-800 dark:text-taupe-300"}>
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
