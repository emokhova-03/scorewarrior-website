import type { ImageMetadata } from "astro";
// Один запрос ко всем растровым файлам в src/assets.
// eager: true — импортировать сразу, а не по требованию:
// нам нужны метаданные во время сборки страницы.
const modules = import.meta.glob<{ default: ImageMetadata }>(
"/src/assets/**/*.{jpg,jpeg,png,webp,avif}",
{ eager: true },
);
// "/src/assets/team/katerina.jpg" -> "team/katerina"
export const images: Record<string, ImageMetadata> = Object.fromEntries(
Object.entries(modules).map(([path, mod]) => [
path.replace("/src/assets/", "").replace(/\.[a-z]+$/i, ""),
mod.default,
]),

);
export function img(key: string): ImageMetadata {
const found = images[key];
if (!found) {
throw new Error(
`Изображение "${key}" не найдено в src/assets.\n` +
`Доступные ключи:\n ` +
Object.keys(images).sort().join("\n "),
);
}

return found;
}