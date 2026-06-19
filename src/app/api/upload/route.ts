import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

/**
 * Клиентская загрузка больших файлов прямо в Vercel Blob.
 * Браузер запрашивает у нас токен, затем грузит файл напрямую в хранилище —
 * минуя лимит 4.5 МБ на тело запроса к серверным функциям Vercel.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error('Нужно войти в аккаунт');
        return {
          allowedContentTypes: [
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'video/x-matroska',
            'image/jpeg',
            'image/png',
            'image/webp',
          ],
          maximumSizeInBytes: 2 * 1024 * 1024 * 1024, // 2 ГБ
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },
      onUploadCompleted: async () => {
        // Запись в БД создаём отдельным запросом из формы публикации.
      },
    });

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
