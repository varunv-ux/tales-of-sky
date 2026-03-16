// Maps OpenWeatherMap icon codes to Basmilius Meteocons filenames
// https://github.com/basmilius/weather-icons
const iconMap = {
  '01d': 'clear-day',
  '01n': 'clear-night',
  '02d': 'partly-cloudy-day',
  '02n': 'partly-cloudy-night',
  '03d': 'cloudy',
  '03n': 'cloudy',
  '04d': 'overcast',
  '04n': 'overcast',
  '09d': 'drizzle',
  '09n': 'drizzle',
  '10d': 'partly-cloudy-day-rain',
  '10n': 'partly-cloudy-night-rain',
  '11d': 'thunderstorms-day',
  '11n': 'thunderstorms-night',
  '13d': 'snow',
  '13n': 'snow',
  '50d': 'mist',
  '50n': 'mist',
};

const CDN_BASE = 'https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg';

export function getWeatherIconUrl(iconCode) {
  const name = iconMap[iconCode] || 'not-available';
  return `${CDN_BASE}/${name}.svg`;
}

export default function WeatherIcon({ iconCode, size = 48, className = '' }) {
  const url = getWeatherIconUrl(iconCode);
  return (
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      className={`contrast-[1.6] brightness-[0.85] ${className}`}
      loading="lazy"
    />
  );
}
