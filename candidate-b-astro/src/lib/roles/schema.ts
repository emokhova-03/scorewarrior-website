import { z } from "astro/zod";

/**
 * Схема — единственное описание формы вакансии в проекте.
 *
 * Тип `Role` выводится из схемы через z.infer, а не объявляется руками.
 * Поэтому схема и тип не могут разойтись: правишь схему — тип меняется сам,
 * и TypeScript тут же покажет все места, которые перестали сходиться.
 * Это требование PRD §6: "static types derived from schemas, never hand-duplicated".
 */
export const roleSchema = z.object({
  // slug попадает в URL (/careers/<slug>) и служит id записи в коллекции,
  // поэтому форма проверяется строго, а не просто "непустая строка".
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'slug: только строчные буквы, цифры и дефисы, например "backend-engineer"',
    ),
  // .trim() — это преобразование, оно выполняется ДО .min(1).
  // Порядок важен: "   " после trim станет "", и min(1) его отклонит.
  title: z.string().trim().min(1, "title обязателен"),
  department: z.string().trim().min(1, "department обязателен"),
  location: z.string().trim().min(1, "location обязателен"),
});

export type Role = z.infer<typeof roleSchema>;

/**
 * Результат разбора источника вакансий.
 *
 * Это размеченное объединение (discriminated union): поле `ok` — метка,
 * по которой TypeScript понимает, какие ещё поля доступны. В ветке
 * `if (!parsed.ok)` он знает, что есть `problem`, но нет `roles`,
 * и не даст обратиться к `roles` по ошибке.
 *
 * Два варианта отражают два разных класса отказа:
 *  - ok: false — источник как целое непригоден (не массив). Дальше идти некуда.
 *  - ok: true  — источник пригоден, но отдельные записи могли не пройти
 *                проверку; они перечислены в `problems` и в `roles` не попали.
 */
export type RolesParse =
  | { ok: false; problem: string }
  | { ok: true; roles: Role[]; problems: string[] };

/**
 * Превращает issues из Zod в одну читаемую строку.
 * Zod возвращает массив объектов с путём и сообщением — в лог сборки
 * нужен текст, а не дамп структуры.
 */
function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
}

/**
 * Разбирает то, что пришло из источника вакансий.
 *
 * Функция чистая: принимает уже прочитанные данные, ничего не читает с диска
 * и не ходит в сеть. Поэтому её можно тестировать без файловой системы —
 * и поэтому же она не изменится, когда на Шаге 3 источником станет KV
 * вместо файла. Транспорт меняется, правила валидации остаются.
 *
 * @param input что угодно: результат JSON.parse, тело HTTP-ответа, значение из KV
 */
export function parseRoles(input: unknown): RolesParse {
  if (!Array.isArray(input)) {
    return {
      ok: false,
      problem: "ожидался JSON-массив вакансий",
    };
  }

  const roles: Role[] = [];
  const problems: string[] = [];
  // Set нужен, потому что slug — это URL. Две вакансии с одним slug означают
  // либо потерянную страницу, либо конфликт маршрутов. Ручные валидаторы
  // в старой версии этого класса ошибок не ловили вовсе.
  const seenSlugs = new Set<string>();

  input.forEach((item, index) => {
    // safeParse не бросает исключение, а возвращает результат.
    // Именно это позволяет пропустить одну плохую запись и продолжить,
    // вместо того чтобы уронить разбор целиком на первой ошибке.
    const result = roleSchema.safeParse(item);

    if (!result.success) {
      problems.push(`запись #${index}: ${formatIssues(result.error)}`);
      return;
    }

    const role = result.data;

    if (seenSlugs.has(role.slug)) {
      problems.push(
        `запись #${index}: slug "${role.slug}" уже встречался — slug попадает в URL и обязан быть уникальным`,
      );
      return;
    }

    seenSlugs.add(role.slug);
    roles.push(role);
  });

  return { ok: true, roles, problems };
}
