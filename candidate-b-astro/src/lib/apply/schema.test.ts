import { describe, expect, it } from "vitest";

import { applicationSchema, fieldErrors } from "./schema";

/**
 * The schema sits on the boundary where an untrusted form POST becomes a
 * typed Application, so these tests are as much about what it *rejects* as
 * what it accepts.
 */

const validApplication = {
  roleSlug: "test-backend-engineer",
  name: "[TEST] Applicant Name",
  email: "applicant@example.test",
  link: "https://example.test/portfolio",
  message:
    "[TEST] I have been building backend services for several years and would like to join the team.",
  consent: "on",
};

describe("applicationSchema", () => {
  it("принимает корректную заявку", () => {
    const result = applicationSchema.safeParse(validApplication);

    expect(result.success).toBe(true);
  });

  it("отклоняет заявку без согласия", () => {
    /**
     * Неотмеченный чекбокс браузер не отправляет вовсе — поля просто нет.
     * Поэтому проверяется отсутствие ключа, а не consent: "off".
     */
    const { consent: _consent, ...withoutConsent } = validApplication;

    const result = applicationSchema.safeParse(withoutConsent);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(fieldErrors(result.error).consent).toBe(
        "Please confirm you agree to the privacy policy",
      );
    }
  });

  it("принимает пустую ссылку", () => {
    // Незаполненное поле формы приходит пустой строкой, и это законно:
    // портфолио необязательно.
    const result = applicationSchema.safeParse({
      ...validApplication,
      link: "",
    });

    expect(result.success).toBe(true);
  });

  it("отклоняет ссылку без схемы", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      link: "example.test/portfolio",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(fieldErrors(result.error).link).toBe(
        "Portfolio link must be a full URL, including https://",
      );
    }
  });

  it("отклоняет слишком короткое сообщение", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      message: "Hi, hire me.",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(fieldErrors(result.error).message).toBe(
        "Tell us a bit more — a couple of sentences is enough",
      );
    }
  });

  it("отклоняет имя из одних пробелов", () => {
    /**
     * .trim() выполняется ДО .min(2), поэтому "   " становится пустой
     * строкой и не проходит. Без trim пробелы прошли бы как имя.
     */
    const result = applicationSchema.safeParse({
      ...validApplication,
      name: "   ",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(fieldErrors(result.error).name).toBe("Enter your full name");
    }
  });

  it("отклоняет slug, не похожий на slug", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      roleSlug: "../../etc/passwd",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(fieldErrors(result.error).roleSlug).toBe("Unknown role");
    }
  });
});

describe("fieldErrors", () => {
  it("даёт по одному сообщению на поле, а не список", () => {
    /**
     * Кандидату незачем видеть три претензии к одному полю сразу — форма
     * должна показать первую и дать исправить. Здесь ломаются три поля,
     * и ожидается ровно три ключа.
     */
    const result = applicationSchema.safeParse({
      ...validApplication,
      name: "",
      email: "not-an-email",
      message: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = fieldErrors(result.error);

      expect(Object.keys(errors).sort()).toEqual([
        "email",
        "message",
        "name",
      ]);

      // Значения — строки, а не массивы: по одному сообщению на поле.
      for (const message of Object.values(errors)) {
        expect(typeof message).toBe("string");
      }
    }
  });

  it("оставляет первое сообщение, если поле нарушило несколько правил", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      email: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const issuesForEmail = result.error.issues.filter(
        (issue) => issue.path[0] === "email",
      );

      const errors = fieldErrors(result.error);

      expect(errors.email).toBe(issuesForEmail[0].message);
      expect(Object.keys(errors)).toContain("email");
    }
  });
});
