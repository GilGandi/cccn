// Sanitiza URLs para uso em href — evita javascript:/data:/vbscript: URIs

export function safeHref(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '#'
  const trimmed = url.trim().toLowerCase()
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:') || trimmed.startsWith('file:')) return '#'
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return url.trim()
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) return url.trim()
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return url.trim()
  return '#'
}

/** Sanitiza URL externa para links. */
export function safeExternalHref(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  try {
    const candidate = new URL(trimmed)
    return candidate.protocol === 'https:' && !candidate.username && !candidate.password ? trimmed : null
  } catch { return null }
}

/** Sanitiza URLs de imagem HTTPS ou caminhos locais seguros. */
export function safeImageSrc(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed
  try {
    const candidate = new URL(trimmed)
    if (candidate.protocol !== 'https:' || !candidate.hostname || candidate.username || candidate.password) return null
    return trimmed
  } catch {
    return null
  }
}
