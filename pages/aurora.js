import React, { useMemo, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useWeatherData from '../hooks/useWeatherData';
import WeatherIcon from '../components/WeatherIcon';
import { getSkyPalette } from '../components/SkyPalette';
import { weatherHaikus } from '../components/WeatherInsights';
import { WeatherSkeleton } from '../components/Skeleton';

/*
 * AURORA VARIANT
 * Warm cream canvas with large flowing gradient blobs.
 * Weather as color and feeling. Editorial serif typography.
 * Single-scroll, storytelling-first. No sidebar, no clutter.
 * Inspired by: warm editorial apps, organic gradient design, PAM PAM UI.
 */

const conditionVibes = {
  Clear:        { bg: '#FBF8F3', blob1: '#FDDCB5', blob2: '#C4E8C2', blob3: '#B3D9F7', word: 'Radiant' },
  Clouds:       { bg: '#F5F3F0', blob1: '#D7CFF8', blob2: '#C8D6E5', blob3: '#E8DDD4', word: 'Veiled' },
  Rain:         { bg: '#F0F2F5', blob1: '#A8C8F0', blob2: '#C5B3E8', blob3: '#8FB8D0', word: 'Tender' },
  Drizzle:      { bg: '#F3F5F7', blob1: '#B8D8F0', blob2: '#D2C8E8', blob3: '#C0DDE8', word: 'Gentle' },
  Thunderstorm: { bg: '#F0EEF3', blob1: '#C5A8E0', blob2: '#9898C8', blob3: '#E0C8D8', word: 'Electric' },
  Snow:         { bg: '#FAFBFC', blob1: '#D0E8F0', blob2: '#E0E8F0', blob3: '#C8D8E8', word: 'Hushed' },
  Mist:         { bg: '#F5F5F3', blob1: '#D8D4CC', blob2: '#C8C8C0', blob3: '#E0DCD4', word: 'Soft' },
  Fog:          { bg: '#F3F3F0', blob1: '#D0CCC4', blob2: '#C0BEB8', blob3: '#D8D4CC', word: 'Dreamy' },
  Haze:         { bg: '#F8F5F0', blob1: '#E8D8B8', blob2: '#D0C8B0', blob3: '#F0E8D0', word: 'Hazy' },
};

function getVibe(condition) {
  return conditionVibes[condition] || conditionVibes.Clear;
}

export default function AuroraVariant() {
  const {
    location, unit, weatherData, forecastData, isLoading,
    handleSetUnit, toTemp, handleRefresh, funnyLine, weatherCondition,
  } = useWeatherData();

  useEffect(() => {
    document.body.classList.add('layout-variant');
    document.body.classList.remove('layout-default');
    return () => document.body.classList.remove('layout-variant');
  }, []);

  const vibe = useMemo(() => getVibe(weatherCondition), [weatherCondition]);

  const palette = useMemo(() => {
    if (!weatherData) return [vibe.blob1, vibe.blob2, vibe.blob3, '#E8E5E3', '#D6D2CF'];
    return getSkyPalette(weatherCondition, weatherData.timezone);
  }, [weatherData, weatherCondition, vibe]);

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

  const hourlyData = useMemo(() => {
    if (!forecastData?.list) return [];
    return forecastData.list.slice(0, 8);
  }, [forecastData]);

  const sunrise = weatherData ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
  const sunset = weatherData ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';

  return (
    <>
      <Head>
        <title>{`Aurora — ${location} — Tales of Sky`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className="min-h-screen font-sans antialiased transition-colors duration-[2000ms] relative"
        style={{ backgroundColor: vibe.bg }}
      >
        {/* Large flowing gradient blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[600px] h-[600px] rounded-full aurora-blob-1"
            style={{
              background: `radial-gradient(circle, ${vibe.blob1} 0%, transparent 70%)`,
              top: '-15%',
              right: '-10%',
              opacity: 0.6,
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full aurora-blob-2"
            style={{
              background: `radial-gradient(circle, ${vibe.blob2} 0%, transparent 70%)`,
              bottom: '10%',
              left: '-8%',
              opacity: 0.5,
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full aurora-blob-3"
            style={{
              background: `radial-gradient(circle, ${vibe.blob3} 0%, transparent 70%)`,
              top: '45%',
              left: '40%',
              opacity: 0.4,
            }}
          />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6">
          <Link href="/" className="text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors">
            ← Default
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/glass" className="text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors">
              Glass
            </Link>
            <Link href="/sensorial" className="text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors">
              Sensorial
            </Link>
          </div>
        </nav>

        {/* Content */}
        <div className="relative z-10 max-w-xl mx-auto px-6 pb-20">
          {isLoading && !weatherData ? (
            <div className="pt-20"><WeatherSkeleton /></div>
          ) : (
            <>
              {/* Hero — large editorial typography */}
              <div className="pt-8 pb-10 text-center">
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-stone-400 mb-6">
                  {location}
                </p>

                {/* One-word weather feeling — big serif */}
                <h1
                  className="text-[5rem] sm:text-[6.5rem] leading-[0.9] font-bold tracking-[-0.04em] text-stone-800 mb-4"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  {vibe.word}
                </h1>

                {/* Temperature */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {weatherData?.weather?.[0]?.icon && (
                    <WeatherIcon iconCode={weatherData.weather[0].icon} size={56} />
                  )}
                  <span className="text-[4.5rem] leading-none font-bold tracking-[-0.06em] text-stone-700">
                    {weatherData ? toTemp(weatherData.main.temp) : '--'}°
                  </span>
                </div>

                {/* Funny line */}
                <p className="text-lg text-stone-400 max-w-sm mx-auto leading-relaxed">
                  {funnyLine}
                </p>

                {/* Controls */}
                <div className="flex justify-center gap-2 mt-6">
                  {['C', 'F'].map((u) => (
                    <button
                      key={u}
                      onClick={() => handleSetUnit(u)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        unit === u
                          ? 'bg-stone-800 text-white'
                          : 'bg-white/60 text-stone-500 border border-stone-200/60'
                      }`}
                    >
                      °{u}
                    </button>
                  ))}
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/60 text-stone-500 border border-stone-200/60 hover:bg-white/80 transition-all ml-1"
                  >
                    ↻
                  </button>
                </div>
              </div>

              {/* Iridescent orb — hero visual */}
              <div className="flex justify-center mb-12">
                <div className="relative">
                  <div
                    className="w-48 h-48 rounded-full sensorial-sphere"
                    style={{
                      background: `conic-gradient(from 120deg, ${vibe.blob1}, ${vibe.blob2}, ${vibe.blob3}, ${vibe.blob1})`,
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5) 0%, transparent 60%)',
                    }}
                  />
                </div>
              </div>

              {/* Conditions — warm cream cards */}
              {weatherData && (
                <div className="grid grid-cols-3 gap-2.5 mb-8">
                  {[
                    { label: 'Feels Like', value: `${toTemp(weatherData.main.feels_like)}°` },
                    { label: 'Humidity', value: `${weatherData.main.humidity}%` },
                    { label: 'Wind', value: unit === 'C' ? `${(weatherData.wind.speed * 3.6).toFixed(0)} km/h` : `${(weatherData.wind.speed * 2.237).toFixed(0)} mph` },
                    { label: 'Sunrise', value: sunrise },
                    { label: 'Sunset', value: sunset },
                    { label: 'Visibility', value: weatherData.visibility != null ? `${(weatherData.visibility / 1000).toFixed(0)} km` : '--' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/50 backdrop-blur-sm rounded-2xl border border-stone-200/40 px-4 py-4 text-center">
                      <div className="text-[0.65rem] text-stone-400 tracking-wide uppercase mb-1">{item.label}</div>
                      <div className="text-lg font-bold text-stone-700 tabular-nums">{item.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hourly */}
              {hourlyData.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-400 mb-3">Hourly</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {hourlyData.map((hour) => (
                      <div key={hour.dt} className="bg-white/50 backdrop-blur-sm rounded-2xl border border-stone-200/40 px-4 py-3 text-center min-w-[70px] shrink-0">
                        <div className="text-[0.7rem] text-stone-400 mb-0.5">{new Date(hour.dt * 1000).getHours()}:00</div>
                        <WeatherIcon iconCode={hour.weather[0].icon} size={32} className="mx-auto my-0.5" />
                        <div className="text-sm font-bold text-stone-700">{toTemp(hour.main.temp)}°</div>
                        {hour.pop > 0.1 && (
                          <div className="text-[0.6rem] font-medium text-blue-400 mt-0.5">{Math.round(hour.pop * 100)}%</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5-Day */}
              {dailyForecast.length > 0 && (
                <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-stone-200/40 overflow-hidden mb-8">
                  <p className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-400 px-5 pt-5 pb-2">5-Day</p>
                  <div className="divide-y divide-stone-200/40">
                    {dailyForecast.map((day) => (
                      <div key={day.date} className="flex items-center px-5 py-3.5">
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
                </div>
              )}

              {/* Sky palette */}
              <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-stone-200/40 p-5 mb-8">
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-400 mb-3">Sky Palette</p>
                <div
                  className="h-12 rounded-2xl mb-3"
                  style={{ background: `linear-gradient(135deg, ${palette.join(', ')})` }}
                />
                <div className="flex justify-between">
                  {palette.map((c, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                      <span className="text-[0.55rem] text-stone-400 mt-1 font-mono">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Haiku */}
              {haiku && (
                <div className="text-center pt-4 pb-8">
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