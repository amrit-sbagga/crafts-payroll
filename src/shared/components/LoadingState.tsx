export default function LoadingState({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 py-2">
      {Array.from({ length: lines }).map((_, idx) => (
        <div key={idx} className="h-3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      ))}
    </div>
  );
}
