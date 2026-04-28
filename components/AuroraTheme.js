import React from 'react';
import WeatherIcon from './WeatherIcon';
import WeatherInsights from './WeatherInsights';
import { getSkyPalette } from './SkyPalette';

/*
 * AURORA THEME
 * Warm cream canvas with flowing gradient blobs.
 * Editorial serif typography. Weather as feeling, not just data.
 */

const conditionVibes = {
  Clear:        { bg: '#FBF8F3', bgDark: '#1a1816', blob1: '#FDDCB5', blob2: '#C4E8C2', blob3: '#B3D9F7', blob1Dark: '#5c3d1a', blob2Dark: '#1e3d1c', blob3Dark: '#1a2d40', word: 'Radiant' },
  Clouds:       { bg: '#F5F3F0', bgDark: '#1a1918', blob1: '#D7CFF8', blob2: '#C8D6E5', blob3: '#E8DDD4', blob1Dark: '#2d2648', blob2Dark: '#1e2838', blob3Dark: '#3a2e24', word: 'Veiled' },
  Rain:         { bg: '#F0F2F5', bgDark: '#161a1e', blob1: '#A8C8F0', blob2: '#C5B3E8', blob3: '#8FB8D0', blob1Dark: '#1a2840', blob2Dark: '#2a1e3d', blob3Dark: '#162530', word: 'Tender' },
  Drizzle:      { bg: '#F3F5F7', bgDark: '#171a1c', blob1: '#B8D8F0', blob2: '#D2C8E8', blob3: '#C0DDE8', blob1Dark: '#1c2d3d', blob2Dark: '#2a2438', blob3Dark: '#1c2d35', word: 'Gentle' },
  Thunderstorm: { bg: '#F0EEF3', bgDark: '#18161c', blob1: '#C5A8E0', blob2: '#9898C8', blob3: '#E0C8D8', blob1Dark: '#2d1a40', blob2Dark: '#1e1e35', blob3Dark: '#3a2430', word: 'Electric' },
  Snow:         { bg: '#FAFBFC', bgDark: '#1a1b1d', blob1: '#D0E8F0', blob2: '#E0E8F0', blob3: '#C8D8E8', blob1Dark: '#1a2830', blob2Dark: '#1e2530', blob3Dark: '#1c2430', word: 'Hushed' },
  Mist:         { bg: '#F5F5F3', bgDark: '#1a1a18', blob1: '#D8D4CC', blob2: '#C8C8C0', blob3: '#E0DCD4', blob1Dark: '#2a2820', blob2Dark: '#242420', blob3Dark: '#2e2c24', word: 'Soft' },
  Fog:          { bg: '#F3F3F0', bgDark: '#191918', blob1: '#D0CCC4', blob2: '#C0BEB8', blob3: '#D8D4CC', blob1Dark: '#28261e', blob2Dark: '#22201c', blob3Dark: '#2a2820', word: 'Dreamy' },
  Haze:         { bg: '#F8F5F0', bgDark: '#1c1a16', blob1: '#E8D8B8', blob2: '#D0C8B0', blob3: '#F0E8D0', blob1Dark: '#3a2e1a', blob2Dark: '#2e2818', blob3Dark: '#3d3420', word: 'Hazy' },
};

export default function AuroraTheme({
  location, unit, weatherData, forecastData, isLoading, weatherCondition,
  handleSetUnit, toTemp, handleRefresh, funnyLine, haiku,
  hourlyData, dailyForecast, palette, ThemePicker, alerts, darkMode, setDarkMode, profanityMode,
}) {
  if (!weatherData) return null;

  const vibe = conditionVibes[weatherCondition] || conditionVibes.Clear;
  const d = darkMode;
  const bg = d ? vibe.bgDark : vibe.bg;
  const b1 = d ? vibe.blob1Dark : vibe.blob1;
  const b2 = d ? vibe.blob2Dark : vibe.blob2;
  const b3 = d ? vibe.blob3Dark : vibe.blob3;
  const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Dark-aware color helpers
  const textPrimary = d ? 'text-stone-100' : 'text-stone-900';
  const textSecondary = d ? 'text-stone-400' : 'text-stone-500';
  const textTertiary = d ? 'text-stone-500' : 'text-stone-400';
  const cardBg = d ? 'bg-white/[0.06] border-white/[0.08]' : 'bg-white/50 border-stone-200/40';
  const btnActive = d ? 'bg-white text-stone-900' : 'bg-stone-800 text-white';
  const btnInactive = d ? 'bg-white/10 text-stone-400 border border-white/10' : 'bg-white/60 text-stone-500 border border-stone-200/60';

  return (
    <div
      className="min-h-full font-sans antialiased transition-colors duration-[2000ms] relative rounded-[2rem] overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      {/* Flowing gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full aurora-blob-1"
          style={{ background: `radial-gradient(circle, ${b1} 0%, transparent 70%)`, top: '-15%', right: '-10%', opacity: d ? 0.5 : 0.6 }} />
        <div className="absolute w-[500px] h-[500px] rounded-full aurora-blob-2"
          style={{ background: `radial-gradient(circle, ${b2} 0%, transparent 70%)`, bottom: '10%', left: '-8%', opacity: d ? 0.4 : 0.5 }} />
        <div className="absolute w-[400px] h-[400px] rounded-full aurora-blob-3"
          style={{ background: `radial-gradient(circle, ${b3} 0%, transparent 70%)`, top: '45%', left: '40%', opacity: d ? 0.35 : 0.4 }} />
      </div>

      {/* Top bar with controls — hidden on mobile (uses mobile header menu) */}
      <div className="relative z-20 hidden md:flex justify-end items-center gap-2 px-6 pt-5">
        <button onClick={handleRefresh}
          className={`p-1.5 rounded-full text-xs font-bold transition-all ${btnInactive} hover:opacity-80`}>
          ↻
        </button>
        <button onClick={() => setDarkMode((prev) => !prev)}
          aria-label="Toggle dark mode"
          className={`p-1.5 rounded-full transition-all ${btnInactive} hover:opacity-80`}>
          {d ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <div className="flex gap-1.5">
          {['C', 'F'].map((u) => (
            <button key={u} onClick={() => handleSetUnit(u)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${unit === u ? btnActive : btnInactive}`}>
              °{u}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pb-20">
        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="mb-4">
            {alerts.map((alert, i) => (
              <div key={i} className={`rounded-2xl px-5 py-3 mb-2 text-left ${d ? 'bg-amber-900/30 border border-amber-700/40' : 'bg-amber-100/80 backdrop-blur-sm border border-amber-300/60'}`}>
                <p className={`text-[0.85rem] font-semibold ${d ? 'text-amber-300' : 'text-amber-800'}`}>{alert.event}</p>
                <p className={`text-[0.78rem] mt-0.5 line-clamp-2 ${d ? 'text-amber-400' : 'text-amber-700'}`}>{alert.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Hero */}
        <div className="pt-4 pb-10 text-center">
          <p className={`text-xs font-semibold tracking-[0.25em] uppercase ${textSecondary} mb-6`}>{location}</p>

          <h1 className={`text-[5rem] sm:text-[6.5rem] leading-[0.9] font-bold tracking-[-0.04em] ${textPrimary} mb-4`}
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            {vibe.word}
          </h1>

          <div className="flex items-center justify-center gap-2 mb-4">
            {weatherData?.weather?.[0]?.icon && <WeatherIcon iconCode={weatherData.weather[0].icon} size={56} />}
            <span className={`text-[4.5rem] leading-none font-bold tracking-[-0.06em] ${textPrimary}`}>
              {toTemp(weatherData.main.temp)}°
            </span>
          </div>

          <p className={`text-lg ${textSecondary} max-w-sm mx-auto leading-relaxed`}>{funnyLine}</p>
        </div>

        {/* Orb */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="w-48 h-48 rounded-full sensorial-sphere"
              style={{ background: `conic-gradient(from 120deg, ${palette[0]}, ${palette[1]}, ${palette[2]}, ${palette[3]}, ${palette[4]}, ${palette[0]})` }} />
            <div className="absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(circle at 35% 35%, ${d ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)'} 0%, transparent 60%)` }} />
          </div>
        </div>

        {/* Conditions */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-8">
          {[
            { label: 'Feels Like', value: `${toTemp(weatherData.main.feels_like)}°` },
            { label: 'Humidity', value: `${weatherData.main.humidity}%` },
            { label: 'Wind', value: unit === 'C' ? `${(weatherData.wind.speed * 3.6).toFixed(0)} km/h` : `${(weatherData.wind.speed * 2.237).toFixed(0)} mph` },
            { label: 'Sunrise', value: sunrise },
            { label: 'Sunset', value: sunset },
            { label: 'Visibility', value: weatherData.visibility != null ? `${(weatherData.visibility / 1000).toFixed(0)} km` : '--' },
          ].map((item) => (
            <div key={item.label} className={`backdrop-blur-sm rounded-2xl border px-4 py-4 text-center ${cardBg}`}>
              <div className={`text-[0.65rem] tracking-wide uppercase mb-1 ${textTertiary}`}>{item.label}</div>
              <div className={`text-lg font-bold tabular-nums ${textPrimary}`}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="mb-8">
          <WeatherInsights weatherData={weatherData} forecastData={forecastData} unit={unit} toTemp={toTemp} profanityMode={profanityMode}
            cardClassName={`backdrop-blur-sm border ${cardBg}`}
            headingClassName={`text-[1.02rem] font-bold tracking-[-0.03em] ${textPrimary}`}
            textClassName={`text-[1.25rem] leading-[1.3] tracking-[0.02em] ${d ? 'text-stone-300' : 'text-stone-800'}`} />
        </div>

        {/* Hourly */}
        {hourlyData.length > 0 && (
          <div className="mb-8">
            <p className={`text-xs font-semibold tracking-[0.15em] uppercase ${textSecondary} mb-3`}>Hourly</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pb-2">
              {hourlyData.slice(0, 8).map((hour) => (
                <div key={hour.dt} className={`backdrop-blur-sm rounded-2xl border px-2 py-3 text-center ${cardBg}`}>
                  <div className={`text-[0.7rem] ${textSecondary} mb-0.5`}>{new Date(hour.dt * 1000).getHours()}:00</div>
                  <WeatherIcon iconCode={hour.weather[0].icon} size={32} className="mx-auto my-0.5" />
                  <div className={`text-sm font-bold ${textPrimary}`}>{toTemp(hour.main.temp)}°</div>
                  {hour.pop > 0.1 && <div className="text-[0.6rem] font-medium text-blue-400 mt-0.5">{Math.round(hour.pop * 100)}%</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5-Day */}
        {dailyForecast.length > 0 && (
          <div className={`backdrop-blur-sm rounded-3xl border overflow-hidden mb-8 ${cardBg}`}>
            <p className={`text-xs font-semibold tracking-[0.15em] uppercase ${textSecondary} px-5 pt-5 pb-2`}>5-Day</p>
            <div className={`divide-y ${d ? 'divide-white/[0.06]' : 'divide-stone-200/40'}`}>
              {dailyForecast.map((day) => (
                <div key={day.date} className="flex items-center px-5 py-3.5">
                  <span className={`w-10 text-sm font-medium ${d ? 'text-stone-300' : 'text-stone-700'}`}>{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                  <WeatherIcon iconCode={day.icon} size={32} className="mx-3" />
                  <span className={`text-xs ${textSecondary}`}>{day.condition}</span>
                  <span className="ml-auto tabular-nums text-sm">
                    <span className={`font-bold ${textPrimary}`}>{toTemp(day.max)}°</span>
                    <span className={textTertiary}> / </span>
                    <span className={textSecondary}>{toTemp(day.min)}°</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sky palette */}
        <div className={`backdrop-blur-sm rounded-3xl border p-5 mb-8 ${cardBg}`}>
          <p className={`text-xs font-semibold tracking-[0.15em] uppercase ${textSecondary} mb-3`}>Sky Palette</p>
          <div className="h-12 rounded-2xl mb-3" style={{ background: `linear-gradient(135deg, ${palette.join(', ')})` }} />
          <div className="flex justify-between">
            {palette.map((c, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full border-2 shadow-sm ${d ? 'border-stone-700' : 'border-white'}`} style={{ backgroundColor: c }} />
                <span className={`text-[0.55rem] ${textTertiary} mt-1 font-mono`}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Haiku */}
        {haiku && (
          <div className="text-center pt-4 pb-8">
            <p className={`text-xl leading-relaxed ${textSecondary} italic whitespace-pre-line`}
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{haiku}</p>
          </div>
        )}
      </div>
    </div>
  );
}
