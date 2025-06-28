// app/instruments/page.tsx or /api/instruments/route.ts

import { prisma } from '@/lib/prisma';

export default async function Instruments() {
  const instruments = await prisma.user.findMany();

  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}
