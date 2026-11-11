import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isFontKey } from "@/lib/font-options";

async function isLogged() {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

export async function GET() {
  if (!(await isLogged())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  const fontKey = isFontKey(settings?.fontKey) ? settings.fontKey : "default";
  return NextResponse.json({ fontKey });
}

export async function POST(req: Request) {
  if (!(await isLogged())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!isFontKey(body?.fontKey)) {
    return NextResponse.json({ error: "Fonte inválida" }, { status: 400 });
  }
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { fontKey: body.fontKey },
    create: { id: "singleton", fontKey: body.fontKey },
  });
  revalidateTag("site-settings");
  return NextResponse.json({ ok: true });
}
