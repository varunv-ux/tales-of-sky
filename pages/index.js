import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import WeatherCard from '../components/WeatherCard';
import ConditionsPanel from '../components/ConditionsPanel';
import HourlyForecast from '../components/HourlyForecast';
import DailyForecast from '../components/DailyForecast';
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
  return cities.filter((city, index, allCities) => {
    const normalized = city.toLowerCase();
    return allCities.findIndex((entry) => entry.toLowerCase() === normalized) === index;
  });
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
  const debounceRef = useRef(null);

  useEffect(() => {
    const storedCities = window.localStorage.getItem('tales-of-sky-cities');
    if (storedCities) {
      try {
        const parsedCities = JSON.parse(storedCities);
        if (Array.isArray(parsedCities) && parsedCities.length) {
          setCityList(normalizeCityList(parsedCities).slice(0, 6));
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

  const toTemp = (temp) => {
    if (typeof temp !== 'number') return '--';
    return unit === 'C' ? Math.round(temp) : Math.round(temp * 9 / 5 + 32);
  };

  const fetchForecast = async (lat, lon) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    setForecastData(data?.list ? data : null);
  };

  const updateRecentCities = (cityName, isSearch) => {
    setCityList((previousCities) => {
      const baseCities = previousCities.length ? previousCities : [location];
      const exists = baseCities.some((city) => city.toLowerCase() === cityName.toLowerCase());

      if (!isSearch && exists) {
        return normalizeCityList(baseCities).slice(0, 6);
      }

      const filtered = baseCities.filter((city) => city.toLowerCase() !== cityName.toLowerCase());
      return normalizeCityList([cityName, ...filtered]).slice(0, 6);
    });
  };

  const fetchWeather = async (city, isSearch = false) => {
    const trimmedCity = city?.trim();
    if (!trimmedCity) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(trimmedCity)}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (Number(data.cod) !== 200) {
        setError('City not found');
        return;
      }

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

  const weatherCondition = weatherData?.weather?.[0]?.main;
  const funnyLine = useMemo(() => {
    const lines = funnyWeatherLines[weatherCondition];
    return lines ? lines[Math.floor(Math.random() * lines.length)] : 'Weather is undecided.';
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

  const handleSuggestionClick = (suggestion) => {
    setSuggestions([]);
    setInput('');
    fetchWeather(suggestion.name, true);
  };

  const handleSearch = () => {
    setSuggestions([]);
    fetchWeather(input, true);
  };

  const displayCities = cityList.length ? cityList : [location];

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <title>Tales of Sky</title>
      </Head>

      <div className="flex min-h-screen font-sans text-taupe-800 bg-taupe-200 antialiased">
        {/* Mobile header */}
        <div className="fixed top-0 left-0 right-0 z-20 flex items-center px-5 py-3 bg-taupe-200 border-b border-taupe-300 md:hidden">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="p-1 mr-3 text-taupe-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="text-lg font-black tracking-[-0.04em] text-taupe-900">Tales of Sky</span>
        </div>

        <Sidebar
          input={input}
          setInput={setInput}
          onSearch={handleSearch}
          error={error}
          cities={displayCities}
          activeCity={location}
          onCityClick={(city) => fetchWeather(city, false)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />

        <main className="flex-1 m-1.5 px-5 sm:px-10 pt-16 md:pt-12 pb-12 bg-taupe-50 overflow-y-auto max-h-[calc(100vh-12px)] rounded-[2rem]">
          <div className="max-w-[42rem] mx-auto space-y-5 text-center">
            {isLoading && !weatherData ? (
              <WeatherSkeleton />
            ) : (
              <>
                <WeatherCard
                  location={location}
                  weatherData={weatherData}
                  isLoading={isLoading}
                  funnyLine={funnyLine}
                  unit={unit}
                  setUnit={setUnit}
                  toTemp={toTemp}
                />
                <ConditionsPanel weatherData={weatherData} unit={unit} toTemp={toTemp} />
                <HourlyForecast forecastData={forecastData} unit={unit} toTemp={toTemp} />
                <DailyForecast forecastData={forecastData} unit={unit} toTemp={toTemp} />
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
