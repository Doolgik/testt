'use client';

import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CATEGORIES } from '@/lib/categories';
import { SignInPrompt } from '@/components/SignInPrompt';
import { UploadIcon } from '@/components/Icons';

type Stage = 'idle' | 'reading' | 'uploading' | 'saving' | 'done' | 'error';

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Разное');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('public');

  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (status === 'loading') return <div className="p-10 text-muted">Загрузка…</div>;
  if (!session?.user)
    return <SignInPrompt text="Войди через Google, чтобы загружать свои видео." />;

  function onPick(f: File | null) {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
    setPreviewUrl(URL.createObjectURL(f));
  }

  /** Вытаскиваем длительность и кадр-превью из выбранного файла. */
  async function extractMeta(): Promise<{ duration: number; thumbBlob: Blob | null }> {
    const el = videoRef.current;
    if (!el) return { duration: 0, thumbBlob: null };
    await new Promise<void>((res) => {
      if (el.readyState >= 1) return res();
      el.onloadedmetadata = () => res();
    });
    const duration = Math.floor(el.duration || 0);
    // кадр на 25% длительности
    await new Promise<void>((res) => {
      el.onseeked = () => res();
      el.currentTime = Math.min(duration * 0.25 || 1, 5);
    });
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = Math.round((640 * (el.videoHeight || 9)) / (el.videoWidth || 16));
    const ctx = canvas.getContext('2d');
    let thumbBlob: Blob | null = null;
    if (ctx) {
      ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
      thumbBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.8));
    }
    return { duration, thumbBlob };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setError('');
    try {
      setStage('reading');
      const { duration, thumbBlob } = await extractMeta();

      setStage('uploading');
      const videoBlob = await upload(`videos/${Date.now()}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
      });

      let thumbnailUrl: string | null = null;
      if (thumbBlob) {
        const tb = await upload(`thumbs/${Date.now()}.jpg`, thumbBlob, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        thumbnailUrl = tb.url;
      }

      setStage('saving');
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description,
          videoUrl: videoBlob.url,
          thumbnailUrl,
          duration,
          category,
          tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
          visibility,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Ошибка сохранения');
      const { id } = await res.json();
      setStage('done');
      router.push(`/watch/${id}`);
    } catch (err) {
      setError((err as Error).message);
      setStage('error');
    }
  }

  const busy = ['reading', 'uploading', 'saving'].includes(stage);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Загрузка видео</h1>

      <form onSubmit={submit} className="space-y-5">
        {/* Выбор файла */}
        {!file ? (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-surface py-16 text-center transition hover:border-sky-500/60 hover:bg-surface-2">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <UploadIcon width={28} height={28} />
            </span>
            <span className="text-lg font-medium">Выберите видео</span>
            <span className="text-sm text-muted">MP4, WebM, MOV · до 2 ГБ</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
          </label>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-black">
            <video
              ref={videoRef}
              src={previewUrl ?? undefined}
              controls
              crossOrigin="anonymous"
              className="aspect-video w-full"
            />
          </div>
        )}

        {file && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium">Название*</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
                className="w-full rounded-xl border border-white/15 bg-surface px-4 py-2.5 outline-none focus:border-sky-500/60"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Описание</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full resize-y rounded-xl border border-white/15 bg-surface px-4 py-2.5 outline-none focus:border-sky-500/60"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Категория</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-surface px-4 py-2.5 outline-none focus:border-sky-500/60"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Доступ</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-surface px-4 py-2.5 outline-none focus:border-sky-500/60"
                >
                  <option value="public">Открытый</option>
                  <option value="unlisted">По ссылке</option>
                  <option value="private">Приватный</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Теги <span className="text-muted">(через запятую — помогают рекомендациям)</span>
              </label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="музыка, концерт, рок"
                className="w-full rounded-xl border border-white/15 bg-surface px-4 py-2.5 outline-none focus:border-sky-500/60"
              />
            </div>

            {busy && (
              <div>
                <div className="mb-1 flex justify-between text-sm text-muted">
                  <span>
                    {stage === 'reading' && 'Готовим превью…'}
                    {stage === 'uploading' && 'Загружаем видео…'}
                    {stage === 'saving' && 'Сохраняем…'}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full bg-gradient-to-r from-brand to-fuchsia-500 transition-all"
                    style={{ width: `${stage === 'uploading' ? progress : 100}%` }}
                  />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-rose-400">⚠ {error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setStage('idle');
                }}
                className="btn-ghost"
                disabled={busy}
              >
                Отмена
              </button>
              <button type="submit" disabled={busy} className="btn-primary flex-1">
                {busy ? 'Публикуем…' : 'Опубликовать'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
