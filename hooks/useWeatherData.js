import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSkyPalette } from '../components/SkyPalette';
import { weatherHaikus } from '../components/WeatherInsights';

const API_KEY = process.env.NEXT_PUBLIC_OWM_API_KEY;
const DEFAULT_CITY = 'New York';

export const funnyWeatherLines = {
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
    'Your umbrella is in the trunk, isn\'t it?',
    'A rainy stretch with quiet streets and silver skies.',
    'Nature\'s way of saying stay home and binge something.',
    'Dancing in the rain sounds fun until your socks get wet.',
    'It\'s raining. Your hair didn\'t stand a chance.',
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
    'Nature\'s surround sound system is ON.',
    'Free light show, no tickets needed.',
  ],
  Snow: [
    'Fluffy sky sadness ❄️',
    'Snow excuse to stay inside.',
    'Winter has entered the chat.',
    'The world is a snow globe. You\'re the figurine.',
    'Hot cocoa is now a medical necessity.',
    'Snow day! Or as adults call it… a day.',
  ],
  Mist: [
    'It\'s misty. So mysterious 🌫️',
    'Where\'s the Sherlock theme?',
    'Main character energy. Zero visibility.',
    'The vibes are immaculate. The roads are not.',
  ],
  Fog: [
    'Spooky air. Bring a flashlight.',
    'Like walking through a dream.',
    'Silent Hill weather. Stay close.',
    'You can\'t see the future. Or the road.',
  ],
  Haze: [
    'Feels like someone smeared the air.',
    'Soft-filter life.',
    'The sky got lazy with the render distance.',
    'Everything looks like a 90s music video.',
  ],
  Smoke: [
    'Air\'s got some extra seasoning 🔥',
    'Smokey vibes. Not the fun kind.',
    'The air is being dramatic today.',
  ],
  Dust: [
    'It\'s exfoliation weather 💨',
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

const weatherCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key) {
  const entry = weatherCache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function getStaleCache(key) {
  const entry = weatherCache.get(key);
  return entry ? entry.data : null;
}

function setCache(key, data) {
  weatherCache.set(key, { data, ts: Date.now() });
}

export default function useWeatherData() {
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
  const [theme, setTheme] = useState('default');
  const [alerts, setAlerts] = useState([]);
  const debounceRef = useRef(null);

  // Theme persistence + body class
  useEffect(() => {
    const storedTheme = window.localStorage.getItem('tales-of-sky-theme');
    if (['default', 'aurora'].includes(storedTheme)) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (theme === 'default') {
      document.body.classList.add('layout-default');
      document.body.classList.remove('layout-variant');
    } else {
      document.body.classList.add('layout-variant');
      document.body.classList.remove('layout-default');
    }
    return () => {
      document.body.classList.remove('layout-default', 'layout-variant');
    };
  }, [theme]);

  const handleSetTheme = useCallback((t) => {
    setTheme(t);
    window.localStorage.setItem('tales-of-sky-theme', t);
  }, []);

  // Dark mode persistence
  useEffect(() => {
    const stored = window.localStorage.getItem('tales-of-sky-dark');
    if (stored !== null) {
      setDarkMode(stored === 'true');
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode && theme === 'default');
    window.localStorage.setItem('tales-of-sky-dark', String(darkMode));
  }, [darkMode, theme]);

  // Unit persistence
  useEffect(() => {
    const storedUnit = window.localStorage.getItem('tales-of-sky-unit');
    if (storedUnit === 'C' || storedUnit === 'F') setUnit(storedUnit);
  }, []);

  const handleSetUnit = useCallback((u) => {
    setUnit(u);
    window.localStorage.setItem('tales-of-sky-unit', u);
  }, []);

  const toTemp = useCallback((temp) => {
    if (typeof temp !== 'number') return '--';
    return unit === 'C' ? Math.round(temp) : Math.round(temp * 9 / 5 + 32);
  }, [unit]);

  const fetchForecast = async (lat, lon) => {
    const cacheKey = `forecast-${lat.toFixed(2)}-${lon.toFixed(2)}`;
    const cached = getCached(cacheKey);
    if (cached) { setForecastData(cached); return; }
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      const result = data?.list ? data : null;
      if (result) setCache(cacheKey, result);
      setForecastData(result);
    } catch {
      // Use stale cache if available
      const stale = getStaleCache(cacheKey);
      if (stale) setForecastData(stale);
    }
  };

  // Fetch weather alerts (OneCall API — may not be available on free tier)
  const fetchAlerts = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${API_KEY}`
      );
      const data = await res.json();
      setAlerts(Array.isArray(data?.alerts) ? data.alerts : []);
    } catch {
      setAlerts([]);
    }
  };

  const updateRecentCities = (cityName, isSearch) => {
    setCityList((previousCities) => {
      const baseCities = previousCities.length ? previousCities : [location];
      const exists = baseCities.some((city) => city.toLowerCase() === cityName.toLowerCase());
      if (!isSearch && exists) return normalizeCityList(baseCities);
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
        fetchAlerts(cached.coord.lat, cached.coord.lon);
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
      fetchAlerts(data.coord.lat, data.coord.lon);
    } catch (requestError) {
      console.error('Weather fetch failed', requestError);
      // Fall back to stale cache
      const stale = getStaleCache(cacheKey);
      if (stale) {
        setLocation(stale.name);
        setWeatherData(stale);
        setError('Showing cached data — network unavailable');
      } else {
        setError('Could not load weather right now');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved cities + initial weather
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

  // Debounced search suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = input.trim();
    if (trimmed.length < 2) { setSuggestions([]); return; }
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

  const displayCities = cityList.length ? cityList : [location];

  // Computed derived data
  const palette = useMemo(() => {
    if (!weatherData) return ['#E8E5E3', '#D6D2CF', '#ACA7A2', '#827A74', '#564F4D'];
    return getSkyPalette(weatherCondition, weatherData.timezone);
  }, [weatherData, weatherCondition]);

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

  return {
    cityList, location, unit, input, setInput,
    weatherData, forecastData, isLoading, error,
    sidebarOpen, setSidebarOpen, suggestions, darkMode, setDarkMode,
    theme, handleSetTheme,
    handleSetUnit, toTemp, handleRefresh, removeCity,
    funnyLine, haiku, weatherCondition, displayCities,
    fetchWeather, handleSearch, handleSuggestionClick,
    palette, hourlyData, dailyForecast, alerts,
  };
}
