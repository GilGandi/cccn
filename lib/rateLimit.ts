// Rate limiter em memória — simples e sem dependência externa
// Para escala maior, substituir por Upstash Redis.

const store = new Map<string, { count: number; reset: number }>()

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return true
  }

  if (entry.count >= max) return false

  entry.count++
  return true
}

// Limpeza periódica para evitar memory leak
if (typeof globalThis !== 'undefined' && !(globalThis as any).__rateLimitCleanup) {
  ;(globalThis as any).__rateLimitCleanup = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (now > entry.reset) store.delete(key)
    }
  }, 5 * 60 * 1000)
}
