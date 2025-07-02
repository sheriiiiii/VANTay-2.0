import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalVans = await prisma.van.count({
      where: {
        status: "ACTIVE",
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTrips = await prisma.trip.findMany({
      where: {
        tripDate: today,
      },
    });

    const completedTrips = todayTrips.filter(t => t.status === "COMPLETED");

    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const tickets = await prisma.ticket.findMany({
      where: {
        bookedAt: {
          gte: currentMonthStart,
        },
      },
    });

    return NextResponse.json({
      totalVans,
      todayTripCount: todayTrips.length,
      completedTripsCount: completedTrips.length,
      ticketsSold: tickets.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
