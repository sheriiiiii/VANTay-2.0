import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { bookedAt: "desc" },
      include: {
        trip: {
          include: {
            route: true,
          },
        },
        seat: true,
      },
    });

    const formattedTickets = tickets.map((ticket) => ({
      ticketNumber: ticket.ticketNumber,
      passenger: ticket.passengerName,
      contactNumber: ticket.passengerPhone,
      route: ticket.trip.route.name,
      date: new Date(ticket.trip.tripDate).toLocaleDateString(),
      time: ticket.trip.arrivalTime || "N/A",
      seat: ticket.seat.seatNumber,
      payment: ticket.paymentStatus,
    }));

    return NextResponse.json(formattedTickets);
  } catch (error) {
    console.error("[GET /api/admin/tickets]", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
