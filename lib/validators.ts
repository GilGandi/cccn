// Validadores reutilizáveis entre as rotas

export function isValidVideoUrl(url: string): boolean {
  try {
    const u = new URL(url)
    const allowed = ['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'www.vimeo.com']
    return allowed.includes(u.hostname) && u.protocol === 'https:'
  } catch { return false }
}

export function isValidPlaylistUrl(url: string): boolean {
  try {
    const u = new URL(url)
    const allowed = ['open.spotify.com', 'www.spotify.com', 'youtube.com', 'www.youtube.com', 'youtu.be', 'music.youtube.com']
    return allowed.includes(u.hostname) && u.protocol === 'https:'
  } catch { return false }
}

/** Aceita somente URLs externas HTTPS sem credenciais embutidas. */
export function isValidMediaUrl(url: string): boolean {
  try {
    const candidate = new URL(url)
    return candidate.protocol === 'https:' && Boolean(candidate.hostname) && !candidate.username && !candidate.password
  } catch { return false }
}

export function isValidMapsUrl(url: string): boolean {
  if (!url) return true
  try {
    const u = new URL(url)
    return ['maps.google.com', 'www.google.com', 'goo.gl', 'maps.app.goo.gl'].includes(u.hostname) && u.protocol === 'https:'
  } catch { return false }
}

export function isValidSocialUrl(url: string, type: 'instagram' | 'facebook' | 'tiktok'): boolean {
  if (!url) return true
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') return false
    if (type === 'instagram') return ['instagram.com', 'www.instagram.com'].includes(u.hostname)
    if (type === 'tiktok') return ['tiktok.com', 'www.tiktok.com'].includes(u.hostname)
    return ['facebook.com', 'www.facebook.com', 'fb.com'].includes(u.hostname)
  } catch { return false }
}

export function isValidHandle(handle: string): boolean {
  if (!handle) return true
  return /^[a-zA-Z0-9._-]{1,50}$/.test(handle)
}

export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string' || email.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function sanitizeText(text: string, maxLen: number): string {
  return text.trim().slice(0, maxLen)
}

export function isValidCuid(id: string): boolean {
  return typeof id === 'string' && /^c[a-z0-9]{24}$/.test(id)
}

export function stripHtml(text: string): string {
  if (typeof text !== 'string') return ''
  return text.replace(/<[^>]*>/g, '')
}
