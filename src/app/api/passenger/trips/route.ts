import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log("=== FETCHING TRIPS ===")

    // Get today's date range (start of today to start of tomorrow)
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    console.log("Date range:", {
      startOfToday: startOfToday.toISOString(),
      startOfTomorrow: startOfTomorrow.toISOString(),
      currentTime: now.toISOString(),
    })

    const trips = await prisma.trip.findMany({
      where: {
        // Include both SCHEDULED and BOARDING trips
        status: {
          in: ["SCHEDULED", "BOARDING"],
        },
        // Get trips for today only (from start of today to start of tomorrow)
        tripDate: {
          gte: startOfToday,
          lt: startOfTomorrow,
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
    console.log(
      "Trip details:",
      trips.map((trip) => ({
        id: trip.id,
        tripDate: trip.tripDate.toISOString(),
        status: trip.status,
        route: `${trip.route.origin} to ${trip.route.destination}`,
      })),
    )

    const formattedTrips = trips.map((trip) => ({
      id: trip.id,
      tripNumber: `Trip ${trip.id}`,
      route: `${trip.route.origin} to ${trip.route.destination}`,
      availableSeats: trip.availableSeats,
      tripDate: trip.tripDate.toISOString(),
      status: trip.status,
      arrivalTime: trip.arrivalTime,
      driverName: trip.driverName,
    }))

    console.log("Returning formatted trips:", formattedTrips.length)
    return NextResponse.json(formattedTrips)
  } catch (error) {
    console.error("Error fetching trips:", error)
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 })
  }
}
