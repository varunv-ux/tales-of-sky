import React, { useCallback } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import WeatherCard from '../components/WeatherCard';
import ConditionsPanel from '../components/ConditionsPanel';
import HourlyForecast from '../components/HourlyForecast';
import DailyForecast from '../components/DailyForecast';
import WeatherInsights from '../components/WeatherInsights';
import ErrorBoundary from '../components/ErrorBoundary';
import { WeatherSkeleton } from '../components/Skeleton';
import AuroraTheme from '../components/AuroraTheme';
import useWeatherData from '../hooks/useWeatherData';

export default function Home() {
  const {
    location, unit, input, setInput,
    weatherData, forecastData, isLoading, error,
    sidebarOpen, setSidebarOpen, suggestions, darkMode, setDarkMode,
    theme, handleSetTheme,
    handleSetUnit, toTemp, handleRefresh, removeCity,
    funnyLine, haiku, weatherCondition, displayCities,
    fetchWeather, handleSearch, handleSuggestionClick,
    palette, hourlyData, dailyForecast, alerts,
    profanityMode, handleSetProfanityMode,
  } = useWeatherData();

  // Theme picker component
  const themes = [
    { id: 'default', label: 'Classic' },
    { id: 'aurora', label: 'Aurora' },
  ];

  const ThemePicker = useCallback(() => (
    <div className="flex items-center gap-1 bg-taupe-300/40 dark:bg-taupe-800/60 rounded-full p-1">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => handleSetTheme(t.id)}
          className={`px-3 py-1.5 rounded-full text-[0.7rem] font-semibold transition-all ${
            theme === t.id
              ? 'bg-taupe-800 dark:bg-taupe-200 text-white dark:text-taupe-900 shadow-sm'
              : 'text-taupe-500 dark:text-taupe-400 hover:text-taupe-700 dark:hover:text-taupe-200 hover:bg-taupe-200/50 dark:hover:bg-taupe-700/50'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  ), [theme, handleSetTheme]);

  // Shared props for Aurora theme
  const themeProps = {
    location, unit, weatherData, forecastData, isLoading, weatherCondition,
    handleSetUnit, toTemp, handleRefresh, funnyLine, haiku,
    hourlyData, dailyForecast, palette, ThemePicker, alerts, darkMode, setDarkMode, profanityMode,
  };

  const isAurora = theme === 'aurora' && !isLoading;

  const SITE_URL = 'https://tales-of-sky-tau.vercel.app';
  const pageTitle = `Tales of Sky — ${location}`;
  const pageDesc = weatherData
    ? `Weather for ${location}: ${Math.round(weatherData.main.temp)}°C, ${weatherData.weather?.[0]?.description}. Beautifully told.`
    : `Weather for ${location}, beautifully told.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Canonical */}
        <link rel="canonical" href={SITE_URL} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Tales of Sky — Weather, beautifully told" />
        <meta property="og:site_name" content="Tales of Sky" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="twitter:image:alt" content="Tales of Sky — Weather, beautifully told" />

        {/* Additional SEO */}
        <meta name="application-name" content="Tales of Sky" />
        <meta name="keywords" content="weather, forecast, ghibli, beautiful weather app, sky, tales of sky, weather art" />
        <meta name="author" content="Tales of Sky" />
      </Head>

      <div className="flex h-screen font-sans text-taupe-800 dark:text-taupe-200 bg-taupe-200 dark:bg-taupe-950 antialiased">
        {/* Mobile header */}
        <div className="fixed top-0 left-0 right-0 z-20 flex items-center px-5 py-3 bg-taupe-200 dark:bg-taupe-950 border-b border-taupe-300 dark:border-taupe-800 md:hidden">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="p-1 mr-3 text-taupe-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="text-lg font-black tracking-[-0.04em] text-taupe-900 dark:text-taupe-100">Tales of Sky</span>
        </div>

        <Sidebar
          input={input}
          setInput={setInput}
          onSearch={handleSearch}
          error={error}
          cities={displayCities}
          activeCity={location}
          onCityClick={(city) => fetchWeather(city, false)}
          onRemoveCity={removeCity}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
          themePicker={<ThemePicker />}
        />

        {isAurora ? (
          <main className="flex-1 m-1.5 overflow-y-auto max-h-[calc(100vh-12px)] rounded-[2rem] relative">
            <AuroraTheme {...themeProps} />
          </main>
        ) : (
        <main className="flex-1 m-1.5 px-5 sm:px-10 pt-16 md:pt-12 pb-12 bg-taupe-50 dark:bg-taupe-900 overflow-y-auto max-h-[calc(100vh-12px)] rounded-[2rem] relative">
          <div className="absolute top-4 right-5 flex items-center space-x-2 z-10">
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              aria-label="Refresh weather"
              className="p-1.5 rounded-full border border-taupe-200 dark:border-taupe-700 text-taupe-400 dark:text-taupe-500 bg-white dark:bg-taupe-800 hover:bg-taupe-100 dark:hover:bg-taupe-700 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            </button>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle dark mode"
              className="p-1.5 rounded-full border border-taupe-200 dark:border-taupe-700 text-taupe-400 dark:text-taupe-500 bg-white dark:bg-taupe-800 hover:bg-taupe-100 dark:hover:bg-taupe-700 transition-colors"
            >
              {darkMode ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            {/* Profanity mode toggle */}
            <button
              onClick={() => handleSetProfanityMode(!profanityMode)}
              aria-label="Toggle profanity mode"
              title={profanityMode ? 'Profanity mode ON' : 'Profanity mode OFF'}
              className={`px-2.5 py-1 rounded-full border text-[0.7rem] font-bold tracking-[-0.02em] transition-colors ${
                profanityMode
                  ? 'bg-red-600 dark:bg-red-500 text-white border-red-600 dark:border-red-500'
                  : 'border-taupe-200 dark:border-taupe-700 text-taupe-400 dark:text-taupe-500 bg-white dark:bg-taupe-800 hover:bg-taupe-100 dark:hover:bg-taupe-700'
              }`}
            >
              🤬
            </button>
            {/* Unit toggle */}
            <div className="flex space-x-1.5">
              {['C', 'F'].map((u) => (
                <button
                  key={u}
                  onClick={() => handleSetUnit(u)}
                  aria-label={`Switch to ${u === 'C' ? 'Celsius' : 'Fahrenheit'}`}
                  className={`px-3 py-1 rounded-[999px] border text-[0.75rem] font-semibold tracking-[-0.02em] ${
                    unit === u ? 'bg-taupe-800 dark:bg-taupe-200 text-white dark:text-taupe-900 border-taupe-800 dark:border-taupe-200' : 'border-taupe-200 dark:border-taupe-700 text-taupe-500 dark:text-taupe-400 bg-white dark:bg-taupe-800'
                  }`}
                >
                  °{u}
                </button>
              ))}
            </div>
          </div>

          {/* Weather alerts banner */}
          {alerts.length > 0 && (
            <div className="mb-4 max-w-[42rem] mx-auto">
              {alerts.map((alert, i) => (
                <div key={i} className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-xl px-4 py-3 mb-2 text-left">
                  <p className="text-[0.85rem] font-semibold text-amber-800 dark:text-amber-300">{alert.event}</p>
                  <p className="text-[0.78rem] text-amber-700 dark:text-amber-400 mt-0.5 line-clamp-2">{alert.description}</p>
                </div>
              ))}
            </div>
          )}

          <div className="max-w-[42rem] mx-auto space-y-5 text-center">
            <ErrorBoundary>
            {isLoading && !weatherData ? (
              <WeatherSkeleton />
            ) : (
              <>
                <WeatherCard
                  key={location}
                  location={location}
                  weatherData={weatherData}
                  isLoading={isLoading}
                  funnyLine={funnyLine}
                  unit={unit}
                  setUnit={handleSetUnit}
                  toTemp={toTemp}
                />
                <ConditionsPanel weatherData={weatherData} unit={unit} toTemp={toTemp} />
                <WeatherInsights weatherData={weatherData} forecastData={forecastData} unit={unit} toTemp={toTemp} profanityMode={profanityMode} />
                <HourlyForecast forecastData={forecastData} unit={unit} toTemp={toTemp} />
                <DailyForecast forecastData={forecastData} unit={unit} toTemp={toTemp} />

                {/* Haiku footer */}
                {haiku && (
                  <div className="mt-12 mb-4 text-center">
                    <p className="text-[1.35rem] leading-[1.8] tracking-[0.01em] text-taupe-400 dark:text-taupe-500 whitespace-pre-line italic" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                      {haiku}
                    </p>
                  </div>
                )}
              </>
            )}
            </ErrorBoundary>
          </div>
        </main>
        )}
      </div>
    </>
  );
}
