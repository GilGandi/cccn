import { Playfair_Display } from "next/font/google";
import localFont from "next/font/local";

export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
});

// O arquivo precisa existir em public/fonts/Technovier.woff2
export const technovier = localFont({
  src: "../public/fonts/Technovier.woff2",
  variable: "--font-technovier",
  display: "swap",
  preload: false,
});
