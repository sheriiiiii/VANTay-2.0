// File: app/api/passenger/seats/[tripId]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    tripId: string;
  };
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const tripId = parseInt(params.tripId);
    if (isNaN(tripId)) {
      return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        van: true,
        tickets: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const seats = await prisma.seat.findMany({
      where: { vanId: trip.vanId },
      orderBy: { seatNumber: "asc" },
    });

    const occupiedSeatIds = new Set(trip.tickets.map((ticket) => ticket.seatId));

    const response = seats.map((seat) => ({
      id: seat.id,
      seatNumber: seat.seatNumber,
      status: occupiedSeatIds.has(seat.id) ? "occupied" : "available",
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error in GET /seats/:tripId", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const tripId = parseInt(params.tripId);
    if (isNaN(tripId)) {
      return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
    }

    const body = await req.json();
    const seatNumber = body.seatNumber;

    if (!seatNumber || typeof seatNumber !== "string") {
      return NextResponse.json({ error: "Invalid seat number" }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { van: true, tickets: true },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const seat = await prisma.seat.findFirst({
      where: {
        vanId: trip.vanId,
        seatNumber,
      },
    });

    if (!seat) {
      return NextResponse.json({ error: "Seat not found" }, { status: 404 });
    }

    const isOccupied = trip.tickets.some((t) => t.seatId === seat.id);
    if (isOccupied) {
      return NextResponse.json({ error: "Seat already taken" }, { status: 409 });
    }

    return NextResponse.json({ message: "Seat acknowledged", seatId: seat.id });
  } catch (error) {
    console.error("❌ Error in POST /seats/:tripId", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
