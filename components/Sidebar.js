export default function Sidebar({ input, setInput, onSearch, error, cities, activeCity, onCityClick, onRemoveCity, isOpen, onClose, suggestions, onSuggestionClick }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-72 bg-taupe-200 dark:bg-taupe-950
          flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:z-auto
        `}
      >
        {/* Header */}
        <div className="px-7 pt-8 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[2.2rem] leading-[0.92] font-bold tracking-[-0.055em] text-taupe-900 dark:text-taupe-100">Tales of Sky</h1>
              <p className="mt-1.5 text-[0.92rem] leading-5 font-medium text-taupe-500 dark:text-taupe-400">Weather, beautifully told</p>
            </div>
            <button onClick={onClose} className="md:hidden mt-1 p-1.5 rounded-lg text-taupe-300 hover:bg-taupe-150 dark:hover:bg-taupe-800 hover:text-taupe-500 transition-colors" aria-label="Close menu">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="4" y1="4" x2="14" y2="14" /><line x1="14" y1="4" x2="4" y2="14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-2">
          <div className="relative">
            <svg className="absolute left-4 top-[13px] text-taupe-300 z-10" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="Search city..."
              aria-label="Search for a city"
              autoComplete="off"
              className="w-full pl-10 pr-4 py-3 text-[0.92rem] rounded-xl bg-white/60 dark:bg-taupe-800/60 placeholder:text-taupe-400 dark:text-taupe-200 focus:outline-none focus:ring-2 focus:ring-taupe-300 dark:focus:ring-taupe-600 focus:border-transparent transition-shadow"
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-taupe-800 rounded-xl shadow-lg overflow-hidden z-50">
                {suggestions.map((s) => (
                  <button
                    key={`${s.name}-${s.lat}-${s.lon}`}
                    onClick={() => onSuggestionClick(s)}
                    className="flex items-start w-full text-left px-4 py-2.5 text-[0.88rem] text-taupe-700 dark:text-taupe-200 hover:bg-taupe-100 dark:hover:bg-taupe-700 transition-colors"
                  >
                    <svg className="mr-2.5 flex-shrink-0 opacity-40 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.name}</div>
                      <div className="text-[0.78rem] text-taupe-400 truncate">
                        {[s.state, s.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {error ? <p className="mt-2 text-sm text-red-700 dark:text-red-400 px-1">{error}</p> : null}
        </div>

        {/* Divider */}
        <div className="mx-5 my-2 border-t border-taupe-300/40 dark:border-taupe-700/40" />

        {/* Label */}
        <div className="px-7 pt-1 pb-1">
          <span className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-taupe-400">Recent Cities</span>
        </div>

        {/* Cities */}
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          <div className="flex flex-col gap-0.5">
            {cities.map((city) => (
              <div key={city} className="group relative">
                <button
                  onClick={() => { onCityClick(city); onClose(); }}
                  className={`flex items-center w-full text-left px-4 py-3 rounded-xl text-[0.95rem] leading-5 transition-all ${
                    city.toLowerCase() === activeCity.toLowerCase()
                      ? 'bg-taupe-800 dark:bg-taupe-200 text-white dark:text-taupe-900 font-semibold shadow-md'
                      : 'text-taupe-700 dark:text-taupe-300 hover:bg-taupe-150 dark:hover:bg-taupe-800 font-medium'
                  }`}
                >
                  <svg className="mr-3 flex-shrink-0 opacity-50" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {city}
                </button>
                {city.toLowerCase() !== activeCity.toLowerCase() && onRemoveCity && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveCity(city); }}
                    aria-label={`Remove ${city}`}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-taupe-400 hover:text-taupe-600 dark:hover:text-taupe-300 hover:bg-taupe-200 dark:hover:bg-taupe-700 transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="2" y1="2" x2="10" y2="10" /><line x1="10" y1="2" x2="2" y2="10" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
