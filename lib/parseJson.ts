import { NextRequest, NextResponse } from 'next/server'

const MAX_BODY_SIZE = 100 * 1024 // 100KB — mais que suficiente para qualquer form

/** Parse seguro de JSON com limite de tamanho */
export async function parseJson(req: NextRequest): Promise<{ ok: true; data: any } | { ok: false; response: NextResponse }> {
  // Valida Content-Type
  const ct = req.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    return { ok: false, response: NextResponse.json({ error: 'Content-Type deve ser application/json' }, { status: 400 }) }
  }

  // Valida Content-Length
  const cl = req.headers.get('content-length')
  if (cl && parseInt(cl) > MAX_BODY_SIZE) {
    return { ok: false, response: NextResponse.json({ error: 'Body muito grande' }, { status: 413 }) }
  }

  try {
    const text = await req.text()
    if (text.length > MAX_BODY_SIZE) {
      return { ok: false, response: NextResponse.json({ error: 'Body muito grande' }, { status: 413 }) }
    }
    const data = JSON.parse(text)
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false, response: NextResponse.json({ error: 'Body deve ser um objeto JSON' }, { status: 400 }) }
    }
    return { ok: true, data }
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }
  }
}
