// app/api/van/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all vans with route and trip preview
export async function GET() {
  try {
    const vans = await prisma.van.findMany({
      include: {
        route: true,
        trips: {
          where: {
            tripDate: {
              gte: new Date(),
            },
          },
          orderBy: { tripDate: "asc" },
          take: 5,
        },
        seats: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vans);
  } catch (error) {
    console.error("Error fetching vans:", error);
    return NextResponse.json({ error: "Failed to fetch vans" }, { status: 500 });
  }
}

// POST create a van (uses routeId from dropdown selection)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plateNumber, capacity, model, routeId } = body;

    if (!plateNumber || !capacity || !model || !routeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if route exists
    const existingRoute = await prisma.route.findUnique({
      where: { id: routeId },
    });

    if (!existingRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const van = await tx.van.create({
        data: {
          plateNumber,
          capacity,
          model,
          routeId: existingRoute.id,
        },
        include: { route: true },
      });

      const now = new Date();
      const seats = Array.from({ length: capacity }, (_, i) => ({
        vanId: van.id,
        seatNumber: String(i + 1).padStart(2, "0"),
        createdAt: now,
        updatedAt: now,
      }));

      await tx.seat.createMany({ data: seats });

      return van;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating van:", error);
    return NextResponse.json({ error: "Failed to create van" }, { status: 500 });
  }
}
