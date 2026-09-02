import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";
import { rolesFileLoader } from "./lib/roles/loader";
import { roleSchema } from "./lib/roles/schema";

// Вакансии — единственная коллекция со своим loader'ом: у неё другой контракт
// отказа, чем у бренд-контента (см. комментарий в lib/roles/loader.ts).
// Схема лежит в lib/roles/schema.ts, а не здесь, потому что она нужна ещё
// и в тестах, и на Шаге 3 — в рантайме, при чтении из KV.
const roles = defineCollection({
  loader: rolesFileLoader({ path: "data/roles.json" }),
  schema: roleSchema,
});

// Поле, которое есть во всех коллекциях: явный порядок вывода.
// Объявлено один раз и подмешивается спредом в каждую схему.
const ordered = { order: z.number().int().positive() };
const timeline = defineCollection({
  loader: file("src/data/timeline.json"),
  schema: z.object({
    ...ordered,
    year: z.string().regex(/^\d{4}$/, "год — четыре цифры"),
    text: z.string().min(40),
  }),
});
const team = defineCollection({
  loader: file("src/data/team.json"),
  schema: z.object({
    ...ordered,
    name: z.string().min(1),
    role: z.string().min(1),
    photo: z.string().startsWith("team/"),
    quote: z.string().min(20),
  }),
});
const openSource = defineCollection({
  loader: file("src/data/open-source.json"),
  schema: z.object({
    ...ordered,
    name: z.string().min(1),
    url: z.string().url(),
    logo: z.string().startsWith("/opensource/"),
  }),
});
const gameArt = defineCollection({
  loader: file("src/data/game-art.json"),
  schema: z.object({
    ...ordered,
    image: z.string().startsWith("game/"),
    alt: z.string().min(3),
  }),
});
const offices = defineCollection({
  loader: file("src/data/offices.json"),
  schema: z.object({
    ...ordered,
    name: z.string().min(1),
    address: z.string().min(10),
    mapUrl: z.string().url(),
  }),
});
export const collections = {
  timeline,
  team,
  openSource,
  gameArt,
  offices,
  roles,
};
