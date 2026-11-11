import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isFontKey, type FontKey } from "@/lib/font-options";

export const getFontKey = unstable_cache(
  async (): Promise<FontKey> => {
    try {
      const settings = await prisma.siteSettings.findUnique({
        where: { id: "singleton" },
      });
      return isFontKey(settings?.fontKey) ? settings.fontKey : "default";
    } catch {
      return "default";
    }
  },
  ["site-font"],
  { tags: ["site-settings"] }
);
