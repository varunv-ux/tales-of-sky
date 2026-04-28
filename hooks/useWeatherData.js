import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSkyPalette } from '../components/SkyPalette';
import { weatherHaikus } from '../components/WeatherInsights';

const API_KEY = process.env.NEXT_PUBLIC_OWM_API_KEY;
const DEFAULT_CITY = 'New York';

export const funnyWeatherLines = {
  Clear: {
    day: [
      'The sun showed up and chose violence ☀️',
      'Not a cloud in sight. Suspiciously optimistic.',
      'Sunglasses weather. You deserve this.',
      'The sky is flirting with you today.',
      'Golden hour all day. Go outside, you goblin.',
      'Plot twist: the weather is actually nice.',
    ],
    night: [
      'The moon is doing the absolute most tonight 🌙',
      'Stars are out. Go be poetic or something.',
      'Clear night. Every star showed up to flex.',
      'The sky went full screensaver mode.',
      'No clouds. Just you and the void.',
      'Stargazing weather. Phone down, eyes up.',
    ],
  },
  Clouds: {
    day: [
      'Cloudy with a chance of deep thoughts ☁️',
      'Overcast and overthinking.',
      'The sky is buffering.',
      'Mood: grey but make it aesthetic.',
      'Cloud coverage: 100%. Motivation: 0%.',
      'Perfect weather for doing absolutely nothing.',
    ],
    night: [
      'Clouds blocking the stars. Rude.',
      'The sky is wearing a blanket tonight ☁️',
      'Overcast night. The moon called in sick.',
      'Cloudy and cozy. Perfect excuse for bed.',
      'The night sky got censored by clouds.',
    ],
  },
  Rain: {
    day: [
      'Your umbrella is in the trunk, isn\'t it?',
      'A rainy stretch with quiet streets and silver skies.',
      'Nature\'s way of saying stay home and binge something.',
      'Dancing in the rain sounds fun until your socks get wet.',
      'It\'s raining. Your hair didn\'t stand a chance.',
      'Rain check on your plans. Literally.',
    ],
    night: [
      'Rain on the window. Main character sleeping hours 🌧️',
      'Rainy night. Best sleep soundtrack ever.',
      'The sky is crying. Go to bed.',
      'Wet streets, glowing lights. Noir vibes.',
      'Perfect night to fall asleep to rain.',
    ],
  },
  Drizzle: {
    day: [
      'Barely rain. Like the sky changed its mind 💧',
      'Sprinkle vibes only.',
      'The sky is spitting. Rude.',
      'Not enough to cancel plans. Unfortunately.',
      'Is it raining? Technically.',
    ],
    night: [
      'A light drizzle. The night is whispering 💧',
      'Barely raining. The sky is being coy tonight.',
      'Drizzle at night. Atmospheric.',
    ],
  },
  Thunderstorm: {
    day: [
      'Thor is practicing again ⚡',
      'Time to reenact dramatic movie scenes.',
      'The sky is having a tantrum.',
      'Perfect ambiance for an existential crisis.',
      'Nature\'s surround sound system is ON.',
      'Free light show, no tickets needed.',
    ],
    night: [
      'Lightning and darkness. Horror movie vibes ⚡',
      'The sky is throwing a rave and you weren\'t invited.',
      'Thunder at night. Nature\'s alarm clock from hell.',
      'Free light show outside your window.',
      'The sky is screaming. Relatable.',
    ],
  },
  Snow: {
    day: [
      'Fluffy sky sadness ❄️',
      'Snow excuse to stay inside.',
      'Winter has entered the chat.',
      'The world is a snow globe. You\'re the figurine.',
      'Hot cocoa is now a medical necessity.',
      'Snow day! Or as adults call it… a day.',
    ],
    night: [
      'Snow falling in the dark. Magical and freezing ❄️',
      'Silent night. Literally. Snow muffled everything.',
      'Winter wonderland after dark.',
      'The snow glows under streetlights. Go look.',
    ],
  },
  Mist: {
    day: [
      'It\'s misty. So mysterious 🌫️',
      'Where\'s the Sherlock theme?',
      'Main character energy. Zero visibility.',
      'The vibes are immaculate. The roads are not.',
    ],
    night: [
      'Misty night. Every streetlight is a movie scene 🌫️',
      'Can\'t see anything. Spooky vibes activated.',
      'The night is wearing a veil.',
    ],
  },
  Fog: {
    day: [
      'Spooky air. Bring a flashlight.',
      'Like walking through a dream.',
      'Silent Hill weather. Stay close.',
      'You can\'t see the future. Or the road.',
    ],
    night: [
      'Foggy night. Horror soundtrack recommended.',
      'The fog swallowed the streetlights.',
      'Can\'t see three feet ahead. Classic.',
    ],
  },
  Haze: {
    day: [
      'Feels like someone smeared the air.',
      'Soft-filter life.',
      'The sky got lazy with the render distance.',
      'Everything looks like a 90s music video.',
    ],
    night: [
      'Hazy night. The city glows weird.',
      'Night haze. Everything has a filter on it.',
    ],
  },
  Smoke: {
    day: [
      'Air\'s got some extra seasoning 🔥',
      'Smokey vibes. Not the fun kind.',
      'The air is being dramatic today.',
    ],
    night: [
      'Smoky night. Close the windows.',
      'The air smells like someone\'s bonfire regrets.',
    ],
  },
  Dust: {
    day: [
      'It\'s exfoliation weather 💨',
      'Free dermabrasion from Mother Nature.',
      'Close your windows. And your mouth.',
    ],
    night: [
      'Dusty night. Breathing is optional apparently.',
      'Close the windows and pretend you\'re indoors.',
    ],
  },
};

export const profaneWeatherLines = {
  Clear: {
    day: [
      'The sun woke up and said f*ck your plans, you\'re going outside ☀️',
      'Stupidly gorgeous out. Almost offensive.',
      'Zero clouds. God\'s showing off again.',
      'It\'s so nice it\'s pissing me off.',
      'The sky said "you\'re welcome, ungrateful b*tch."',
      'Go outside you pasty hermit. The sun didn\'t show up for nothing.',
    ],
    night: [
      'Clear sky tonight. The stars are flexing and they know it 🌙',
      'The moon is out here looking smug as hell.',
      'Not a damn cloud. The universe is being annoyingly pretty.',
      'Stars said "look at us, losers." And honestly? Fair.',
    ],
  },
  Clouds: {
    day: [
      'Overcast as hell. The sky is having a mid-life crisis ☁️',
      'Cloudy. The sun called in sick, that lazy bastard.',
      'Grey sky energy. Productivity is dead.',
      'The sky looks like it gave up. Relatable.',
      'Cloud coverage: 100%. Give-a-sh*t level: 0%.',
    ],
    night: [
      'Cloudy night. Can\'t even see the damn moon.',
      'Clouds said "no stars for you, b*tch" ☁️',
      'Overcast darkness. Peak depression aesthetic.',
      'The sky is being a little sh*t and hiding everything.',
    ],
  },
  Rain: {
    day: [
      'It\'s pissing down. Your hair is f*cked.',
      'Rain. Because the universe hates your outfit today.',
      'Umbrella? At home. Naturally. God damn it.',
      'Wet, cold, and miserable. Just like your ex.',
      'The sky opened up and said "f*ck everyone outside."',
    ],
    night: [
      'Raining at night. Go the f*ck to sleep 🌧️',
      'Rainy night. Nature\'s white noise for your dumb*ss.',
      'Streets are wet. Stay home you soggy disaster.',
      'Rain on the window. Pretend you\'re in a sad movie.',
    ],
  },
  Drizzle: {
    day: [
      'Can\'t even commit to raining properly. Pathetic 💧',
      'Is it raining? Who the f*ck knows.',
      'Half-ass rain. Even the sky is lazy today.',
      'Drizzle. Just enough to ruin your hair, not enough for an umbrella.',
    ],
    night: [
      'A sad little drizzle. The sky is crying but quietly 💧',
      'Drizzling at night. Nature\'s passive-aggressive tears.',
    ],
  },
  Thunderstorm: {
    day: [
      'Holy sh*t, the sky is ANGRY ⚡',
      'Thunder so loud your ancestors flinched.',
      'Nature said "and I took that personally."',
      'The sky is throwing a goddamn tantrum.',
      'Lightning round! And you\'re not winning.',
    ],
    night: [
      'Thunder at night. Good f*cking luck sleeping ⚡',
      'The sky is screaming into the void. Same tbh.',
      'Lightning show at 2am. Thanks for nothing, sky.',
      'Nature\'s rave. Uninvited. Loud as hell.',
    ],
  },
  Snow: {
    day: [
      'It\'s snowing. Your commute is f*cked ❄️',
      'Snow. Beautiful until you have to drive in it.',
      'Winter wonderland my ass. It\'s freezing.',
      'The sky is shedding. Someone get it a lint roller.',
    ],
    night: [
      'Snow at night. Pretty as hell, cold as balls ❄️',
      'Snowing in the dark. Magical until you step in it.',
      'Silent snowy night. Peaceful until the shoveling.',
    ],
  },
  Mist: {
    day: [
      'Misty as f*ck. Can\'t see sh*t 🌫️',
      'The air is soup. Drive slow, you maniac.',
      'Zero visibility. Just like your future.',
    ],
    night: [
      'Misty night. Every alley looks like a murder scene 🌫️',
      'Can\'t see a damn thing. Perfect.',
    ],
  },
  Fog: {
    day: [
      'Foggy as hell. Silent Hill called, they want their weather back.',
      'You can\'t see the road. Or your life choices.',
    ],
    night: [
      'Foggy night. Creepy as f*ck.',
      'The fog ate the streetlights. Lovely.',
    ],
  },
  Haze: {
    day: [
      'Hazy garbage air. Your lungs send their regards.',
      'The sky has a hangover. Same.',
    ],
    night: [
      'Hazy night. The city looks drunk.',
      'Night haze. Everything\'s got beer goggles.',
    ],
  },
  Smoke: {
    day: [
      'The air tastes like regret and someone\'s BBQ 🔥',
      'Smoky hell. Close every window.',
    ],
    night: [
      'Smoky night. Breathing is a goddamn luxury.',
    ],
  },
  Dust: {
    day: [
      'Dusty as hell. Free exfoliation whether you want it or not 💨',
      'The air is crunchy. That can\'t be good.',
    ],
    night: [
      'Dusty night. Your lungs are filing a complaint.',
    ],
  },
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
  const [profanityMode, setProfanityMode] = useState(false);
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
    document.documentElement.classList.toggle('dark', darkMode);
    window.localStorage.setItem('tales-of-sky-dark', String(darkMode));
  }, [darkMode, theme]);

  // Profanity mode persistence
  useEffect(() => {
    const stored = window.localStorage.getItem('tales-of-sky-profanity');
    if (stored === 'true') setProfanityMode(true);
  }, []);

  const handleSetProfanityMode = useCallback((val) => {
    setProfanityMode(val);
    window.localStorage.setItem('tales-of-sky-profanity', String(val));
  }, []);

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

  const isDaytime = useMemo(() => {
    if (!weatherData) return true;
    const now = Date.now() / 1000;
    return now > weatherData.sys.sunrise && now < weatherData.sys.sunset;
  }, [weatherData]);

  const funnyLine = useMemo(() => {
    const source = profanityMode ? profaneWeatherLines : funnyWeatherLines;
    const conditionLines = source[weatherCondition];
    if (!conditionLines) return profanityMode ? 'Weather is f*cked. No data.' : 'Weather is undecided.';
    const timeLines = isDaytime ? conditionLines.day : conditionLines.night;
    return timeLines[Math.floor(Math.random() * timeLines.length)];
  }, [weatherCondition, isDaytime, profanityMode]);

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
    profanityMode, handleSetProfanityMode,
  };
}
