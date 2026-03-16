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
 * Frosted glass panels float over a soft gradient backdrop.
 * Deep depth-of-field feeling via layered blur.
 * Inspired by: iOS control center, visionOS, frosted glass UI.
 */

function GlassCard({ children, className = '', padding = true }) {
  return (
    <div className={`glass-card rounded-3xl border border-white/20 shadow-lg shadow-black/5 ${padding ? 'p-6' : ''} ${className}`}>
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

  const palette = useMemo(() => {
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

  const bgGradient = useMemo(() => {
    return `
      radial-gradient(ellipse at 30% 0%, ${palette[0]}60 0%, transparent 60%),
      radial-gradient(ellipse at 70% 100%, ${palette[2]}50 0%, transparent 60%),
      radial-gradient(ellipse at 100% 50%, ${palette[4]}40 0%, transparent 60%),
      linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)
    `;
  }, [palette]);

  const sunrise = weatherData ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
  const sunset = weatherData ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';

  return (
    <>
      <Head>
        <title>{`Glass — ${location} — Tales of Sky`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className="min-h-screen font-sans antialiased text-white relative overflow-y-auto"
        style={{ background: bgGradient }}
      >
        {/* Ambient blurred circles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl" style={{ background: palette[0] }} />
          <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: palette[2] }} />
          <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full opacity-25 blur-3xl" style={{ background: palette[4] }} />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6">
          <Link href="/" className="text-sm font-medium text-white/50 hover:text-white/80 transition-colors">
            ← Default
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/aurora" className="text-sm font-medium text-white/50 hover:text-white/80 transition-colors">
              Aurora
            </Link>
            <Link href="/sensorial" className="text-sm font-medium text-white/50 hover:text-white/80 transition-colors">
              Sensorial
            </Link>
          </div>
        </nav>

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto px-6 pb-16">
          {isLoading && !weatherData ? (
            <div className="pt-20"><WeatherSkeleton /></div>
          ) : (
            <>
              {/* Hero glass card */}
              <GlassCard className="mt-4 text-center">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-4">{location}</p>

                <div className="flex items-center justify-center gap-3 mb-3">
                  {weatherData?.weather?.[0]?.icon && (
                    <WeatherIcon iconCode={weatherData.weather[0].icon} size={64} />
                  )}
                  <span className="text-[6rem] leading-none font-bold tracking-[-0.06em]">
                    {weatherData ? toTemp(weatherData.main.temp) : '--'}°
                  </span>
                </div>

                {/* Description */}
                <p className="text-lg text-white/70 capitalize mb-1">
                  {weatherData?.weather?.[0]?.description}
                </p>

                {/* Funny line */}
                <p className="text-base text-white/40 italic mt-2">
                  {funnyLine}
                </p>

                {/* Unit toggle */}
                <div className="flex justify-center gap-2 mt-5">
                  {['C', 'F'].map((u) => (
                    <button
                      key={u}
                      onClick={() => handleSetUnit(u)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        unit === u
                          ? 'bg-white/90 text-gray-900'
                          : 'bg-white/10 text-white/50 border border-white/10 hover:bg-white/20'
                      }`}
                    >
                      °{u}
                    </button>
                  ))}
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white/50 border border-white/10 hover:bg-white/20 transition-all ml-2"
                  >
                    ↻
                  </button>
                </div>
              </GlassCard>

              {/* Conditions — glass grid */}
              {weatherData && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: 'Feels Like', value: `${toTemp(weatherData.main.feels_like)}°${unit}`, icon: '🌡️' },
                    { label: 'Humidity', value: `${weatherData.main.humidity}%`, icon: '💧' },
                    { label: 'Wind', value: unit === 'C' ? `${(weatherData.wind.speed * 3.6).toFixed(0)} km/h` : `${(weatherData.wind.speed * 2.237).toFixed(0)} mph`, icon: '💨' },
                    { label: 'Sunrise', value: sunrise, icon: '🌅' },
                    { label: 'Sunset', value: sunset, icon: '🌇' },
                    { label: 'Pressure', value: `${weatherData.main.pressure}`, icon: '🔵' },
                  ].map((item) => (
                    <GlassCard key={item.label} className="text-center py-5 px-3">
                      <div className="text-lg mb-1">{item.icon}</div>
                      <div className="text-lg font-bold text-white/90">{item.value}</div>
                      <div className="text-[0.7rem] text-white/40 mt-1 tracking-wide uppercase">{item.label}</div>
                    </GlassCard>
                  ))}
                </div>
              )}

              {/* Hourly — glass horizontal scroll */}
              {hourlyData.length > 0 && (
                <div className="mt-4">
                  <GlassCard padding={false} className="p-4">
                    <p className="text-xs font-semibold tracking-[0.15em] uppercase text-white/30 mb-3 px-2">Hourly</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-2">
                      {hourlyData.map((hour) => (
                        <div key={hour.dt} className="flex flex-col items-center min-w-[60px] py-2">
                          <span className="text-xs text-white/40 mb-1">
                            {new Date(hour.dt * 1000).getHours()}:00
                          </span>
                          <WeatherIcon iconCode={hour.weather[0].icon} size={32} className="my-0.5" />
                          <span className="text-sm font-bold text-white/90">{toTemp(hour.main.temp)}°</span>
                          {hour.pop > 0.1 && (
                            <span className="text-[0.65rem] text-blue-300 mt-0.5">{Math.round(hour.pop * 100)}%</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* Daily forecast */}
              {dailyForecast.length > 0 && (
                <GlassCard padding={false} className="mt-4 overflow-hidden">
                  <p className="text-xs font-semibold tracking-[0.15em] uppercase text-white/30 px-6 pt-5 pb-2">5-Day</p>
                  <div className="divide-y divide-white/10">
                    {dailyForecast.map((day) => (
                      <div key={day.date} className="flex items-center px-6 py-3.5">
                        <span className="w-10 text-sm text-white/50">
                          {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                        </span>
                        <WeatherIcon iconCode={day.icon} size={32} className="mx-3" />
                        <span className="text-xs text-white/40">{day.condition}</span>
                        <span className="ml-auto tabular-nums text-sm">
                          <span className="font-bold text-white/90">{toTemp(day.max)}°</span>
                          <span className="text-white/30 mx-1">/</span>
                          <span className="text-white/40">{toTemp(day.min)}°</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Sky palette */}
              {palette && (
                <GlassCard className="mt-4">
                  <p className="text-xs font-semibold tracking-[0.15em] uppercase text-white/30 mb-3">Sky Palette</p>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: `linear-gradient(to right, ${palette.join(', ')})` }} />
                  <div className="flex justify-between mt-2">
                    {palette.map((c, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                        <span className="text-[0.55rem] text-white/30 mt-1 font-mono">{c}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Haiku */}
              {haiku && (
                <div className="mt-10 text-center">
                  <p
                    className="text-lg leading-relaxed text-white/30 italic whitespace-pre-line"
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
