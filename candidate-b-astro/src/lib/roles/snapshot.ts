import { z } from "astro/zod";

import { roleSchema } from "./schema";

// Единственный ключ, под которым лежит снимок. Вынесен в константу,
// потому что его пишет cron, а читают три разных места:
// страницы, /api/roles.json и /api/health.json.
export const SNAPSHOT_KEY = "roles:snapshot";

// Схема самого снимка — не то же, что схема вакансии.
// Вакансия приходит из источника; снимок мы конструируем сами.
// Но проверять его на чтении всё равно надо: в KV между записью
// и чтением лежит внешняя система, куда при отладке можно
// записать что угодно руками.
export const snapshotSchema = z.object({
  roles: z.array(roleSchema),
  fetchedAt: z.iso.datetime(), // когда снимок был снят
  sourceUrl: z.string(), // откуда — для /api/health.json
  skipped: z.number().int().nonnegative(), // сколько записей выброшено схемой
});

export type RolesSnapshot = z.infer<typeof snapshotSchema>;

/**
 * Возраст снимка в секундах. Это главная метрика дня: именно она
 * отвечает на вопрос "выполняется ли F2.AC2" — окно 15 минут.
 * now передаётся аргументом, чтобы функцию можно было тестировать
 * без манипуляций с системным временем.
 */
export function feedAgeSeconds(
  snapshot: RolesSnapshot,
  now: number = Date.now(),
): number {
  return Math.max(0, Math.round((now - Date.parse(snapshot.fetchedAt)) / 1000));
}
