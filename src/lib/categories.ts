export const CATEGORIES = [
  'Музыка',
  'Игры',
  'Фильмы',
  'Новости',
  'Спорт',
  'Образование',
  'Юмор',
  'Технологии',
  'Авто',
  'Путешествия',
  'Еда',
  'Разное',
] as const;

export type Category = (typeof CATEGORIES)[number];
