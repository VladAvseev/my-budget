/**
 * Общие типы админ-панели, не привязанные к одной сущности БД.
 * Формы запросов/ответов конкретных эндпоинтов живут в файлах хуков
 * (modules/_admin/.../api); здесь только фильтры, которыми обмениваются
 * несколько подразделов админки (импорт между модулями запрещён).
 */

/**
 * Фильтр по роли автора (query `audience` в эндпоинтах графиков):
 * all — все (пользователи + админы), users — только роль 'user' (без админов).
 */
export type AdminAudience = 'all' | 'users';

/**
 * Метрика графиков (query `metric`): count — количество записей,
 * unique_users — уникальные авторы (count(distinct user_id)).
 */
export type AdminChartMetric = 'count' | 'unique_users';

/** Гранулярность динамики операций (query `aggregation`). */
export type AdminOperationsAggregation = 'D' | 'M' | 'Y';

/** Гранулярность динамики логов (query `bucket`). */
export type AdminLogsBucket = 'hour' | 'day';

/** Одна точка графика: ключ периода и значение выбранной метрики. */
export interface AdminChartPoint {
  period: string;
  value: number;
}
