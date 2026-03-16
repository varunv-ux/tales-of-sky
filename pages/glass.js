import React, { useMemo, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useWeatherData from '../hooks/useWeatherData';
import WeatherIcon from '../components/WeatherIcon';
import { getSkyPalette } from '../components/SkyPalette';
import { weatherHaikus } from '../components/WeatherInsights';
import { WeatherSkeleton } from '../components/Skeleton';

/*
 * GLASS VARIANT
 * Light frosted glass panels on a flowing warm gradient backdrop.
 * Think: sunlight through frosted windows on a warm morning.
 * White/cream translucent cards, soft blur, warm pastel gradients behind.
 * Clean single-column with generous spacing.
 * Inspired by: visionOS light mode, warm glass morphism, editorial weather.
 */

const conditionPalettes = {
  Clear:        { bg1: '#FCEABB', bg2: '#F8B500', bg3: '#FDDCB5', bg4: '#C4E8C2', accent: '#F59E0B' },
  Clouds:       { bg1: '#E0DDD4', bg2: '#C8C4BC', bg3: '#D7CFF8', bg4: '#C8D6E5', accent: '#9CA3AF' },
  Rain:         { bg1: '#A8C8F0', bg2: '#7BA3D0', bg3: '#C5B3E8', bg4: '#8FB8D0', accent: '#6366F1' },
  Drizzle:      { bg1: '#B8D8F0', bg2: '#98C4E0', bg3: '#D2C8E8', bg4: '#C0DDE8', accent: '#818CF8' },
  Thunderstorm: { bg1: '#C5A8E0', bg2: '#A078C8', bg3: '#9898C8', bg4: '#E0C8D8', accent: '#7C3AED' },
  Snow:         { bg1: '#E8F0F8', bg2: '#D0E0F0', bg3: '#E0E8F0', bg4: '#C8D8E8', accent: '#94A3B8' },
  Mist:         { bg1: '#E8E4DC', bg2: '#D0CCC4', bg3: '#D8D4CC', bg4: '#C8C8C0', accent: '#A8A29E' },
  Fog:          { bg1: '#E0DCD4', bg2: '#C8C4BC', bg3: '#D0CCC4', bg4: '#C0BEB8', accent: '#78716C' },
  Haze:         { bg1: '#F0E8D0', bg2: '#E0D4B8', bg3: '#E8D8B8', bg4: '#D0C8B0', accent: '#D97706' },
};

function getPalette(condition) {
  return conditionPalettes[condition] || conditionPalettes.Clear;
}

function FrostedCard({ children, className = '', padding = true }) {
  return (
    <div className={`rounded-[1.75rem] border border-white/60 shadow-sm ${padding ? 'p-5' : ''} ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
      }}
    >
      {children}
    </div>
  );
}

export default function GlassVariant() {
  const {
    location, unit, weatherData, forecastData, isLoading,
    handleSetUnit, toTemp, handleRefresh, funnyLine, weatherCondition,
  } = useWeatherData();

  useEffect(() => {
    document.body.classList.add('layout-variant');
    document.body.classList.remove('layout-default');
    return () => document.body.classList.remove('layout-variant');
  }, []);

  const pal = useMemo(() => getPalette(weatherCondition), [weatherCondition]);

  const skyPalette = useMemo(() => {
    if (!weatherData) return ['#E8E5E3', '#D6D2CF', '#ACA7A2', '#827A74', '#564F4D'];
    return getSkyPalette(weatherCondition, weatherData.timezone);
  }, [weatherData, weatherCondition]);

  const haiku = useMemo(() => {
    const lines = weatherHaikus[weatherCondition] || weatherHaikus['Clear'];
    return lines ? lines[Math.floor(Math.random() * lines.length)] : null;
  }, [weatherCondition]);

  const hourlyData = useMemo(() => {
    if (!forecastData?.list) return [];
    return forecastData.list.slice(0, 8);
  }, [forecastData]);

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
        <title>{`Glass — ${location} — Tales of Sky`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen font-sans antialiased relative">
        {/* Warm flowing gradient background */}
        <div
          className="fixed inset-0 transition-all duration-[3000ms]"
          style={{
            background: `
              radial-gradient(ellipse at 25% 15%, ${pal.bg1}90 0%, transparent 55%),
              radial-gradient(ellipse at 75% 25%, ${pal.bg3}80 0%, transparent 50%),
              radial-gradient(ellipse at 50% 70%, ${pal.bg4}70 0%, transparent 55%),
              radial-gradient(ellipse at 85% 80%, ${pal.bg2}60 0%, transparent 50%),
              linear-gradient(to bottom, #FBF8F3, #F0EDE8)
            `,
          }}
        />

        {/* Large soft gradient blobs — visible through frosted glass */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[500px] h-[500px] rounded-full aurora-blob-1"
            style={{
              background: `radial-gradient(circle, ${pal.bg1} 0%, transparent 70%)`,
              top: '-5%',
              left: '10%',
              opacity: 0.7,
            }}
          />
          <div
            className="absolute w-[450px] h-[450px] rounded-full aurora-blob-2"
            style={{
              background: `radial-gradient(circle, ${pal.bg3} 0%, transparent 70%)`,
              top: '30%',
              right: '-5%',
              opacity: 0.5,
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full aurora-blob-3"
            style={{
              background: `radial-gradient(circle, ${pal.bg4} 0%, transparent 70%)`,
              bottom: '-5%',
              left: '30%',
              opacity: 0.6,
            }}
          />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6">
          <Link href="/" className="text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors">
            ← Default
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/aurora" className="text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors">
              Aurora
            </Link>
            <Link href="/sensorial" className="text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors">
              Sensorial
            </Link>
          </div>
        </nav>

        {/* Content */}
        <div className="relative z-10 max-w-lg mx-auto px-5 pb-20">
          {isLoading && !weatherData ? (
            <div className="pt-20"><WeatherSkeleton /></div>
          ) : (
            <>
              {/* Hero frosted card */}
              <FrostedCard className="mt-2 text-center py-10 px-8">
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-stone-400 mb-5">{location}</p>

                <div className="flex items-center justify-center gap-2 mb-2">
                  {weatherData?.weather?.[0]?.icon && (
                    <WeatherIcon iconCode={weatherData.weather[0].icon} size={60} />
                  )}
                  <span className="text-[5.5rem] leading-none font-bold tracking-[-0.06em] text-stone-800">
                    {weatherData ? toTemp(weatherData.main.temp) : '--'}°
                  </span>
                </div>

                <p className="text-base text-stone-500 capitalize mb-1">
                  {weatherData?.weather?.[0]?.description}
                </p>

                <p className="text-sm text-stone-400 italic mt-2 max-w-xs mx-auto">
                  {funnyLine}
                </p>

                <div className="flex justify-center gap-2 mt-6">
                  {['C', 'F'].map((u) => (
                    <button
                      key={u}
                      onClick={() => handleSetUnit(u)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        unit === u
                          ? 'bg-stone-800 text-white'
                          : 'bg-white/50 text-stone-500 border border-stone-200/50'
                      }`}
                    >
                      °{u}
                    </button>
                  ))}
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/50 text-stone-500 border border-stone-200/50 hover:bg-white/70 transition-all ml-1"
                  >
                    ↻
                  </button>
                </div>
              </FrostedCard>

              {/* Conditions grid */}
              {weatherData && (
                <div className="grid grid-cols-3 gap-2.5 mt-3">
                  {[
                    { label: 'Feels Like', value: `${toTemp(weatherData.main.feels_like)}°` },
                    { label: 'Humidity', value: `${weatherData.main.humidity}%` },
                    { label: 'Wind', value: unit === 'C' ? `${(weatherData.wind.speed * 3.6).toFixed(0)} km/h` : `${(weatherData.wind.speed * 2.237).toFixed(0)} mph` },
                    { label: 'Sunrise', value: sunrise },
                    { label: 'Sunset', value: sunset },
                    { label: 'Pressure', value: `${weatherData.main.pressure}` },
                  ].map((item) => (
                    <FrostedCard key={item.label} className="text-center py-4 px-3">
                      <div className="text-lg font-bold text-stone-700 tabular-nums">{item.value}</div>
                      <div className="text-[0.65rem] text-stone-400 mt-1 tracking-wide uppercase">{item.label}</div>
                    </FrostedCard>
                  ))}
                </div>
              )}

              {/* Hourly */}
              {hourlyData.length > 0 && (
                <FrostedCard padding={false} className="mt-3 p-4">
                  <p className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-400 mb-3 px-1">Hourly</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
                    {hourlyData.map((hour) => (
                      <div key={hour.dt} className="flex flex-col items-center min-w-[60px] py-2 px-1">
                        <span className="text-[0.7rem] text-stone-400 mb-1">
                          {new Date(hour.dt * 1000).getHours()}:00
                        </span>
                        <WeatherIcon iconCode={hour.weather[0].icon} size={30} className="my-0.5" />
                        <span className="text-sm font-bold text-stone-700">{toTemp(hour.main.temp)}°</span>
                        {hour.pop > 0.1 && (
                          <span className="text-[0.6rem] text-blue-400 mt-0.5">{Math.round(hour.pop * 100)}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                </FrostedCard>
              )}

              {/* Daily forecast */}
              {dailyForecast.length > 0 && (
                <FrostedCard padding={false} className="mt-3 overflow-hidden">
                  <p className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-400 px-5 pt-5 pb-2">5-Day</p>
                  <div className="divide-y divide-stone-200/40">
                    {dailyForecast.map((day) => (
                      <div key={day.date} className="flex items-center px-5 py-3.5">
                        <span className="w-10 text-sm text-stone-500">
                          {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                        </span>
                        <WeatherIcon iconCode={day.icon} size={30} className="mx-3" />
                        <span className="text-xs text-stone-400">{day.condition}</span>
                        <span className="ml-auto tabular-nums text-sm">
                          <span className="font-bold text-stone-700">{toTemp(day.max)}°</span>
                          <span className="text-stone-300 mx-1">/</span>
                          <span className="text-stone-400">{toTemp(day.min)}°</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </FrostedCard>
              )}

              {/* Sky palette */}
              <FrostedCard className="mt-3">
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-400 mb-3">Sky Palette</p>
                <div
                  className="h-10 rounded-2xl mb-3"
                  style={{ background: `linear-gradient(135deg, ${skyPalette.join(', ')})` }}
                />
                <div className="flex justify-between">
                  {skyPalette.map((c, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                      <span className="text-[0.55rem] text-stone-400 mt-1 font-mono">{c}</span>
                    </div>
                  ))}
                </div>
              </FrostedCard>

              {/* Haiku */}
              {haiku && (
                <div className="mt-10 text-center pb-4">
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