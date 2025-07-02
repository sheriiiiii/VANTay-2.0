import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
        origin: true,
        destination: true,
      },
    });

    return NextResponse.json(routes);
  } catch (error) {
    console.error("[GET /api/admin/routes", error);
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, origin, destination } = body;

    if (!name || !origin || !destination) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newRoute = await prisma.route.create({
      data: {
        name,
        origin,
        destination,
      },
    });

    return NextResponse.json(newRoute, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/routes]", error);
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 });
  }
}
