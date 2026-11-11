export const FONT_OPTIONS = [
  { key: "default", label: "Fonte atual do site" },
  { key: "sfpro", label: "SF Pro" },
  { key: "technovier", label: "Technovier" },
  { key: "helvetica", label: "Helvetica" },
  { key: "playfair", label: "Playfair Display" },
] as const;

export type FontKey = (typeof FONT_OPTIONS)[number]["key"];

export const FONT_KEYS: string[] = FONT_OPTIONS.map((f) => f.key);

export function isFontKey(value: unknown): value is FontKey {
  return typeof value === "string" && FONT_KEYS.includes(value);
}
