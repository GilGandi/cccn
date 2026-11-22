import { prisma } from '@/lib/prisma'
import { getGoogleDriveGallery } from '@/lib/googleDriveGallery'

export async function getConfiguredGallery() {
  const driveAlbums = await getGoogleDriveGallery()
  const configs = driveAlbums.length
    ? await prisma.galeriaCategoria.findMany({ where: { driveFolderId: { in: driveAlbums.map(album => album.id) } } })
    : []
  const byFolderId = new Map<string | null, (typeof configs)[number]>(configs.map(config => [config.driveFolderId, config] as const))

  return driveAlbums.map(album => {
    const config = byFolderId.get(album.id)
    return {
      ...album,
      nome: config?.nome?.trim() || album.nome,
      descricao: config?.descricao ?? album.descricao,
      capaUrl: config?.capaUrl && album.fotos.some(foto => foto.url === config.capaUrl)
        ? config.capaUrl
        : album.capaUrl,
      categoria: config?.categoria ?? null,
    }
  })
}
