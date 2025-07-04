import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  try {
    const { tripId: tripIdParam } = await params
    const tripId = Number.parseInt(tripIdParam)

    console.log("Fetching seats for trip ID:", tripId)

    if (isNaN(tripId)) {
      return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 })
    }

    // Get trip details
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        van: {
          include: {
            seats: {
              include: {
                tickets: {
                  where: {
                    tripId: tripId,
                    ticketStatus: {
                      in: ["ACTIVE", "USED"],
                    },
                  },
                },
              },
              orderBy: {
                seatNumber: "asc",
              },
            },
            route: true,
          },
        },
      },
    })

    console.log("Trip found:", trip ? "Yes" : "No")
    console.log("Van ID:", trip?.vanId)
    console.log("Seats count:", trip?.van.seats.length)
    console.log(
      "Seats:",
      trip?.van.seats.map((s) => s.seatNumber),
    )

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // Map seats with their status
    const seatsWithStatus = trip.van.seats.map((seat) => {
      let status: "available" | "occupied" | "pending" = "available"

      if (seat.tickets.length > 0) {
        const ticket = seat.tickets[0] // Should only be one active ticket per seat per trip

        if (ticket.paymentStatus === "PENDING") {
          status = "pending"
        } else if (ticket.paymentStatus === "PAID" || ticket.ticketStatus === "USED") {
          status = "occupied"
        }
      }

      return {
        id: seat.seatNumber,
        seatId: seat.id,
        status,
        seatNumber: seat.seatNumber,
      }
    })

    console.log("Seats with status:", seatsWithStatus)

    return NextResponse.json({
      tripId: trip.id,
      vanId: trip.vanId,
      seats: seatsWithStatus,
      tripDetails: {
        driverName: trip.driverName,
        arrivalTime: trip.arrivalTime,
        tripDate: trip.tripDate,
        route: trip.van.route,
      },
    })
  } catch (error) {
    console.error("Error fetching seats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
