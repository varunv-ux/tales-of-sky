import React from 'react';
import WeatherIcon from './WeatherIcon';
import WeatherInsights from './WeatherInsights';

/*
 * SENSORIAL THEME
 * Warm organic bento grid. Mood-first design.
 * Emotion tags, iridescent sphere, feelings over numbers.
 */

const weatherMoods = {
  Clear: { feeling: 'A brighter day ahead' },
  Clouds: { feeling: 'Soft light, quiet hours' },
  Rain: { feeling: 'Let the rain speak' },
  Drizzle: { feeling: 'A whisper of water' },
  Thunderstorm: { feeling: 'Energy in the air' },
  Snow: { feeling: 'The world holds its breath' },
  Mist: { feeling: 'Between here and elsewhere' },
  Fog: { feeling: 'Soft edges, hidden paths' },
  Haze: { feeling: 'Everything at half-light' },
};

const weatherTags = {
  Clear: ['Joy', 'Warmth', 'Clarity', 'Gratitude', 'Energy'],
  Clouds: ['Calm', 'Neutral', 'Reflection', 'Ease', 'Balance'],
  Rain: ['Melancholy', 'Comfort', 'Introspection', 'Release', 'Rest'],
  Drizzle: ['Gentle', 'Soft', 'Patience', 'Acceptance', 'Quiet'],
  Thunderstorm: ['Awe', 'Power', 'Excitement', 'Surprise', 'Caution'],
  Snow: ['Stillness', 'Wonder', 'Peace', 'Purity', 'Nostalgia'],
  Mist: ['Mystery', 'Anticipation', 'Curiosity', 'Ambiguity', 'Trust'],
  Fog: ['Dreamy', 'Soft', 'Imagination', 'Surrender', 'Calm'],
  Haze: ['Nostalgia', 'Drift', 'Warmth', 'Haziness', 'Patience'],
};

const conditionGradients = {
  Clear: 'from-amber-100 via-orange-50 to-rose-100',
  Clouds: 'from-stone-100 via-zinc-100 to-slate-200',
  Rain: 'from-blue-100 via-indigo-100 to-slate-200',
  Drizzle: 'from-sky-100 via-blue-50 to-indigo-100',
  Thunderstorm: 'from-violet-200 via-purple-100 to-indigo-200',
  Snow: 'from-white via-blue-50 to-slate-100',
  Mist: 'from-gray-100 via-stone-100 to-zinc-100',
  Fog: 'from-stone-100 via-gray-100 to-slate-100',
  Haze: 'from-amber-50 via-yellow-50 to-stone-100',
};

function BentoCard({ children, className = '', span = false, padding = true }) {
  return (
    <div className={`bg-white/60 backdrop-blur-sm rounded-[1.5rem] border border-stone-200/60 ${padding ? 'p-5' : ''} ${span ? 'col-span-2' : ''} ${className}`}>
      {children}
    </div>
  );
}

export default function SensorialTheme({
  location, unit, weatherData, forecastData, isLoading, weatherCondition,
  handleSetUnit, toTemp, handleRefresh, funnyLine, haiku,
  hourlyData, dailyForecast, palette, ThemePicker,
}) {
  const mood = weatherMoods[weatherCondition] || weatherMoods.Clear;
  const tags = weatherTags[weatherCondition] || weatherTags.Clear;
  const bgClass = conditionGradients[weatherCondition] || conditionGradients.Clear;
  const sunrise = weatherData ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
  const sunset = weatherData ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';

  return (
    <div className={`min-h-screen font-sans antialiased bg-gradient-to-br ${bgClass} transition-all duration-[3000ms]`}>
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full sensorial-blob-1"
          style={{ background: `radial-gradient(circle, ${palette[0]}50 0%, ${palette[1]}30 40%, transparent 70%)`, top: '-10%', right: '-10%', filter: 'blur(80px)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full sensorial-blob-2"
          style={{ background: `radial-gradient(circle, ${palette[2]}40 0%, ${palette[3]}25 40%, transparent 70%)`, bottom: '5%', left: '-5%', filter: 'blur(80px)' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full sensorial-blob-3"
          style={{ background: `radial-gradient(circle, ${palette[4]}35 0%, ${palette[0]}20 40%, transparent 70%)`, top: '40%', left: '50%', filter: 'blur(100px)' }} />
      </div>

      {/* Theme picker */}
      <div className="relative z-20 flex justify-end px-6 pt-5">
        <ThemePicker />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-5 pb-16">
        {/* Bento grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Condition */}
          <BentoCard className="flex flex-col justify-between min-h-[180px]">
            <p className="text-xs text-stone-500 tracking-wide">Condition</p>
            <p className="text-[2.5rem] leading-none font-bold tracking-[-0.04em] text-stone-900 capitalize">
              {weatherData?.weather?.[0]?.main || 'Clear'}
            </p>
          </BentoCard>

          {/* Orb */}
          <BentoCard className="flex items-center justify-center min-h-[180px] overflow-hidden relative">
            <div className="w-32 h-32 rounded-full sensorial-sphere"
              style={{ background: `conic-gradient(from 45deg, ${palette[0]}, ${palette[1]}, ${palette[2]}, ${palette[3]}, ${palette[4]}, ${palette[0]})`, filter: 'blur(1px)' }} />
            <div className="absolute w-28 h-28 rounded-full"
              style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6) 0%, transparent 60%)' }} />
          </BentoCard>

          {/* Tags */}
          <BentoCard className="min-h-[140px]">
            <p className="text-xs text-stone-500 tracking-wide mb-3">How it feels</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span key={tag}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${i === 0 ? 'bg-stone-800 text-white border-stone-800' : 'bg-white/50 text-stone-600 border-stone-200'}`}>
                  {tag}
                </span>
              ))}
            </div>
          </BentoCard>

          {/* Feeling */}
          <BentoCard className="flex flex-col justify-center min-h-[140px]">
            <p className="text-[1.65rem] leading-tight font-semibold tracking-[-0.03em] text-stone-800">{mood.feeling}</p>
          </BentoCard>

          {/* Temperature */}
          <BentoCard span className="text-center py-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              {weatherData?.weather?.[0]?.icon && <WeatherIcon iconCode={weatherData.weather[0].icon} size={64} />}
              <span className="text-[5.5rem] leading-none font-bold tracking-[-0.06em] text-stone-900">
                {weatherData ? toTemp(weatherData.main.temp) : '--'}°
              </span>
            </div>
            <p className="text-stone-600 text-base font-medium">{location}</p>
            <p className="text-stone-500 text-sm italic mt-1">{funnyLine}</p>
            <div className="flex justify-center gap-2 mt-4">
              {['C', 'F'].map((u) => (
                <button key={u} onClick={() => handleSetUnit(u)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${unit === u ? 'bg-stone-800 text-white' : 'bg-white/60 text-stone-500 border border-stone-200'}`}>
                  °{u}
                </button>
              ))}
              <button onClick={handleRefresh}
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/60 text-stone-500 border border-stone-200 hover:bg-white/80 transition-all ml-1">
                ↻
              </button>
            </div>
          </BentoCard>

          {/* Conditions */}
          {weatherData && (
            <>
              <BentoCard>
                <p className="text-xs text-stone-500 mb-1">Feels Like</p>
                <p className="text-2xl font-bold text-stone-900 tabular-nums">{toTemp(weatherData.main.feels_like)}°</p>
              </BentoCard>
              <BentoCard>
                <p className="text-xs text-stone-500 mb-1">Humidity</p>
                <p className="text-2xl font-bold text-stone-900 tabular-nums">{weatherData.main.humidity}%</p>
              </BentoCard>
              <BentoCard>
                <p className="text-xs text-stone-500 mb-1">Wind</p>
                <p className="text-2xl font-bold text-stone-900 tabular-nums">
                  {unit === 'C' ? `${(weatherData.wind.speed * 3.6).toFixed(0)}` : `${(weatherData.wind.speed * 2.237).toFixed(0)}`}
                  <span className="text-sm font-medium text-stone-500 ml-1">{unit === 'C' ? 'km/h' : 'mph'}</span>
                </p>
              </BentoCard>
              <BentoCard>
                <p className="text-xs text-stone-500 mb-1">Daylight</p>
                <p className="text-lg font-bold text-stone-900">{sunrise}</p>
                <p className="text-xs text-stone-500 mt-0.5">→ {sunset}</p>
              </BentoCard>
            </>
          )}

          {/* Insights */}
          <div className="col-span-2">
            <WeatherInsights weatherData={weatherData} forecastData={forecastData} unit={unit} toTemp={toTemp}
              cardClassName="bg-white/60 backdrop-blur-sm border border-stone-200/60"
              headingClassName="text-[1.02rem] font-bold tracking-[-0.03em] text-stone-800"
              textClassName="text-[1.25rem] leading-[1.3] tracking-[0.02em] text-stone-800" />
          </div>

          {/* Palette */}
          <BentoCard span className="overflow-hidden">
            <p className="text-xs text-stone-500 tracking-wide mb-3">Sky Palette</p>
            <div className="h-16 rounded-2xl mb-3" style={{ background: `linear-gradient(135deg, ${palette.join(', ')})` }} />
            <div className="flex justify-between">
              {palette.map((c, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                  <span className="text-[0.55rem] text-stone-500 mt-1 font-mono">{c}</span>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Daily */}
          {dailyForecast.length > 0 && (
            <BentoCard span padding={false}>
              <p className="text-xs text-stone-500 tracking-wide px-5 pt-5 pb-2">5-Day Forecast</p>
              <div className="divide-y divide-stone-200/60">
                {dailyForecast.map((day) => (
                  <div key={day.date} className="flex items-center px-5 py-3">
                    <span className="w-10 text-sm font-medium text-stone-700">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                    <WeatherIcon iconCode={day.icon} size={32} className="mx-3" />
                    <span className="text-xs text-stone-500">{day.condition}</span>
                    <span className="ml-auto tabular-nums text-sm">
                      <span className="font-bold text-stone-900">{toTemp(day.max)}°</span>
                      <span className="text-stone-400 mx-1">/</span>
                      <span className="text-stone-500">{toTemp(day.min)}°</span>
                    </span>
                  </div>
                ))}
              </div>
            </BentoCard>
          )}
        </div>

        {/* Haiku */}
        {haiku && (
          <div className="mt-10 text-center">
            <p className="text-xl leading-relaxed text-stone-500 italic whitespace-pre-line"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{haiku}</p>
          </div>
        )}
      </div>
    </div>
  );
}
