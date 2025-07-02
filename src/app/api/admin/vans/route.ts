// src/app/api/admin/vans/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const vans = await prisma.van.findMany({
      include: {
        route: true, // get route name, origin, destination
      },
    });

    return NextResponse.json(vans);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch vans" }, { status: 500 });
  }
}
