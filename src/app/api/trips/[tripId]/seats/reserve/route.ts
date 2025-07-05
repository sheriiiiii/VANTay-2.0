import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  try {
    const { tripId: tripIdParam } = await params
    const tripId = Number.parseInt(tripIdParam)
    const { seatNumber } = await request.json()

    if (isNaN(tripId) || !seatNumber) {
      return NextResponse.json({ error: "Invalid trip ID or seat number" }, { status: 400 })
    }

    // Check if seat is available
    const seat = await prisma.seat.findFirst({
      where: {
        seatNumber: seatNumber,
        van: {
          trips: {
            some: {
              id: tripId,
            },
          },
        },
      },
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
    })

    if (!seat) {
      return NextResponse.json({ error: "Seat not found" }, { status: 404 })
    }

    if (seat.tickets.length > 0) {
      return NextResponse.json({ error: "Seat is already reserved" }, { status: 409 })
    }

    // Create a temporary reservation (you might want to implement a reservation system)
    // For now, we'll just return success - the actual ticket creation will happen in passenger-info
    return NextResponse.json({
      success: true,
      seatId: seat.id,
      seatNumber: seat.seatNumber,
      message: "Seat reserved successfully",
    })
  } catch (error) {
    console.error("Error reserving seat:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
