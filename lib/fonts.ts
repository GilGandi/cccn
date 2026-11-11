import localFont from "next/font/local";

// O arquivo precisa existir em public/fonts/Technovier.woff2
export const technovier = localFont({
  src: "../public/fonts/Technovier.woff2",
  variable: "--font-technovier",
  display: "swap",
  preload: false,
});
