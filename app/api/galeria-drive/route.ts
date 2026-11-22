import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { getConfiguredGallery } from '@/lib/galleryAlbums'
import { getGoogleDriveGallery, getGoogleDriveGalleryFolderName } from '@/lib/googleDriveGallery'
import { prisma } from '@/lib/prisma'

export const revalidate = 300

export async function GET() {
  try {
    const [albuns, nomePasta] = await Promise.all([getConfiguredGallery(), getGoogleDriveGalleryFolderName()])
    return NextResponse.json({ albuns, nomePasta })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível ler a pasta pública configurada do Google Drive.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const { albumId, descricao, categoria, capaUrl } = parsed.data

  if (typeof albumId !== 'string' || !albumId.trim()) {
    return NextResponse.json({ error: 'Álbum inválido.' }, { status: 400 })
  }
  if (descricao != null && typeof descricao !== 'string') {
    return NextResponse.json({ error: 'A descrição informada é inválida.' }, { status: 400 })
  }
  if (categoria != null && typeof categoria !== 'string') {
    return NextResponse.json({ error: 'A categoria informada é inválida.' }, { status: 400 })
  }
  if (capaUrl != null && typeof capaUrl !== 'string') {
    return NextResponse.json({ error: 'A foto de capa informada é inválida.' }, { status: 400 })
  }

  try {
    const discovered = await getGoogleDriveGallery()
    const album = discovered.find(item => item.id === albumId)
    if (!album) return NextResponse.json({ error: 'A subpasta não pertence à pasta pública configurada.' }, { status: 404 })
    const normalizedCover = capaUrl?.trim() || null
    if (normalizedCover && !album.fotos.some(foto => foto.url === normalizedCover)) {
      return NextResponse.json({ error: 'Escolha uma foto desta subpasta para usar como capa.' }, { status: 400 })
    }

    const data = {
      nome: album.nome,
      descricao: descricao?.trim().slice(0, 500) || null,
      capaUrl: normalizedCover,
      categoria: categoria?.trim().slice(0, 80) || null,
    }
    const saved = await prisma.galeriaCategoria.upsert({
      where: { driveFolderId: album.id },
      create: { ...data, driveFolderId: album.id, ordem: 0 },
      update: data,
    })
    return NextResponse.json({ ok: true, albumId: saved.driveFolderId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível salvar os dados do álbum.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
