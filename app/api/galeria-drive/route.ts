import { NextResponse } from 'next/server'
import { getGoogleDriveGallery, getGoogleDriveGalleryFolderName } from '@/lib/googleDriveGallery'

export const revalidate = 300

export async function GET() {
  try {
    const [albuns, nomePasta] = await Promise.all([getGoogleDriveGallery(), getGoogleDriveGalleryFolderName()])
    return NextResponse.json({ albuns, nomePasta })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível ler a pasta configurada do Google Drive.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
