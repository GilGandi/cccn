import type { Metadata } from 'next'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata: Metadata = { title: 'Admin — CCCN' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6 sm:p-10 overflow-auto">
        {children}
      </main>
    </div>
  )
}
