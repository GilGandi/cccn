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
  description: 'C.C.C.N Ministério Apostólico do Coração de Deus. Cultos aos domingos das 19h às 21h. Rua João Gonçalves de Araújo, 829 — Bairro Aparecida, Campos Novos – SC.',
  keywords: ['igreja', 'Campos Novos', 'comunidade cristã', 'CCCN', 'culto', 'evangélica'],
  metadataBase: new URL('https://cccn.up.railway.app'),
  openGraph: {
    title: 'Comunidade Cristã de Campos Novos',
    description: 'Ministério Apostólico do Coração de Deus. Cultos aos domingos das 19h às 21h.',
    locale: 'pt_BR',
    type: 'website',
  },
  other: {
    'theme-color': '#0a0a0a',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Church',
  name: 'Comunidade Cristã de Campos Novos',
  alternateName: 'CCCN',
  url: 'https://cccn.up.railway.app',
  telephone: '+554991529414',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua João Gonçalves de Araújo, 829',
    addressLocality: 'Campos Novos',
    addressRegion: 'SC',
    postalCode: '89620-000',
    addressCountry: 'BR',
  },
  openingHours: 'Su 19:00-21:00',
  sameAs: ['https://instagram.com/cccnchurch'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
