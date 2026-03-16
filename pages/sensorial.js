import React, { useMemo, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useWeatherData from '../hooks/useWeatherData';
import WeatherIcon from '../components/WeatherIcon';
import { getSkyPalette } from '../components/SkyPalette';
import { weatherHaikus } from '../components/WeatherInsights';
import { WeatherSkeleton } from '../components/Skeleton';

/*
 * SENSORIAL VARIANT
 * Warm, organic, mood-first design. Large flowing gradient blobs.
 * Cream/warm tones like the moodboard. Bento grid layout.
 * Emotional weather — feelings over numbers.
 * Inspired by: the PAM PAM UI, Huru health app, warm editorial design.
 */

const weatherMoods = {
  Clear: { mood: 'Joy', feeling: 'A brighter day ahead', emoji: '✦' },
  Clouds: { mood: 'Calm', feeling: 'Soft light, quiet hours', emoji: '○' },
  Rain: { mood: 'Melancholy', feeling: 'Let the rain speak', emoji: '◆' },
  Drizzle: { mood: 'Gentle', feeling: 'A whisper of water', emoji: '·' },
  Thunderstorm: { mood: 'Intensity', feeling: 'Energy in the air', emoji: '⚡' },
  Snow: { mood: 'Stillness', feeling: 'The world holds its breath', emoji: '❋' },
  Mist: { mood: 'Mystery', feeling: 'Between here and elsewhere', emoji: '◎' },
  Fog: { mood: 'Dreamy', feeling: 'Soft edges, hidden paths', emoji: '◌' },
  Haze: { mood: 'Nostalgia', feeling: 'Everything at half-light', emoji: '◐' },
};

const weatherTags = {
  Clear: ['Joy', 'Warmth', 'Clarity', 'Gratitude', 'Energy'],
  Clouds: ['Calm', 'Neutral', 'Reflection', 'Ease', 'Balance'],
  Rain: ['Melancholy', 'Comfort', 'Introspection', 'Release', 'Rest'],
  Drizzle: ['Gentle', 'Soft', 'Patience', 'Acceptance', 'Quiet'],
  Thunderstorm: ['Awe', 'Power', 'Excitement', 'Surprise', 'Caution'],
  Snow: ['Stillness', 'Wonder', 'Peace', 'Purity', 'Nostalgia'],
  Mist: ['Mystery', 'Anticipation', 'Curiosity', 'Ambiguity', 'Trust'],
  Fog: ['Dreamy', 'Soft', 'Imagination', 'Surrender', 'Calm'],
  Haze: ['Nostalgia', 'Drift', 'Warmth', 'Haziness', 'Patience'],
};

const conditionGradients = {
  Clear: 'from-amber-100 via-orange-50 to-rose-100',
  Clouds: 'from-stone-100 via-zinc-100 to-slate-200',
  Rain: 'from-blue-100 via-indigo-100 to-slate-200',
  Drizzle: 'from-sky-100 via-blue-50 to-indigo-100',
  Thunderstorm: 'from-violet-200 via-purple-100 to-indigo-200',
  Snow: 'from-white via-blue-50 to-slate-100',
  Mist: 'from-gray-100 via-stone-100 to-zinc-100',
  Fog: 'from-stone-100 via-gray-100 to-slate-100',
  Haze: 'from-amber-50 via-yellow-50 to-stone-100',
};

function BentoCard({ children, className = '', span = false }) {
  return (
    <div className={`bg-white/60 backdrop-blur-sm rounded-[1.5rem] border border-stone-200/60 p-5 ${span ? 'col-span-2' : ''} ${className}`}>
      {children}
    </div>
  );
}

export default function SensorialVariant() {
  const {
    location, unit, weatherData, forecastData, isLoading,
    handleSetUnit, toTemp, handleRefresh, funnyLine, weatherCondition,
  } = useWeatherData();

  useEffect(() => {
    document.body.classList.add('layout-variant');
    document.body.classList.remove('layout-default');
    return () => document.body.classList.remove('layout-variant');
  }, []);

  const mood = weatherMoods[weatherCondition] || weatherMoods.Clear;
  const tags = weatherTags[weatherCondition] || weatherTags.Clear;
  const bgClass = conditionGradients[weatherCondition] || conditionGradients.Clear;

  const palette = useMemo(() => {
    if (!weatherData) return ['#E8E5E3', '#D6D2CF', '#ACA7A2', '#827A74', '#564F4D'];
    return getSkyPalette(weatherCondition, weatherData.timezone);
  }, [weatherData, weatherCondition]);

  const haiku = useMemo(() => {
    const lines = weatherHaikus[weatherCondition] || weatherHaikus['Clear'];
    return lines ? lines[Math.floor(Math.random() * lines.length)] : null;
  }, [weatherCondition]);

  const dailyForecast = useMemo(() => {
    if (!forecastData?.list) return [];
    const daily = {};
    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!daily[date]) {
        daily[date] = { date, min: item.main.temp_min, max: item.main.temp_max, icon: item.weather[0].icon, condition: item.weather[0].main };
      } else {
        daily[date].min = Math.min(daily[date].min, item.main.temp_min);
        daily[date].max = Math.max(daily[date].max, item.main.temp_max);
      }
    });
    return Object.values(daily).slice(0, 5);
  }, [forecastData]);

  const sunrise = weatherData ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
  const sunset = weatherData ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';

  return (
    <>
      <Head>
        <title>{`Sensorial — ${location} — Tales of Sky`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={`min-h-screen font-sans antialiased bg-gradient-to-br ${bgClass} transition-all duration-[3000ms]`}>
        {/* Floating organic blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[500px] h-[500px] rounded-full sensorial-blob-1"
            style={{
              background: `radial-gradient(circle, ${palette[0]}50 0%, ${palette[1]}30 40%, transparent 70%)`,
              top: '-10%',
              right: '-10%',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full sensorial-blob-2"
            style={{
              background: `radial-gradient(circle, ${palette[2]}40 0%, ${palette[3]}25 40%, transparent 70%)`,
              bottom: '5%',
              left: '-5%',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute w-[300px] h-[300px] rounded-full sensorial-blob-3"
            style={{
              background: `radial-gradient(circle, ${palette[4]}35 0%, ${palette[0]}20 40%, transparent 70%)`,
              top: '40%',
              left: '50%',
              filter: 'blur(100px)',
            }}
          />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6">
          <Link href="/" className="text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors">
            ← Default
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/aurora" className="text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors">
              Aurora
            </Link>
            <Link href="/glass" className="text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors">
              Glass
            </Link>
          </div>
        </nav>

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto px-5 pb-16">
          {isLoading && !weatherData ? (
            <div className="pt-20"><WeatherSkeleton /></div>
          ) : (
            <>
              {/* Bento grid */}
              <div className="grid grid-cols-2 gap-3">

                {/* Weather condition — large text card */}
                <BentoCard className="flex flex-col justify-between min-h-[180px]">
                  <p className="text-xs text-stone-400 tracking-wide">Condition</p>
                  <div>
                    <p className="text-[2.5rem] leading-none font-bold tracking-[-0.04em] text-stone-800 capitalize">
                      {weatherData?.weather?.[0]?.main || 'Clear'}
                    </p>
                  </div>
                </BentoCard>

                {/* Iridescent sphere — weather-reactive orb */}
                <BentoCard className="flex items-center justify-center min-h-[180px] overflow-hidden relative">
                  <div
                    className="w-32 h-32 rounded-full sensorial-sphere"
                    style={{
                      background: `conic-gradient(from 45deg, ${palette[0]}, ${palette[1]}, ${palette[2]}, ${palette[3]}, ${palette[4]}, ${palette[0]})`,
                      filter: 'blur(1px)',
                    }}
                  />
                  <div
                    className="absolute w-28 h-28 rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6) 0%, transparent 60%)',
                    }}
                  />
                </BentoCard>

                {/* Emotion tags */}
                <BentoCard className="min-h-[140px]">
                  <p className="text-xs text-stone-400 tracking-wide mb-3">How it feels</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <span
                        key={tag}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          i === 0
                            ? 'bg-stone-800 text-white border-stone-800'
                            : 'bg-white/50 text-stone-600 border-stone-200'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </BentoCard>

                {/* Feeling text */}
                <BentoCard className="flex flex-col justify-center min-h-[140px]">
                  <p className="text-[1.65rem] leading-tight font-semibold tracking-[-0.03em] text-stone-700">
                    {mood.feeling}
                  </p>
                </BentoCard>

                {/* Temperature — full width */}
                <BentoCard span className="text-center py-8">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    {weatherData?.weather?.[0]?.icon && (
                      <WeatherIcon iconCode={weatherData.weather[0].icon} size={64} />
                    )}
                    <span className="text-[5.5rem] leading-none font-bold tracking-[-0.06em] text-stone-800">
                      {weatherData ? toTemp(weatherData.main.temp) : '--'}°
                    </span>
                  </div>
                  <p className="text-stone-500 text-base">{location}</p>
                  <p className="text-stone-400 text-sm italic mt-1">{funnyLine}</p>

                  <div className="flex justify-center gap-2 mt-4">
                    {['C', 'F'].map((u) => (
                      <button
                        key={u}
                        onClick={() => handleSetUnit(u)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                          unit === u
                            ? 'bg-stone-800 text-white'
                            : 'bg-white/60 text-stone-500 border border-stone-200'
                        }`}
                      >
                        °{u}
                      </button>
                    ))}
                    <button
                      onClick={handleRefresh}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/60 text-stone-500 border border-stone-200 hover:bg-white/80 transition-all ml-1"
                    >
                      ↻
                    </button>
                  </div>
                </BentoCard>

                {/* Conditions — split into small cards */}
                {weatherData && (
                  <>
                    <BentoCard>
                      <p className="text-xs text-stone-400 mb-1">Feels Like</p>
                      <p className="text-2xl font-bold text-stone-800 tabular-nums">{toTemp(weatherData.main.feels_like)}°</p>
                    </BentoCard>
                    <BentoCard>
                      <p className="text-xs text-stone-400 mb-1">Humidity</p>
                      <p className="text-2xl font-bold text-stone-800 tabular-nums">{weatherData.main.humidity}%</p>
                    </BentoCard>
                    <BentoCard>
                      <p className="text-xs text-stone-400 mb-1">Wind</p>
                      <p className="text-2xl font-bold text-stone-800 tabular-nums">
                        {unit === 'C' ? `${(weatherData.wind.speed * 3.6).toFixed(0)}` : `${(weatherData.wind.speed * 2.237).toFixed(0)}`}
                        <span className="text-sm font-medium text-stone-400 ml-1">{unit === 'C' ? 'km/h' : 'mph'}</span>
                      </p>
                    </BentoCard>
                    <BentoCard>
                      <p className="text-xs text-stone-400 mb-1">Daylight</p>
                      <p className="text-lg font-bold text-stone-800">{sunrise}</p>
                      <p className="text-xs text-stone-400 mt-0.5">→ {sunset}</p>
                    </BentoCard>
                  </>
                )}

                {/* Sky palette — full width */}
                <BentoCard span className="overflow-hidden">
                  <p className="text-xs text-stone-400 tracking-wide mb-3">Sky Palette</p>
                  <div
                    className="h-16 rounded-2xl mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${palette.join(', ')})`,
                    }}
                  />
                  <div className="flex justify-between">
                    {palette.map((c, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                        <span className="text-[0.55rem] text-stone-400 mt-1 font-mono">{c}</span>
                      </div>
                    ))}
                  </div>
                </BentoCard>

                {/* 5-Day forecast — full width */}
                {dailyForecast.length > 0 && (
                  <BentoCard span padding={false}>
                    <p className="text-xs text-stone-400 tracking-wide px-5 pt-5 pb-2">5-Day Forecast</p>
                    <div className="divide-y divide-stone-200/60">
                      {dailyForecast.map((day) => (
                        <div key={day.date} className="flex items-center px-5 py-3">
                          <span className="w-10 text-sm text-stone-500">
                            {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                          </span>
                          <WeatherIcon iconCode={day.icon} size={32} className="mx-3" />
                          <span className="text-xs text-stone-400">{day.condition}</span>
                          <span className="ml-auto tabular-nums text-sm">
                            <span className="font-bold text-stone-700">{toTemp(day.max)}°</span>
                            <span className="text-stone-300 mx-1">/</span>
                            <span className="text-stone-400">{toTemp(day.min)}°</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </BentoCard>
                )}
              </div>

              {/* Haiku footer */}
              {haiku && (
                <div className="mt-10 text-center">
                  <p
                    className="text-xl leading-relaxed text-stone-400 italic whitespace-pre-line"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >
                    {haiku}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
