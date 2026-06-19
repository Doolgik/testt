import { VideoCard, type VideoCardData } from './VideoCard';

export function VideoGrid({ videos }: { videos: VideoCardData[] }) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-muted">
        <span className="text-5xl">📭</span>
        <p className="mt-4 text-lg font-medium text-white">Пока пусто</p>
        <p className="mt-1 max-w-sm text-sm">
          Здесь появятся видео. Загрузи первое — и алгоритм начнёт подбирать
          рекомендации.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  );
}
