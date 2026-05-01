'use client'
import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth' // Importe o tipo Session

interface AdminProvidersProps {
  children: React.ReactNode;
  session: Session | null; // Adicione a prop session
}

export default function AdminProviders({ children, session }: AdminProvidersProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
