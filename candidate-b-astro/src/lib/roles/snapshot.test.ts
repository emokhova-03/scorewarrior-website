import { describe, expect, it } from "vitest";

import { feedAgeSeconds, snapshotSchema, SNAPSHOT_KEY } from "./snapshot";
import type { RolesSnapshot } from "./snapshot";

/**
 * Every case passes `now` explicitly. feedAgeSeconds takes it as an argument
 * precisely so the tests do not depend on the real clock — a test that reads
 * Date.now() is a test that fails at midnight or on a slow machine.
 */

const validRole = {
  slug: "test-role-one",
  title: "[TEST] Role One",
  department: "[TEST] Department",
  location: "Limassol, Cyprus",
};

function snapshotAt(fetchedAt: string): RolesSnapshot {
  return {
    roles: [validRole],
    fetchedAt,
    sourceUrl: "https://example.test/roles.json",
    skipped: 0,
  };
}

/** A fixed reference point, so every expectation below is exact. */
const NOW = Date.parse("2026-09-03T12:00:00.000Z");

describe("feedAgeSeconds", () => {
  it("возвращает возраст свежего снимка в секундах", () => {
    const snapshot = snapshotAt("2026-09-03T11:59:30.000Z");

    expect(feedAgeSeconds(snapshot, NOW)).toBe(30);
  });

  it("возвращает возраст устаревшего снимка", () => {
    // Двое суток — заведомо больше порога в 15 минут из F2.AC2.
    const snapshot = snapshotAt("2026-09-01T12:00:00.000Z");

    expect(feedAgeSeconds(snapshot, NOW)).toBe(2 * 24 * 60 * 60);
  });

  it("для снимка из сборки даёт огромный возраст, а не ноль", () => {
    /**
     * bundledSnapshot подставляет new Date(0). Это сознательный приём: он
     * обязан выглядеть безнадёжно устаревшим, чтобы /api/health.json увидел
     * проблему. Если этот тест начнёт возвращать 0, значит запасной снимок
     * научился притворяться свежим — самый дорогой вид удобной неправды.
     */
    const snapshot = snapshotAt(new Date(0).toISOString());

    expect(feedAgeSeconds(snapshot, NOW)).toBe(Math.round(NOW / 1000));
    expect(feedAgeSeconds(snapshot, NOW)).toBeGreaterThan(15 * 60);
  });

  it("зажимает в ноль снимок из будущего", () => {
    // Часы воркера и часы источника расходятся; отрицательный возраст
    // сломал бы сравнение с порогом в health-check.
    const snapshot = snapshotAt("2026-09-03T12:05:00.000Z");

    expect(feedAgeSeconds(snapshot, NOW)).toBe(0);
  });

  it("возвращает NaN для неразбираемой даты, а не молчаливый ноль", () => {
    /**
     * Date.parse на мусоре даёт NaN, и Math.max(0, NaN) — это NaN.
     * Ноль здесь был бы хуже: он означает "снимок только что снят".
     * NaN не пройдёт проверку ageSeconds <= maxAgeSeconds, и health
     * честно уйдёт в degraded.
     */
    const snapshot = snapshotAt("не дата");

    expect(feedAgeSeconds(snapshot, NOW)).toBeNaN();
    expect(feedAgeSeconds(snapshot, NOW) <= 900).toBe(false);
  });
});

describe("snapshotSchema", () => {
  it("принимает корректный снимок", () => {
    const result = snapshotSchema.safeParse(
      snapshotAt("2026-09-03T11:59:30.000Z"),
    );

    expect(result.success).toBe(true);
  });

  it("отклоняет fetchedAt не в формате ISO", () => {
    const result = snapshotSchema.safeParse({
      ...snapshotAt("2026-09-03T11:59:30.000Z"),
      fetchedAt: "03.09.2026 11:59",
    });

    expect(result.success).toBe(false);
  });

  it("отклоняет отрицательное значение skipped", () => {
    const result = snapshotSchema.safeParse({
      ...snapshotAt("2026-09-03T11:59:30.000Z"),
      skipped: -1,
    });

    expect(result.success).toBe(false);
  });

  it("отклоняет снимок с вакансией, не прошедшей roleSchema", () => {
    // Схема снимка вложена в схему вакансии: мусор внутри roles
    // не должен проехать только потому, что обёртка корректна.
    const result = snapshotSchema.safeParse({
      ...snapshotAt("2026-09-03T11:59:30.000Z"),
      roles: [{ ...validRole, slug: "Not A Slug" }],
    });

    expect(result.success).toBe(false);
  });
});

describe("SNAPSHOT_KEY", () => {
  it("остаётся тем же ключом, под которым пишет cron", () => {
    // Ключ читают страницы, /api/roles.json и /api/health.json, а пишет
    // cron. Разъехавшись, они не упадут — просто KV окажется "пустым".
    expect(SNAPSHOT_KEY).toBe("roles:snapshot");
  });
});
