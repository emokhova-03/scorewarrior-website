import { describe, expect, it } from "vitest";
import { byOrder } from "./collections";
describe("byOrder", () => {
  const input = [
    { data: { order: 3 } },
    { data: { order: 1 } },
    { data: { order: 2 } },
  ];
  it("сортирует по возрастанию order", () => {
    expect(byOrder(input).map((e) => e.data.order)).toEqual([1, 2, 3]);
  });
  it("не мутирует исходный массив", () => {
    byOrder(input);
    expect(input[0].data.order).toBe(3);
  });
});
