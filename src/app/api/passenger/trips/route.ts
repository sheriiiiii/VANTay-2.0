import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log("=== FETCHING TRIPS ===")

    const trips = await prisma.trip.findMany({
      where: {
        status: "SCHEDULED",
        tripDate: {
          gte: new Date(), // Only show trips from today onwards
        },
      },
      include: {
        route: true,
        van: true,
      },
      orderBy: {
        tripDate: "asc",
      },
    })

    console.log("Found trips:", trips.length)

    const formattedTrips = trips.map((trip) => ({
      id: trip.id,
      tripNumber: `Trip ${trip.id}`,
      route: `${trip.route.origin} to ${trip.route.destination}`,
      availableSeats: trip.availableSeats,
      tripDate: trip.tripDate,
      arrivalTime: trip.arrivalTime,
      driverName: trip.driverName,
    }))

    return NextResponse.json(formattedTrips)
  } catch (error) {
    console.error("Error fetching trips:", error)
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 })
  }
}
