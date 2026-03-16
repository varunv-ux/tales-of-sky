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
 * Immersive full-screen gradient mesh that reacts to weather conditions.
 * Floating ambient light orbs, no cards — information floats in space.
 * Inspired by: aurora borealis, weather as atmosphere not data.
 */

const conditionGradients = {
  Clear: {
    colors: ['#FEF3C7', '#FDE68A', '#FBCFE8', '#C4B5FD', '#93C5FD'],
    orbs: ['rgba(251,207,232,0.4)', 'rgba(196,181,253,0.3)', 'rgba(253,230,138,0.35)'],
  },
  Clouds: {
    colors: ['#E5E7EB', '#D1D5DB', '#C4B5FD', '#A5B4FC', '#CBD5E1'],
    orbs: ['rgba(196,181,253,0.25)', 'rgba(165,180,252,0.2)', 'rgba(203,213,225,0.3)'],
  },
  Rain: {
    colors: ['#1E3A5F', '#2563EB', '#3B82F6', '#6366F1', '#1E293B'],
    orbs: ['rgba(37,99,235,0.3)', 'rgba(99,102,241,0.25)', 'rgba(59,130,246,0.2)'],
  },
  Drizzle: {
    colors: ['#DBEAFE', '#93C5FD', '#A5B4FC', '#C7D2FE', '#E0E7FF'],
    orbs: ['rgba(147,197,253,0.3)', 'rgba(165,180,252,0.25)', 'rgba(199,210,254,0.3)'],
  },
  Thunderstorm: {
    colors: ['#1E1B4B', '#312E81', '#4C1D95', '#581C87', '#0F172A'],
    orbs: ['rgba(76,29,149,0.35)', 'rgba(88,28,135,0.3)', 'rgba(49,46,129,0.25)'],
  },
  Snow: {
    colors: ['#F8FAFC', '#E2E8F0', '#CBD5E1', '#BAE6FD', '#E0F2FE'],
    orbs: ['rgba(186,230,253,0.3)', 'rgba(224,242,254,0.35)', 'rgba(226,232,240,0.25)'],
  },
  Mist: {
    colors: ['#F1F5F9', '#E2E8F0', '#CBD5E1', '#D1D5DB', '#F3F4F6'],
    orbs: ['rgba(226,232,240,0.4)', 'rgba(209,213,219,0.3)', 'rgba(241,245,249,0.35)'],
  },
  Fog: {
    colors: ['#F1F5F9', '#E2E8F0', '#D1D5DB', '#9CA3AF', '#CBD5E1'],
    orbs: ['rgba(226,232,240,0.4)', 'rgba(156,163,175,0.3)', 'rgba(209,213,219,0.35)'],
  },
  Haze: {
    colors: ['#FEF3C7', '#FDE68A', '#D1D5DB', '#E5E7EB', '#F3F4F6'],
    orbs: ['rgba(253,230,138,0.3)', 'rgba(209,213,219,0.25)', 'rgba(254,243,199,0.3)'],
  },
};

function getGradient(condition) {
  return conditionGradients[condition] || conditionGradients.Clear;
}

function AuroraOrb({ color, size, x, y, delay }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none aurora-orb"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        left: x,
        top: y,
        animationDelay: delay,
        filter: 'blur(60px)',
      }}
    />
  );
}

function ConditionRow({ label, value }) {
  return (
    <div className="flex justify-between items-baseline py-2 border-b border-white/10">
      <span className="text-sm text-white/50 tracking-wide">{label}</span>
      <span className="text-lg font-semibold text-white/90 tabular-nums">{value}</span>
    </div>
  );
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

  const gradient = useMemo(() => getGradient(weatherCondition), [weatherCondition]);
  const isLight = ['Clear', 'Clouds', 'Snow', 'Mist', 'Fog', 'Haze', 'Drizzle'].includes(weatherCondition);

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

  const meshBg = useMemo(() => {
    const c = gradient.colors;
    return `
      radial-gradient(ellipse at 20% 20%, ${c[0]}90 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, ${c[1]}80 0%, transparent 50%),
      radial-gradient(ellipse at 50% 60%, ${c[2]}70 0%, transparent 50%),
      radial-gradient(ellipse at 20% 80%, ${c[3]}80 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, ${c[4]}90 0%, transparent 50%),
      linear-gradient(135deg, ${c[0]}, ${c[2]}, ${c[4]})
    `;
  }, [gradient]);

  const textColor = isLight ? 'text-gray-900' : 'text-white';
  const subTextColor = isLight ? 'text-gray-600' : 'text-white/60';
  const cardBg = isLight ? 'bg-white/30 backdrop-blur-xl border-white/40' : 'bg-white/10 backdrop-blur-xl border-white/10';

  return (
    <>
      <Head>
        <title>{`Aurora — ${location} — Tales of Sky`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className="min-h-screen relative overflow-hidden font-sans antialiased transition-all duration-[2000ms]"
        style={{ background: meshBg }}
      >
        {/* Floating orbs */}
        {gradient.orbs.map((color, i) => (
          <AuroraOrb
            key={i}
            color={color}
            size={`${300 + i * 120}px`}
            x={`${15 + i * 30}%`}
            y={`${10 + i * 25}%`}
            delay={`${i * 2}s`}
          />
        ))}

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6">
          <Link href="/" className={`text-sm font-medium ${subTextColor} hover:opacity-70 transition-opacity`}>
            ← Default
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/glass" className={`text-sm font-medium ${subTextColor} hover:opacity-70 transition-opacity`}>
              Glass
            </Link>
            <Link href="/sensorial" className={`text-sm font-medium ${subTextColor} hover:opacity-70 transition-opacity`}>
              Sensorial
            </Link>
          </div>
        </nav>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
          {isLoading && !weatherData ? (
            <div className="w-full max-w-md"><WeatherSkeleton /></div>
          ) : (
            <>
              {/* Location */}
              <p className={`text-sm font-semibold tracking-[0.2em] uppercase ${subTextColor} mb-2`}>
                {location}
              </p>

              {/* Temperature — massive, central */}
              <div className="flex items-center gap-3 mb-4">
                {weatherData?.weather?.[0]?.icon && (
                  <WeatherIcon iconCode={weatherData.weather[0].icon} size={80} />
                )}
                <span className={`text-[8rem] leading-none font-bold tracking-[-0.06em] ${textColor}`}>
                  {weatherData ? toTemp(weatherData.main.temp) : '--'}°
                </span>
              </div>

              {/* Unit toggle */}
              <div className="flex gap-2 mb-6">
                {['C', 'F'].map((u) => (
                  <button
                    key={u}
                    onClick={() => handleSetUnit(u)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${
                      unit === u
                        ? (isLight ? 'bg-gray-900 text-white' : 'bg-white text-gray-900')
                        : (isLight ? 'bg-white/30 text-gray-700 border border-white/40' : 'bg-white/10 text-white/60 border border-white/20')
                    }`}
                  >
                    °{u}
                  </button>
                ))}
              </div>

              {/* Funny line */}
              <p className={`text-xl font-medium ${subTextColor} mb-12 text-center max-w-md`}>
                {funnyLine}
              </p>

              {/* Conditions — floating pills */}
              {weatherData && (
                <div className="flex flex-wrap justify-center gap-3 mb-12 max-w-xl">
                  {[
                    { label: 'Feels', value: `${toTemp(weatherData.main.feels_like)}°` },
                    { label: 'Humidity', value: `${weatherData.main.humidity}%` },
                    { label: 'Wind', value: unit === 'C' ? `${(weatherData.wind.speed * 3.6).toFixed(0)} km/h` : `${(weatherData.wind.speed * 2.237).toFixed(0)} mph` },
                    { label: 'Pressure', value: `${weatherData.main.pressure} hPa` },
                    { label: 'Visibility', value: weatherData.visibility != null ? `${(weatherData.visibility / 1000).toFixed(0)} km` : '--' },
                  ].map((item) => (
                    <div key={item.label} className={`${cardBg} border rounded-full px-5 py-2.5 flex items-center gap-2`}>
                      <span className={`text-xs ${subTextColor}`}>{item.label}</span>
                      <span className={`text-sm font-bold ${textColor}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 5-Day Forecast — floating horizontal */}
              {dailyForecast.length > 0 && (
                <div className="flex gap-3 mb-12">
                  {dailyForecast.map((day) => (
                    <div key={day.date} className={`${cardBg} border rounded-2xl px-4 py-4 text-center min-w-[90px]`}>
                      <p className={`text-xs font-semibold ${subTextColor} mb-1`}>
                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                      </p>
                      <WeatherIcon iconCode={day.icon} size={36} className="mx-auto my-1" />
                      <p className={`text-sm font-bold ${textColor}`}>{toTemp(day.max)}°</p>
                      <p className={`text-xs ${subTextColor}`}>{toTemp(day.min)}°</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Haiku */}
              {haiku && (
                <p
                  className={`text-lg leading-relaxed text-center ${subTextColor} italic whitespace-pre-line max-w-sm`}
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  {haiku}
                </p>
              )}

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                className={`mt-8 text-xs font-medium ${subTextColor} hover:opacity-70 transition-opacity`}
              >
                Refresh ↻
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
