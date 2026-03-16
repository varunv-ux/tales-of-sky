import { useRef, useCallback } from 'react';
import { getSkyPalette } from './SkyPalette';

export default function ShareCard({ weatherData, unit, toTemp, funnyLine }) {
  const canvasRef = useRef(null);

  const generateCard = useCallback(() => {
    if (!weatherData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = 600;
    const h = 800;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.scale(2, 2); // retina

    const condition = weatherData.weather?.[0]?.main || 'Clear';
    const colors = getSkyPalette(condition, weatherData.timezone);
    const temp = toTemp(weatherData.main.temp);
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

    // Overlay for text readability
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    roundRect(ctx, 0, 0, w, h, 32);
    ctx.fill();

    // City name
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '600 16px "Overused Grotesk", system-ui, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.textAlign = 'center';
    ctx.fillText(city.toUpperCase(), w / 2, 100);
    ctx.letterSpacing = '0px';

    // Temperature
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 120px "Overused Grotesk", system-ui, sans-serif';
    ctx.fillText(`${temp}\u00b0`, w / 2, 240);

    // Unit
    ctx.font = '500 28px "Overused Grotesk", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(unit === 'C' ? 'Celsius' : 'Fahrenheit', w / 2, 280);

    // Condition
    ctx.font = '500 22px "Overused Grotesk", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(desc.charAt(0).toUpperCase() + desc.slice(1), w / 2, 340);

    // Divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, 380);
    ctx.lineTo(w * 0.8, 380);
    ctx.stroke();

    // Funny line (wrapped)
    ctx.font = 'italic 500 20px "Overused Grotesk", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    const lines = wrapText(ctx, `"${funnyLine}"`, w - 120);
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, 430 + i * 30);
    });

    // Palette dots at bottom
    const dotY = h - 120;
    const dotSpacing = 50;
    const startX = (w - (colors.length - 1) * dotSpacing) / 2;
    colors.forEach((color, i) => {
      ctx.beginPath();
      ctx.arc(startX + i * dotSpacing, dotY, 12, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Branding
    ctx.font = '800 18px "Overused Grotesk", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.letterSpacing = '1px';
    ctx.fillText('TALES OF SKY', w / 2, h - 50);
    ctx.letterSpacing = '0px';
  }, [weatherData, unit, toTemp, funnyLine]);

  const handleDownload = useCallback(() => {
    generateCard();
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `tales-of-sky-${weatherData?.name?.toLowerCase().replace(/ /g, '-') || 'weather'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [generateCard, weatherData]);

  const handleCopy = useCallback(async () => {
    generateCard();
    const canvas = canvasRef.current;
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch {
      // fallback: just download
      handleDownload();
    }
  }, [generateCard, handleDownload]);

  if (!weatherData) return null;

  return (
    <div className="mt-10 text-center space-y-3">
      <h3 className="text-[1.02rem] font-bold tracking-[-0.03em] text-taupe-800 dark:text-taupe-200 text-left">Share</h3>
      <div className="flex gap-2 justify-start">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-taupe-100 dark:bg-taupe-800 text-[0.88rem] font-semibold text-taupe-700 dark:text-taupe-300 hover:bg-taupe-200 dark:hover:bg-taupe-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download Card
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-taupe-100 dark:bg-taupe-800 text-[0.88rem] font-semibold text-taupe-700 dark:text-taupe-300 hover:bg-taupe-200 dark:hover:bg-taupe-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy to Clipboard
        </button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

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
