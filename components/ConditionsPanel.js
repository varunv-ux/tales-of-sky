export default function ConditionsPanel({ weatherData, unit, toTemp }) {
  if (!weatherData) return null;

  const { main, wind, visibility, sys } = weatherData;
  const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const windSpeed = unit === 'C' ? `${(wind.speed * 3.6).toFixed(1)} km/h` : `${(wind.speed * 2.237).toFixed(1)} mph`;
  const vis = visibility != null ? `${(visibility / 1000).toFixed(1)} km` : '--';

  const items = [
    { label: 'Feels Like', value: `${toTemp(main.feels_like)}°${unit}` },
    { label: 'Humidity', value: `${main.humidity}%` },
    { label: 'Wind', value: windSpeed },
    { label: 'Sunrise', value: sunrise },
    { label: 'Sunset', value: sunset },
    { label: 'Pressure', value: `${main.pressure} hPa` },
    { label: 'Visibility', value: vis },
  ];

  return (
    <div className="mt-8 text-left space-y-2">
      <h3 className="text-[1.02rem] font-bold tracking-[-0.03em] text-taupe-800 dark:text-taupe-200">Current Conditions</h3>
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item) => (
          <div key={item.label} className="bg-taupe-100 dark:bg-taupe-800 rounded-xl px-4 py-3 min-w-[120px] shrink-0">
            <div className="text-[0.82rem] text-taupe-500 dark:text-taupe-400 font-medium">{item.label}</div>
            <div className="text-[1.1rem] font-semibold tracking-[-0.02em] mt-0.5 text-taupe-800 dark:text-taupe-200">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
