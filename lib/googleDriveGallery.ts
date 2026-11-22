export type DrivePhoto = { id: string; url: string; legenda: string | null }
export type DriveAlbum = {
  id: string
  nome: string
  descricao: string | null
  capaUrl: string | null
  categoria: string | null
  fotos: DrivePhoto[]
}

type DriveEntry = { id: string; name: string; isFolder: boolean }

const DRIVE_EMBED = 'https://drive.google.com/embeddedfolderview'
const FOLDER_ID_PATTERN = /^[a-zA-Z0-9_-]{10,200}$/
const IMAGE_EXTENSIONS = /\.(avif|bmp|gif|heic|heif|jpeg|jpg|png|tif|tiff|webp)$/i

function folderIdFromEnv(): string {
  const configured = process.env.GOOGLE_DRIVE_GALLERY_FOLDER_URL?.trim()
  if (!configured) throw new Error('Configure GOOGLE_DRIVE_GALLERY_FOLDER_URL com o link da pasta pública do Google Drive.')
  const folderMatch = configured.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  const queryMatch = configured.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  const id = folderMatch?.[1] ?? queryMatch?.[1] ?? configured
  if (!FOLDER_ID_PATTERN.test(id)) throw new Error('GOOGLE_DRIVE_GALLERY_FOLDER_URL não contém um ID de pasta válido.')
  return id
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/\\u003d/gi, '=').replace(/\\u0026/gi, '&').replace(/\\x3d/gi, '=')
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))
  return match ? decodeHtml(match[2]).trim() : null
}

function driveIdFromHref(href: string): { id: string; isFolder: boolean } | null {
  const decoded = decodeHtml(href)
  const folder = decoded.match(/(?:\/folders\/|\/drive\/(?:u\/\d+\/)?folders\/)([a-zA-Z0-9_-]+)/)
  if (folder) return { id: folder[1], isFolder: true }
  const file = decoded.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (file) return { id: file[1], isFolder: false }
  const open = decoded.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (open) return { id: open[1], isFolder: false }
  return null
}

function entriesFromHtml(source: string): DriveEntry[] {
  const html = decodeHtml(source)
  const entries = new Map<string, DriveEntry>()
  const anchors = html.match(/<a\b[^>]*>[\s\S]*?<\/a\s*>/gi) ?? []

  for (const anchor of anchors) {
    const opening = anchor.match(/^<a\b[^>]*>/i)?.[0] ?? anchor
    const href = attr(opening, 'href')
    if (!href) continue
    const driveRef = driveIdFromHref(href)
    if (!driveRef || !FOLDER_ID_PATTERN.test(driveRef.id)) continue

    const label = attr(opening, 'aria-label')
      || attr(opening, 'title')
      || attr(opening, 'data-tooltip')
      || anchor.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const name = decodeHtml(label).replace(/^Open\s+/i, '').trim()
    if (!driveRef.isFolder && !IMAGE_EXTENSIONS.test(name)) continue
    if (!entries.has(driveRef.id)) entries.set(driveRef.id, { id: driveRef.id, name: name || driveRef.id, isFolder: driveRef.isFolder })
  }

  return [...entries.values()]
}

async function folderPage(folderId: string): Promise<string> {
  const url = new URL(DRIVE_EMBED)
  url.searchParams.set('id', folderId)
  url.hash = 'grid'
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CCCNGallery/1.0)' },
    next: { revalidate: 300 },
  })
  if (!response.ok) throw new Error(`Não foi possível ler a pasta pública do Google Drive (status ${response.status}).`)
  const html = await response.text()
  if (/accounts\.google\.com|ServiceLogin/i.test(html) && !/flip-entry|drive-viewer/i.test(html)) {
    throw new Error('A pasta do Google Drive não está pública. Ajuste o acesso para “Qualquer pessoa com o link — Leitor”.')
  }
  return html
}

async function listFolder(folderId: string): Promise<DriveEntry[]> {
  const entries = entriesFromHtml(await folderPage(folderId))
  return entries.filter(entry => entry.id !== folderId)
}

function photosToAlbum(folder: DriveEntry, items: DriveEntry[]): DriveAlbum | null {
  const fotos = items
    .filter(item => !item.isFolder && IMAGE_EXTENSIONS.test(item.name))
    .map(item => ({
      id: item.id,
      url: `https://drive.google.com/thumbnail?id=${encodeURIComponent(item.id)}&sz=w2000`,
      legenda: item.name.replace(/\.[^.]+$/, ''),
    }))
  return { id: folder.id, nome: folder.name, descricao: null, capaUrl: fotos[0]?.url ?? null, categoria: null, fotos }
}

/** Lê somente a pasta pública e suas subpastas imediatas; nenhuma permissão de escrita é solicitada. */
export async function getGoogleDriveGallery(): Promise<DriveAlbum[]> {
  const rootId = folderIdFromEnv()
  const folders = (await listFolder(rootId)).filter(entry => entry.isFolder)
  const albums = await Promise.all(folders.map(async folder => photosToAlbum(folder, await listFolder(folder.id))))
  return albums.filter((album): album is DriveAlbum => album !== null)
}

export async function getGoogleDriveGalleryFolderName(): Promise<string> {
  const html = await folderPage(folderIdFromEnv())
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
  const name = decodeHtml((title || heading || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
  return name.replace(/\s*-\s*Google Drive\s*$/i, '') || 'Pasta pública do Google Drive'
}
