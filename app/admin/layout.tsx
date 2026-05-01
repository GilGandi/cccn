// app/admin/layout.tsx (CORREÇÃO FINAL)

import type { Metadata } from 'next'

import AdminProviders from './providers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import WoodCross from '@/components/WoodCross'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation' // <--- ADICIONE ESTE IMPORT PARA O redirect

// IMPORTAÇÃO CORRIGIDA:
import { authOptions } from '@/app/api/auth/options' // <--- Importe suas authOptions DIRETAMENTE do arquivo options.ts

export const metadata : Metadata = { title : 'Admin — CCCN' }

export default async function AdminLayout ( { children } : { children : React . ReactNode } ) {

const session = await getServerSession ( authOptions )

if ( ! session ) {
  redirect ( '/admin/login' ) ;
}

return (
  // Passe a sessão para o AdminProviders
  < AdminProviders session = { session } >
    < div className = "min-h-screen bg-[#0d0d0d] flex" >
      < AdminSidebar />
      { /* pt-14 compensa a top bar fixa no mobile */ }
      < main className = "flex-1 min-w-0 p-4 sm:p-6 lg:p-10 pt-20 lg:pt-10 overflow-auto relative" >
        < WoodCross opacity = { 0.025 } />
        < div className = "relative z-10" >
          { children }
        </ div >
      </ main >
    </ div >
  </ AdminProviders >
)

}
