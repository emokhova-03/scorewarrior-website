import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

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
export const collections = { timeline, team, openSource, gameArt, offices };