import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      orderBy: {
        tripDate: "desc",
      },
      include: {
        route: {
          select: {
            name: true,
          },
        },
        van: {
          select: {
            plateNumber: true,
            capacity: true,
          },
        },
        tickets: {
          select: {
            id: true,
          },
        },
      },
    });

    const formattedTrips = trips.map((trip) => ({
      id: trip.id,
      van: {
        plateNumber: trip.van?.plateNumber ?? "Unassigned",
        capacity: trip.van?.capacity ?? 0,
      },
      route: {
        name: trip.route?.name ?? "Unassigned",
      },
      driverName: trip.driverName ?? "-",
      driverPhone: trip.driverPhone ?? "-",
      tripDate: trip.tripDate,
      status: trip.status,
      availableSeats: trip.availableSeats,
      bookedSeats: trip.tickets.length,
    }));

    return NextResponse.json(formattedTrips);
  } catch (error) {
    console.error("[GET /api/admin/trips]", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}
