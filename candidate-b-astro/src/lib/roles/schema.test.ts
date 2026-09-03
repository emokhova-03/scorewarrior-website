import { describe, expect, it } from "vitest";
import { parseRoles, roleSchema } from "./schema";

/**
 * Тесты не трогают файловую систему: parseRoles — чистая функция,
 * ей передают уже готовое значение. Фикстуры-файлы из старой версии
 * (test/fixtures/*.json) больше не нужны — чтение файла проверяется
 * отдельно, на уровне loader'а, и это правильное разделение:
 * здесь тестируются ПРАВИЛА, а не транспорт.
 */

const validRole = {
  slug: "test-role-one",
  title: "[TEST] Role One",
  department: "[TEST] Department",
  location: "On-site — Limassol, Cyprus",
};

describe("roleSchema", () => {
  it("принимает корректную вакансию", () => {
    const result = roleSchema.safeParse(validRole);

    expect(result.success).toBe(true);
  });

  it("обрезает пробелы в title", () => {
    const result = roleSchema.safeParse({
      ...validRole,
      title: "  Backend Engineer  ",
    });

    expect(result.success).toBe(true);
    // .trim() применился до проверки — в данных лежит уже чистая строка
    expect(result.success && result.data.title).toBe("Backend Engineer");
  });

  it("отклоняет title из одних пробелов", () => {
    const result = roleSchema.safeParse({ ...validRole, title: "   " });

    expect(result.success).toBe(false);
  });

  it("отклоняет slug с заглавными буквами и пробелами", () => {
    expect(
      roleSchema.safeParse({ ...validRole, slug: "Backend Engineer" }).success,
    ).toBe(false);
    expect(
      roleSchema.safeParse({ ...validRole, slug: "backend_engineer" }).success,
    ).toBe(false);
    expect(
      roleSchema.safeParse({ ...validRole, slug: "-backend" }).success,
    ).toBe(false);
  });

  it("выбрасывает лишние поля, а не падает на них", () => {
    const result = roleSchema.safeParse({
      ...validRole,
      internalAtsId: 42,
      salaryBand: "secret",
    });

    // Важное свойство для интеграции с внешним источником: ATS может
    // добавить в ответ новые поля, и это не должно ломать сайт.
    expect(result.success).toBe(true);
    expect(result.success && "internalAtsId" in result.data).toBe(false);
  });
});

describe("parseRoles", () => {
  it("разбирает валидный массив", () => {
    const result = parseRoles([validRole]);

    expect(result.ok).toBe(true);
    expect(result.ok && result.roles).toHaveLength(1);
    expect(result.ok && result.problems).toHaveLength(0);
    expect(result.ok && result.roles[0]?.slug).toBe("test-role-one");
  });

  it("считает пустой список пригодным источником", () => {
    // Ноль вакансий — это законное состояние (F2.AC4, empty state),
    // а не отказ источника. Разница принципиальная.
    const result = parseRoles([]);

    expect(result.ok).toBe(true);
    expect(result.ok && result.roles).toHaveLength(0);
    expect(result.ok && result.problems).toHaveLength(0);
  });

  it("пропускает невалидную запись и сохраняет остальные", () => {
    const result = parseRoles([
      validRole,
      { ...validRole, slug: "role-two", title: "" },
    ]);

    expect(result.ok).toBe(true);
    expect(result.ok && result.roles).toHaveLength(1);
    expect(result.ok && result.problems).toHaveLength(1);
    expect(result.ok && result.problems[0]).toContain("title");
  });

  it("отклоняет повторяющийся slug", () => {
    const result = parseRoles([
      validRole,
      { ...validRole, title: "[TEST] Role One Again" },
    ]);

    expect(result.ok).toBe(true);
    expect(result.ok && result.roles).toHaveLength(1);
    expect(result.ok && result.problems[0]).toContain("has already been used");
  });

  it("отказывает, если источник — не массив", () => {
    expect(parseRoles({ roles: [validRole] }).ok).toBe(false);
    expect(parseRoles(null).ok).toBe(false);
    expect(parseRoles("[]").ok).toBe(false);
  });

  it("сообщает номер проблемной записи", () => {
    const result = parseRoles([validRole, null]);

    expect(result.ok && result.problems[0]).toContain("#1");
  });
});
