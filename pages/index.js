import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import WeatherCard from '../components/WeatherCard';
import ConditionsPanel from '../components/ConditionsPanel';
import HourlyForecast from '../components/HourlyForecast';
import DailyForecast from '../components/DailyForecast';
import WeatherInsights, { weatherHaikus } from '../components/WeatherInsights';
import ShareCard from '../components/ShareCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { WeatherSkeleton } from '../components/Skeleton';

const API_KEY = '07aa3d7c5e90fe9b7f274297ee14f5c1';
const DEFAULT_CITY = 'New York';

const funnyWeatherLines = {
  Clear: [
    'The sun showed up and chose violence ☀️',
    'Not a cloud in sight. Suspiciously optimistic.',
    'Sunglasses weather. You deserve this.',
    'The sky is flirting with you today.',
    'Golden hour all day. Go outside, you goblin.',
    'Plot twist: the weather is actually nice.',
  ],
  Clouds: [
    'Cloudy with a chance of deep thoughts ☁️',
    'Overcast and overthinking.',
    'The sky is buffering.',
    'Mood: grey but make it aesthetic.',
    'Cloud coverage: 100%. Motivation: 0%.',
    'Perfect weather for doing absolutely nothing.',
  ],
  Rain: [
    'Your umbrella is in the trunk, isn’t it?',
    'A rainy stretch with quiet streets and silver skies.',
    'Nature’s way of saying stay home and binge something.',
    'Dancing in the rain sounds fun until your socks get wet.',
    'It’s raining. Your hair didn’t stand a chance.',
    'Rain check on your plans. Literally.',
  ],
  Drizzle: [
    'Barely rain. Like the sky changed its mind 💧',
    'Sprinkle vibes only.',
    'The sky is spitting. Rude.',
    'Not enough to cancel plans. Unfortunately.',
    'Is it raining? Technically.',
  ],
  Thunderstorm: [
    'Thor is practicing again ⚡',
    'Time to reenact dramatic movie scenes.',
    'The sky is having a tantrum.',
    'Perfect ambiance for an existential crisis.',
    'Nature’s surround sound system is ON.',
    'Free light show, no tickets needed.',
  ],
  Snow: [
    'Fluffy sky sadness ❄️',
    'Snow excuse to stay inside.',
    'Winter has entered the chat.',
    'The world is a snow globe. You’re the figurine.',
    'Hot cocoa is now a medical necessity.',
    'Snow day! Or as adults call it… a day.',
  ],
  Mist: [
    'It’s misty. So mysterious 🌫️',
    'Where’s the Sherlock theme?',
    'Main character energy. Zero visibility.',
    'The vibes are immaculate. The roads are not.',
  ],
  Fog: [
    'Spooky air. Bring a flashlight.',
    'Like walking through a dream.',
    'Silent Hill weather. Stay close.',
    'You can’t see the future. Or the road.',
  ],
  Haze: [
    'Feels like someone smeared the air.',
    'Soft-filter life.',
    'The sky got lazy with the render distance.',
    'Everything looks like a 90s music video.',
  ],
  Smoke: [
    "Air's got some extra seasoning 🔥",
    'Smokey vibes. Not the fun kind.',
    'The air is being dramatic today.',
  ],
  Dust: [
    'It’s exfoliation weather 💨',
    'Free dermabrasion from Mother Nature.',
    'Close your windows. And your mouth.',
  ],
};

function normalizeCityList(cities) {
  const seen = new Set();
  return cities.filter((city) => {
    const key = city.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Simple in-memory cache for API responses
const weatherCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = weatherCache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  weatherCache.delete(key);
  return null;
}

function setCache(key, data) {
  weatherCache.set(key, { data, ts: Date.now() });
}

export default function Home() {
  const [cityList, setCityList] = useState([]);
  const [location, setLocation] = useState(DEFAULT_CITY);
  const [unit, setUnit] = useState('C');
  const [input, setInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const debounceRef = useRef(null);
  const shareCardRef = useRef(null);

  // Set body layout class
  useEffect(() => {
    document.body.classList.add('layout-default');
    document.body.classList.remove('layout-variant');
    return () => document.body.classList.remove('layout-default');
  }, []);

  // Persist and restore dark mode preference + detect system preference
  useEffect(() => {
    const stored = window.localStorage.getItem('tales-of-sky-dark');
    if (stored !== null) {
      setDarkMode(stored === 'true');
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    window.localStorage.setItem('tales-of-sky-dark', String(darkMode));
  }, [darkMode]);

  // Persist and restore unit preference
  useEffect(() => {
    const storedUnit = window.localStorage.getItem('tales-of-sky-unit');
    if (storedUnit === 'C' || storedUnit === 'F') setUnit(storedUnit);
  }, []);

  const handleSetUnit = useCallback((u) => {
    setUnit(u);
    window.localStorage.setItem('tales-of-sky-unit', u);
  }, []);

  useEffect(() => {
    const storedCities = window.localStorage.getItem('tales-of-sky-cities');
    if (storedCities) {
      try {
        const parsedCities = JSON.parse(storedCities);
        if (Array.isArray(parsedCities) && parsedCities.length) {
          setCityList(normalizeCityList(parsedCities));
        }
      } catch (storageError) {
        console.error('Failed to read saved cities', storageError);
      }
    }

    const fetchInitialCity = async () => {
      try {
        const response = await fetch('https://ipapi.co/json');
        const data = await response.json();
        await fetchWeather(data?.city || DEFAULT_CITY);
      } catch {
        await fetchWeather(DEFAULT_CITY);
      }
    };

    fetchInitialCity();
  }, []);

  useEffect(() => {
    if (!cityList.length) return;
    window.localStorage.setItem('tales-of-sky-cities', JSON.stringify(cityList));
  }, [cityList]);

  const toTemp = useCallback((temp) => {
    if (typeof temp !== 'number') return '--';
    return unit === 'C' ? Math.round(temp) : Math.round(temp * 9 / 5 + 32);
  }, [unit]);

  const fetchForecast = async (lat, lon) => {
    const cacheKey = `forecast-${lat.toFixed(2)}-${lon.toFixed(2)}`;
    const cached = getCached(cacheKey);
    if (cached) { setForecastData(cached); return; }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    const result = data?.list ? data : null;
    if (result) setCache(cacheKey, result);
    setForecastData(result);
  };

  const updateRecentCities = (cityName, isSearch) => {
    setCityList((previousCities) => {
      const baseCities = previousCities.length ? previousCities : [location];
      const exists = baseCities.some((city) => city.toLowerCase() === cityName.toLowerCase());

      if (!isSearch && exists) {
        return normalizeCityList(baseCities);
      }

      const filtered = baseCities.filter((city) => city.toLowerCase() !== cityName.toLowerCase());
      return normalizeCityList([cityName, ...filtered]);
    });
  };

  const fetchWeather = async (city, isSearch = false, skipCache = false) => {
    const trimmedCity = city?.trim();
    if (!trimmedCity) return;

    setIsLoading(true);
    setError('');

    const cacheKey = `weather-${trimmedCity.toLowerCase()}`;
    if (!skipCache) {
      const cached = getCached(cacheKey);
      if (cached) {
        setLocation(cached.name);
        setWeatherData(cached);
        setInput('');
        updateRecentCities(cached.name, isSearch);
        await fetchForecast(cached.coord.lat, cached.coord.lon);
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(trimmedCity)}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (Number(data.cod) !== 200) {
        setError('City not found');
        setIsLoading(false);
        return;
      }

      setCache(cacheKey, data);
      setLocation(data.name);
      setWeatherData(data);
      setInput('');
      updateRecentCities(data.name, isSearch);
      await fetchForecast(data.coord.lat, data.coord.lon);
    } catch (requestError) {
      console.error('Weather fetch failed', requestError);
      setError('Could not load weather right now');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(() => {
    if (location) fetchWeather(location, false, true);
  }, [location]);

  const removeCity = useCallback((cityToRemove) => {
    setCityList((prev) => prev.filter((c) => c.toLowerCase() !== cityToRemove.toLowerCase()));
  }, []);

  const weatherCondition = weatherData?.weather?.[0]?.main;
  const funnyLine = useMemo(() => {
    const lines = funnyWeatherLines[weatherCondition];
    return lines ? lines[Math.floor(Math.random() * lines.length)] : 'Weather is undecided.';
  }, [weatherCondition]);

  const haiku = useMemo(() => {
    const lines = weatherHaikus[weatherCondition] || weatherHaikus['Clear'];
    return lines ? lines[Math.floor(Math.random() * lines.length)] : null;
  }, [weatherCondition]);

  // Debounced city autosuggest via OpenWeatherMap Geocoding API
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = input.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(trimmed)}&limit=5&appid=${API_KEY}`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setSuggestions(data.map((d) => ({ name: d.name, state: d.state || '', country: d.country, lat: d.lat, lon: d.lon })));
        }
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [input]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setSuggestions([]);
    setInput('');
    fetchWeather(suggestion.name, true);
  }, []);

  const handleSearch = useCallback(() => {
    setSuggestions([]);
    fetchWeather(input, true);
  }, [input]);

  // Weather alerts from API (if available)
  const alerts = weatherData?.alerts || [];

  const displayCities = cityList.length ? cityList : [location];

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <title>{`Tales of Sky — ${location}`}</title>
        <meta name="description" content={`Weather for ${location}. ${weatherData ? `${Math.round(weatherData.main.temp)}°C, ${weatherData.weather?.[0]?.description}` : 'Beautifully told weather.'}`} />
        <meta property="og:title" content={`Tales of Sky — ${location}`} />
        <meta property="og:description" content={`Weather for ${location}, beautifully told.`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`Tales of Sky — ${location}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        />

        <main className="flex-1 m-1.5 px-5 sm:px-10 pt-16 md:pt-12 pb-12 bg-taupe-50 dark:bg-taupe-900 overflow-y-auto max-h-[calc(100vh-12px)] rounded-[2rem] relative">
          <div className="absolute top-4 right-5 flex items-center space-x-2 z-10">
            {/* Variant links */}
            <div className="hidden md:flex items-center gap-1 mr-2">
              <Link href="/aurora" className="px-2.5 py-1 rounded-full text-[0.7rem] font-medium text-taupe-400 hover:text-taupe-600 dark:text-taupe-500 dark:hover:text-taupe-300 hover:bg-taupe-100 dark:hover:bg-taupe-800 transition-colors">
                Aurora
              </Link>
              <Link href="/glass" className="px-2.5 py-1 rounded-full text-[0.7rem] font-medium text-taupe-400 hover:text-taupe-600 dark:text-taupe-500 dark:hover:text-taupe-300 hover:bg-taupe-100 dark:hover:bg-taupe-800 transition-colors">
                Glass
              </Link>
              <Link href="/sensorial" className="px-2.5 py-1 rounded-full text-[0.7rem] font-medium text-taupe-400 hover:text-taupe-600 dark:text-taupe-500 dark:hover:text-taupe-300 hover:bg-taupe-100 dark:hover:bg-taupe-800 transition-colors">
                Sensorial
              </Link>
            </div>
            {/* Share button */}
            <button
              onClick={() => shareCardRef.current?.download()}
              aria-label="Download share card"
              className="p-1.5 rounded-full border border-taupe-200 dark:border-taupe-700 text-taupe-400 dark:text-taupe-500 bg-white dark:bg-taupe-800 hover:bg-taupe-100 dark:hover:bg-taupe-700 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
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

          {/* Hidden share card canvas */}
          <ShareCard ref={shareCardRef} weatherData={weatherData} unit={unit} toTemp={toTemp} funnyLine={funnyLine} />

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
                <WeatherInsights weatherData={weatherData} forecastData={forecastData} unit={unit} toTemp={toTemp} />
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
      </div>
    </>
  );
}
