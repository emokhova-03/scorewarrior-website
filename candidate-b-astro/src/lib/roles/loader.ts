import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Loader, LoaderContext } from "astro/loaders";
import { parseRoles } from "./schema";

export interface RolesFileLoaderOptions {
  /** Путь к файлу вакансий относительно корня проекта, например "data/roles.json". */
  path: string;
}

/**
 * Loader — это мост между источником данных и content layer'ом Astro.
 * Его контракт из astro/loaders: имя плюс функция load, которая получает
 * контекст (store, parseData, logger, config, watcher) и наполняет store.
 *
 * Зачем свой loader вместо встроенного file():
 *
 * file() при нечитаемом или невалидном JSON пишет logger.error и делает
 * return — билд успешно завершается с ПУСТОЙ коллекцией. То есть сломанный
 * источник вакансий уезжает в прод как страница "нет открытых вакансий".
 * Это тихая потеря контента — худший вид отказа: никто не заметит.
 *
 * Нужное поведение диктует F2.AC3, и оно разное для двух разных отказов:
 *
 *   отдельная запись невалидна  → пропустить, предупредить, остальные живут
 *   источник сломан целиком     → бросить исключение и уронить билд
 *
 * Уронить билд здесь — это и есть graceful degradation. Деплой не состоится,
 * в проде останется работать предыдущая сборка с последними известными
 * хорошими вакансиями. Живой старый сайт лучше свежего сломанного.
 * Это же требование PRD §8: "a content build that fails Zod schema
 * validation never deploys".
 */
export function rolesFileLoader({ path }: RolesFileLoaderOptions): Loader {
  /**
   * Вынесено в отдельную функцию, потому что вызывается дважды:
   * один раз при старте и потом на каждое изменение файла в dev-режиме.
   */
  async function syncRoles(
    absolutePath: string,
    { store, parseData, logger }: LoaderContext,
  ): Promise<void> {
    let contents: string;
    try {
      contents = await fs.readFile(absolutePath, "utf-8");
    } catch (cause) {
      // { cause } сохраняет исходную ошибку внутри новой.
      // В логе будет и наше понятное сообщение, и системная причина (ENOENT).
      throw new Error(`источник вакансий ${path} недоступен для чтения`, {
        cause,
      });
    }

    let json: unknown;
    try {
      json = JSON.parse(contents);
    } catch (cause) {
      throw new Error(`источник вакансий ${path} — невалидный JSON`, { cause });
    }

    const parsed = parseRoles(json);

    if (!parsed.ok) {
      throw new Error(`источник вакансий ${path}: ${parsed.problem}`);
    }

    for (const problem of parsed.problems) {
      logger.warn(`${path} — ${problem}; запись пропущена`);
    }

    // store.clear() перед записью обязателен: без него удалённая из источника
    // вакансия осталась бы в store с прошлого прогона и её страница
    // продолжала бы собираться.
    store.clear();

    for (const role of parsed.roles) {
      // parseData прогоняет данные через схему коллекции из content.config.ts
      // и возвращает то, что можно положить в store. Да, валидация проходит
      // второй раз (первый — в parseRoles). Это сознательно: parseRoles —
      // наша доменная граница, её мы тестируем; parseData — контракт Astro,
      // через который данные попадают в store. На билде это микросекунды.
      const data = await parseData({
        id: role.slug,
        data: role,
        filePath: absolutePath,
      });

      // id записи = slug. Отсюда getCollection даст entry.id === slug,
      // и getStaticPaths сможет строить маршруты прямо из него.
      store.set({ id: role.slug, data, filePath: path });
    }

    logger.info(
      `вакансий загружено: ${parsed.roles.length}` +
        (parsed.problems.length > 0
          ? `, пропущено: ${parsed.problems.length}`
          : ""),
    );
  }

  return {
    name: "roles-file",

    async load(context) {
      const { config, logger, watcher } = context;

      // config.root — корень проекта, вычисленный самим Astro.
      // Старая версия использовала process.cwd(), а он зависит от того,
      // из какой папки запустили команду: `npm run build` из корня репозитория
      // и из candidate-b-astro/ дали бы разные пути. config.root — нет.
      const absolutePath = fileURLToPath(new URL(path, config.root));

      await syncRoles(absolutePath, context);

      // В dev-режиме watcher есть, на билде — нет (отсюда ?.).
      // Без этого правка roles.json во время `astro dev` не подхватывалась бы
      // до перезапуска сервера.
      watcher?.add(absolutePath);
      watcher?.on("change", async (changedPath) => {
        if (changedPath !== absolutePath) return;
        logger.info(`${path} изменился, перечитываю`);
        await syncRoles(absolutePath, context);
      });
    },
  };
}
