import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Comunidade Cristã de Campos Novos — C.C.C.N',
  description:
    'C.C.C.N Ministério Apostólico do Coração de Deus. Cultos aos domingos das 19h às 21h. Rua João Gonçalves de Araújo, 829 — Bairro Aparecida, Campos Novos – SC.',
  keywords: ['igreja', 'Campos Novos', 'comunidade cristã', 'CCCN', 'culto', 'evangélica'],
  openGraph: {
    title: 'Comunidade Cristã de Campos Novos',
    description: 'Ministério Apostólico do Coração de Deus. Cultos aos domingos das 19h às 21h.',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
