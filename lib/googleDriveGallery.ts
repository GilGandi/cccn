export type DrivePhoto = { id: string; url: string; legenda: string | null }
export type DriveAlbum = { id: string; nome: string; descricao: string | null; capaUrl: string | null; fotos: DrivePhoto[] }

type DriveFile = { id: string; name: string; mimeType: string; description?: string | null }
type DriveListResponse = { files?: DriveFile[]; nextPageToken?: string }

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const FOLDER_MIME = 'application/vnd.google-apps.folder'

function folderIdFromEnv(): string {
  const configured = process.env.GOOGLE_DRIVE_GALLERY_FOLDER_URL?.trim()
  if (!configured) throw new Error('Configure GOOGLE_DRIVE_GALLERY_FOLDER_URL com o link da pasta pública do Google Drive.')
  const folderMatch = configured.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  const queryMatch = configured.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  const id = folderMatch?.[1] ?? queryMatch?.[1] ?? configured
  if (!/^[a-zA-Z0-9_-]{10,200}$/.test(id)) throw new Error('GOOGLE_DRIVE_GALLERY_FOLDER_URL não contém um ID de pasta válido.')
  return id
}

function apiKey(): string {
  const key = process.env.GOOGLE_DRIVE_API_KEY?.trim()
  if (!key) throw new Error('Configure GOOGLE_DRIVE_API_KEY com uma chave da Google Drive API.')
  return key
}

async function driveJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, { next: { revalidate: 300 } })
  if (!response.ok) {
    let detail = ''
    try {
      const payload = await response.json() as { error?: { message?: string } }
      detail = payload.error?.message || ''
    } catch { /* resposta não JSON */ }
    throw new Error(detail || `Google Drive API respondeu com status ${response.status}.`)
  }
  return response.json() as Promise<T>
}

async function folderInfo(id: string, key: string): Promise<DriveFile> {
  const url = new URL(`${DRIVE_API}/files/${encodeURIComponent(id)}`)
  url.searchParams.set('key', key)
  url.searchParams.set('fields', 'id,name,mimeType')
  return driveJson<DriveFile>(url)
}

async function childrenOf(folderId: string, key: string): Promise<DriveFile[]> {
  const files: DriveFile[] = []
  let pageToken: string | undefined
  for (let page = 0; page < 5; page++) {
    const url = new URL(`${DRIVE_API}/files`)
    url.searchParams.set('key', key)
    url.searchParams.set('q', `'${folderId}' in parents and trashed = false`)
    url.searchParams.set('pageSize', '1000')
    url.searchParams.set('orderBy', 'folder,name')
    url.searchParams.set('fields', 'nextPageToken,files(id,name,mimeType,description)')
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    const data = await driveJson<DriveListResponse>(url)
    files.push(...(data.files ?? []))
    pageToken = data.nextPageToken
    if (!pageToken) break
  }
  return files
}

function imagesToAlbum(id: string, name: string, items: DriveFile[]): DriveAlbum | null {
  const photos = items
    .filter(item => item.mimeType.startsWith('image/'))
    .map(item => ({
      id: item.id,
      url: `https://drive.google.com/thumbnail?id=${encodeURIComponent(item.id)}&sz=w2000`,
      legenda: item.description?.trim() || item.name.replace(/\.[^.]+$/, ''),
    }))
  if (!photos.length) return null
  return { id, nome: name, descricao: null, capaUrl: photos[0].url, fotos: photos }
}

/** Lista imagens na pasta escolhida e transforma subpastas imediatas em álbuns. */
export async function getGoogleDriveGallery(): Promise<DriveAlbum[]> {
  const key = apiKey()
  const rootId = folderIdFromEnv()
  const [root, rootItems] = await Promise.all([folderInfo(rootId, key), childrenOf(rootId, key)])
  if (root.mimeType !== FOLDER_MIME) throw new Error('O link informado não aponta para uma pasta do Google Drive.')
  const folders = rootItems.filter(item => item.mimeType === FOLDER_MIME)
  const rootImages = imagesToAlbum('drive-root-images', 'Geral', rootItems)
  const childAlbums = await Promise.all(folders.map(async folder => {
    const contents = await childrenOf(folder.id, key)
    return imagesToAlbum(folder.id, folder.name, contents)
  }))
  return [ ...(rootImages ? [rootImages] : []), ...childAlbums.filter((album): album is DriveAlbum => album !== null) ]
}

export async function getGoogleDriveGalleryFolderName(): Promise<string> {
  const info = await folderInfo(folderIdFromEnv(), apiKey())
  if (info.mimeType !== FOLDER_MIME) throw new Error('O link informado não aponta para uma pasta do Google Drive.')
  return info.name
}
