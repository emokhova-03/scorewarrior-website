/*
* describe Группа тестов с общим названием. Нужна для читаемого вывода
*it Один тест. Название читается как утверждение: «it loads a valid file»
*expect(x) Начало проверки
.toBe(y) Строгое равенство. Для строк, чисел, логических значений
.toHaveLength(n) Длина массива
.toContain(s) Массив содержит элемент, либо строка содержит подстроку
.toBeUndefined() Значение отсутствует
?. Безопасное обращение к полю: если значения нет, вернёт «ничего» вместо падения
*/

import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { loadRoles, findRoleBySlug, validateRole } from "./roles";
/*Функция fixture - дай мне имя текстового файла и я верну тебе полный путь. к этому файлу */
function fixture(name: string): string {
  return resolve(process.cwd(), "test", "fixtures", name); //resolve - функция, которая собирает кусочки пути в один нормальный абсолютный путь
} //если очень грубо сравнивать, то process.cwd равен pwd терминала
describe("loadRoles", () => {
  it("loads a valid file", () => {
    const result = loadRoles(fixture("roles.valid.json"));

    expect(result.status).toBe("ok");
    expect(result.roles).toHaveLength(1);
    expect(result.problems).toHaveLength(0);
    expect(result.roles[0]?.slug).toBe("test-role-one");
  });
  it("treats an empty list as a usable source", () => {
    const result = loadRoles(fixture("roles.empty.json"));

    expect(result.status).toBe("ok");
    expect(result.roles).toHaveLength(0);
    expect(result.problems).toHaveLength(0);
  });
  it("skips invalid entries and keeps the valid ones", () => {
    const result = loadRoles(fixture("roles.partially-invalid.json"));

    expect(result.status).toBe("ok");
    expect(result.roles).toHaveLength(1);
    expect(result.problems).toHaveLength(1);
    expect(result.problems[0]).toContain("title");
  });

  it("reports a malformed source", () => {
    const result = loadRoles(fixture("roles.not-json.txt"));

    expect(result.status).toBe("malformed");
    expect(result.roles).toHaveLength(0);
    expect(result.problems).toHaveLength(1);
  });

  it("reports an unavailable source", () => {
    const result = loadRoles(fixture("roles.does-not-exist.json"));

    expect(result.status).toBe("unavailable");
    expect(result.roles).toHaveLength(0);
  });
});

describe("validateRole", () => {
  it("rejects a non-object entry", () => {
    const result = validateRole(null, 0);

    expect(result.ok).toBe(false);
  });
  it("rejects an entry with a blank title", () => {
    const result = validateRole(
      {
        slug: "test-role",
        title: " ",
        department: "[TEST] Department",
        location: "On-site — Limassol, Cyprus",
      },
      0,
    );

    expect(result.ok).toBe(false);
  });
});
describe("findRoleBySlug", () => {
  it("returns undefined for an unknown slug", () => {
    const { roles } = loadRoles(fixture("roles.valid.json"));

    expect(findRoleBySlug(roles, "banana")).toBeUndefined();
  });
  it("finds an existing role", () => {
    const { roles } = loadRoles(fixture("roles.valid.json"));

    expect(findRoleBySlug(roles, "test-role-one")?.title).toBe(
      "[TEST] Role One",
    );
  });
});
