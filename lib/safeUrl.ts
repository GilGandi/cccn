// Sanitiza URLs para uso em href — evita javascript:/data:/vbscript: URIs

export function safeHref(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '#'
  const trimmed = url.trim().toLowerCase()
  // Protocolos perigosos
  if (trimmed.startsWith('javascript:')) return '#'
  if (trimmed.startsWith('data:'))       return '#'
  if (trimmed.startsWith('vbscript:'))   return '#'
  if (trimmed.startsWith('file:'))       return '#'
  // Só permite http(s), mailto, tel e relative paths
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return url.trim()
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:'))     return url.trim()
  if (trimmed.startsWith('/') || trimmed.startsWith('#'))              return url.trim()
  // Qualquer outra coisa: bloqueia
  return '#'
}

/** Sanitiza apenas URLs absolutas externas (http/https) */
export function safeExternalHref(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (trimmed.toLowerCase().startsWith('https://') || trimmed.toLowerCase().startsWith('http://')) {
    return trimmed
  }
  return null
}

/** Sanitiza URL de imagem — permite o domínio configurado do R2, URLs legadas e caminhos locais. */
export function safeImageSrc(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (trimmed.startsWith('/')) return trimmed

  try {
    const candidate = new URL(trimmed)
    if (candidate.protocol !== 'https:') return null
    if (candidate.hostname === 'res.cloudinary.com') return trimmed

    const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    if (!publicBase) return null
    const base = new URL(publicBase)
    if (base.protocol !== 'https:' || candidate.origin !== base.origin) return null
    const prefix = base.pathname.replace(/\/+$/, '')
    return !prefix || candidate.pathname === prefix || candidate.pathname.startsWith(`${prefix}/`) ? trimmed : null
  } catch {
    return null
  }
}
