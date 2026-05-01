import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const createPrismaClient = () => {
  // Forçar sslmode=verify-full para suprimir warning do pg sobre SSL
  const connString = (process.env.DATABASE_URL || '').replace(
    /sslmode=require/g, 'sslmode=verify-full'
  )
  const adapter = new PrismaPg({
    connectionString: connString || process.env.DATABASE_URL!,
    connectionTimeoutMillis: 5000,
    max: 10,
  })
  return new PrismaClient({ adapter })
}

// Singleton para não criar múltiplas conexões em dev (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
