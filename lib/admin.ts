import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Valores do campo role que contam como administrador (em minúsculas)
const ADMIN_ROLES = ["admin"];

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!role || !ADMIN_ROLES.includes(role.toLowerCase())) return null;
  return session;
}
