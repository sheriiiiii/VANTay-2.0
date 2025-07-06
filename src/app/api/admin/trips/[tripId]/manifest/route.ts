import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { tripId: string } }) {
  try {
    const { tripId } = params

    console.log("=== GENERATING PASSENGER MANIFEST ===")
    console.log("Trip ID:", tripId)

    if (!tripId || isNaN(Number(tripId))) {
      return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 })
    }

    // Fetch trip with all related data
    const trip = await prisma.trip.findUnique({
      where: { id: Number(tripId) },
      include: {
        van: true,
        route: true,
        tickets: {
          where: {
            ticketStatus: {
              in: ["ACTIVE", "USED"],
            },
            paymentStatus: {
              in: ["PAID", "PENDING"],
            },
          },
          include: {
            seat: true,
          },
          orderBy: {
            seat: {
              seatNumber: "asc",
            },
          },
        },
      },
    })

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // Format the manifest data
    const manifestData = {
      tripInfo: {
        vanNumber: trip.van.plateNumber,
        driver: trip.driverName || "Not Assigned",
        route: `${trip.route.origin} to ${trip.route.destination}`,
        tripDate: trip.tripDate,
        arrivalTime: trip.arrivalTime,
      },
      passengers: trip.tickets.map((ticket, index) => ({
        number: index + 1,
        seatNumber: ticket.seat.seatNumber,
        passengerName: ticket.passengerName,
        age: ticket.passengerAge,
        address: ticket.passengerAddress,
        contactNumber: ticket.passengerPhone,
        emergencyContact: ticket.passengerEmergencyContact,
        paymentStatus: ticket.paymentStatus,
      })),
      summary: {
        totalPassengers: trip.tickets.length,
        totalSeats: trip.van.capacity,
        availableSeats: trip.van.capacity - trip.tickets.length,
      },
    }

    console.log("Manifest generated for", manifestData.passengers.length, "passengers")

    return NextResponse.json(manifestData)
  } catch (error) {
    console.error("Error generating manifest:", error)
    return NextResponse.json({ error: "Failed to generate manifest" }, { status: 500 })
  }
}
