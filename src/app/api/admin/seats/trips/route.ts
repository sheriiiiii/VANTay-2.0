import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log("=== ADMIN: FETCHING TRIPS ===")

    const trips = await prisma.trip.findMany({
      where: {
        status: "SCHEDULED",
      },
      include: {
        route: true,
        van: true,
        tickets: {
          where: {
            ticketStatus: {
              in: ["ACTIVE", "USED"],
            },
          },
          include: {
            seat: true,
          },
        },
      },
      orderBy: {
        tripDate: "asc",
      },
    })

    console.log("Found trips:", trips.length)

    const formattedTrips = trips.map((trip) => ({
      id: trip.id,
      route: `${trip.route.origin} to ${trip.route.destination}`,
      tripDate: trip.tripDate,
      arrivalTime: trip.arrivalTime,
      driverName: trip.driverName,
      van: {
        plateNumber: trip.van.plateNumber,
        capacity: trip.van.capacity,
      },
      totalSeats: trip.van.capacity,
      occupiedSeats: trip.tickets.length,
      availableSeats: trip.van.capacity - trip.tickets.length,
      tickets: trip.tickets.map((ticket) => ({
        id: ticket.id,
        seatNumber: ticket.seat.seatNumber,
        passengerName: ticket.passengerName,
        paymentStatus: ticket.paymentStatus,
        ticketStatus: ticket.ticketStatus,
      })),
    }))

    return NextResponse.json(formattedTrips)
  } catch (error) {
    console.error("Error fetching admin trips:", error)
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 })
  }
}
