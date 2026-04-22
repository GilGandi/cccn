// Validadores reutilizáveis entre as rotas

export function isValidVideoUrl(url: string): boolean {
  try {
    const u = new URL(url)
    const allowed = ['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'www.vimeo.com']
    return allowed.includes(u.hostname) && u.protocol === 'https:'
  } catch {
    return false
  }
}

export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function sanitizeText(text: string, maxLen: number): string {
  return text.trim().slice(0, maxLen)
}
