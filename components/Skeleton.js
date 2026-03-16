export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse bg-taupe-200 rounded-xl ${className}`} />;
}

export function WeatherSkeleton() {
  return (
    <div className="max-w-[42rem] mx-auto space-y-5 text-center">
      <SkeletonBlock className="h-5 w-32 mx-auto" />
      <SkeletonBlock className="h-20 w-48 mx-auto" />
      <SkeletonBlock className="h-6 w-64 mx-auto" />
      <SkeletonBlock className="w-full h-[250px] rounded-2xl" />
      <div className="flex justify-center space-x-2 mt-4">
        <SkeletonBlock className="h-10 w-16 rounded-full" />
        <SkeletonBlock className="h-10 w-16 rounded-full" />
      </div>
      <SkeletonBlock className="h-5 w-40 mt-10" />
      <div className="flex space-x-3 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonBlock key={i} className="min-w-[86px] h-[90px]" />
        ))}
      </div>
      <SkeletonBlock className="h-5 w-40 mt-10" />
      <SkeletonBlock className="w-full h-[280px] rounded-2xl" />
    </div>
  );
}
