import { handle } from "@astrojs/cloudflare/handler";

import { refreshRolesSnapshot } from "./lib/roles/refresh";

// Точка входа воркера. Раньше здесь стояла стандартная точка адаптера,
// которая умеет только fetch. Своя нужна ровно для того, чтобы рядом
// с fetch появился второй обработчик — scheduled.
export default {
  // HTTP-запросы уходят в Astro без изменений.
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return handle(request, env, ctx);
  },

  // Расписание. Никакого запроса и никакого пользователя здесь нет.
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
    // waitUntil говорит платформе: не выключай воркер,
    // пока это обещание не выполнится.
    ctx.waitUntil(
      refreshRolesSnapshot(env).then((result) => {
        // Лог одной строкой JSON, а не человеческим текстом:
        // такие строки можно фильтровать и считать,
        // а "обновил 5 вакансий" — нет.
        console.log(
          JSON.stringify({
            event: "roles.refresh",
            cron: controller.cron,
            ...result,
          }),
        );
      }),
    );
  },
};
