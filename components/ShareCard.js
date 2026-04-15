import { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { getSkyPalette } from './SkyPalette';

// Canvas doesn't support ctx.letterSpacing — manually draw spaced characters
function fillTextSpaced(ctx, text, x, y, spacing) {
  const chars = text.split('');
  const totalWidth = chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0) + spacing * (chars.length - 1);
  let cx = x - totalWidth / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((ch) => {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  });
  ctx.textAlign = prevAlign;
}

const ShareCard = forwardRef(function ShareCard({ weatherData, unit, toTemp, funnyLine, forecastData }, ref) {
  const canvasRef = useRef(null);

  const generateCard = useCallback(() => {
    if (!weatherData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = 600;
    const h = 800;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.scale(2, 2);

    const condition = weatherData.weather?.[0]?.main || 'Clear';
    const colors = getSkyPalette(condition, weatherData.timezone);
    const temp = toTemp(weatherData.main.temp);
    const feelsLike = toTemp(weatherData.main.feels_like);
    const humidity = weatherData.main.humidity;
    const windSpeed = unit === 'C'
      ? `${(weatherData.wind.speed * 3.6).toFixed(0)} km/h`
      : `${(weatherData.wind.speed * 2.237).toFixed(0)} mph`;
    const city = weatherData.name;
    const desc = weatherData.weather?.[0]?.description || '';

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    colors.forEach((color, i) => {
      grad.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = grad;
    roundRect(ctx, 0, 0, w, h, 32);
    ctx.fill();

    // Subtle dark overlay for text contrast
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    roundRect(ctx, 0, 0, w, h, 32);
    ctx.fill();

    // City name
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '600 15px "Overused Grotesk", system-ui, sans-serif';
    ctx.textAlign = 'center';
    fillTextSpaced(ctx, city.toUpperCase(), w / 2, 80, 3);

    // Temperature — big hero
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 130px "Overused Grotesk", system-ui, sans-serif';
    ctx.fillText(`${temp}\u00b0`, w / 2, 220);

    // Unit + condition
    ctx.font = '500 24px "Overused Grotesk", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(`${unit === 'C' ? 'Celsius' : 'Fahrenheit'}  \u00b7  ${desc.charAt(0).toUpperCase() + desc.slice(1)}`, w / 2, 265);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, 300);
    ctx.lineTo(w * 0.85, 300);
    ctx.stroke();

    // Funny line
    ctx.font = 'italic 500 19px "Overused Grotesk", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    const quoteLines = wrapText(ctx, `\u201c${funnyLine}\u201d`, w - 120);
    quoteLines.forEach((line, i) => {
      ctx.fillText(line, w / 2, 340 + i * 28);
    });

    // Stats row
    const statsY = 340 + quoteLines.length * 28 + 40;
    const stats = [
      { label: 'Feels Like', value: `${feelsLike}\u00b0` },
      { label: 'Humidity', value: `${humidity}%` },
      { label: 'Wind', value: windSpeed },
    ];

    const statWidth = (w - 80) / stats.length;
    stats.forEach((stat, i) => {
      const cx = 40 + statWidth * i + statWidth / 2;

      // Stat background pill
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      roundRect(ctx, 40 + statWidth * i + 6, statsY - 18, statWidth - 12, 58, 14);
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.font = '500 12px "Overused Grotesk", system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(stat.label.toUpperCase(), cx, statsY);

      ctx.font = '700 22px "Overused Grotesk", system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(stat.value, cx, statsY + 28);
    });

    // 3-day mini forecast (if available)
    if (forecastData?.list) {
      const forecastY = statsY + 90;
      const daily = {};
      forecastData.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!daily[date]) {
          daily[date] = { date, min: item.main.temp_min, max: item.main.temp_max, condition: item.weather[0].main };
        } else {
          daily[date].min = Math.min(daily[date].min, item.main.temp_min);
          daily[date].max = Math.max(daily[date].max, item.main.temp_max);
        }
      });
      const days = Object.values(daily).slice(1, 4); // skip today, next 3

      if (days.length > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w * 0.15, forecastY - 20);
        ctx.lineTo(w * 0.85, forecastY - 20);
        ctx.stroke();

        const dayWidth = (w - 80) / days.length;
        days.forEach((day, i) => {
          const cx = 40 + dayWidth * i + dayWidth / 2;
          const dayName = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' });

          ctx.textAlign = 'center';
          ctx.font = '600 13px "Overused Grotesk", system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillText(dayName.toUpperCase(), cx, forecastY);

          ctx.font = '700 18px "Overused Grotesk", system-ui, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`${toTemp(day.max)}\u00b0`, cx - 14, forecastY + 24);

          ctx.font = '500 15px "Overused Grotesk", system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.fillText(`${toTemp(day.min)}\u00b0`, cx + 20, forecastY + 24);
        });
      }
    }

    // Sky palette dots
    const dotY = h - 100;
    const dotSpacing = 44;
    const startX = (w - (colors.length - 1) * dotSpacing) / 2;
    colors.forEach((color, i) => {
      ctx.beginPath();
      ctx.arc(startX + i * dotSpacing, dotY, 10, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Branding
    ctx.font = '800 14px "Overused Grotesk", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'center';
    fillTextSpaced(ctx, 'TALES OF SKY', w / 2, h - 45, 1.5);
  }, [weatherData, forecastData, unit, toTemp, funnyLine]);

  const handleDownload = useCallback(() => {
    generateCard();
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `tales-of-sky-${weatherData?.name?.toLowerCase().replace(/ /g, '-') || 'weather'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [generateCard, weatherData]);

  useImperativeHandle(ref, () => ({ download: handleDownload }), [handleDownload]);

  return <canvas ref={canvasRef} className="hidden" />;
});

export default ShareCard;

// --- Helpers ---

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}
