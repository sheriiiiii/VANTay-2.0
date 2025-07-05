import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        van: true,
        route: true,
      },
      orderBy: {
        tripDate: "asc",
      },
    })
    return NextResponse.json(trips)
  } catch (error) {
    console.error("Failed to fetch trips:", error)
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("Received body:", body)
    const { vanId, routeId, tripDate, availableSeats, driverName, driverPhone } = body

    if (!vanId || !routeId || !tripDate || !availableSeats || isNaN(new Date(tripDate).getTime())) {
      return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 })
    }

    const van = await prisma.van.findUnique({ where: { id: Number(vanId) } })
    if (!van) {
      return NextResponse.json({ error: "Van not found" }, { status: 404 })
    }

    const route = await prisma.route.findUnique({ where: { id: Number(routeId) } })
    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }

    const existingTrip = await prisma.trip.findFirst({
      where: {
        vanId: Number(vanId),
        tripDate: new Date(tripDate),
      },
    })

    if (existingTrip) {
      return NextResponse.json({ error: "Trip already exists for this van on this date" }, { status: 409 })
    }

    const newTrip = await prisma.trip.create({
      data: {
        vanId: Number(vanId),
        routeId: Number(routeId),
        tripDate: new Date(tripDate),
        availableSeats: Number.parseInt(availableSeats),
        driverName,
        driverPhone,
      },
    })

    return NextResponse.json(newTrip, { status: 201 })
  } catch (error) {
    console.error("Trip creation error:", error)
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const tripId = searchParams.get("id")

    if (!tripId) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 })
    }

    // Check if trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id: Number(tripId) },
    })

    if (!existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // Delete the trip
    await prisma.trip.delete({
      where: { id: Number(tripId) },
    })

    return NextResponse.json({ message: "Trip deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Trip deletion error:", error)
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, vanId, routeId, tripDate, availableSeats, driverName, driverPhone } = body

    if (!id || !vanId || !routeId || !tripDate || !availableSeats || isNaN(new Date(tripDate).getTime())) {
      return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 })
    }

    // Check if trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id: Number(id) },
    })

    if (!existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // Check if van exists
    const van = await prisma.van.findUnique({ where: { id: Number(vanId) } })
    if (!van) {
      return NextResponse.json({ error: "Van not found" }, { status: 404 })
    }

    // Check if route exists
    const route = await prisma.route.findUnique({ where: { id: Number(routeId) } })
    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }

    // Check for conflicts (different trip with same van and date)
    const conflictingTrip = await prisma.trip.findFirst({
      where: {
        vanId: Number(vanId),
        tripDate: new Date(tripDate),
        id: { not: Number(id) }, // Exclude current trip
      },
    })

    if (conflictingTrip) {
      return NextResponse.json({ error: "Another trip already exists for this van on this date" }, { status: 409 })
    }

    // Update the trip
    const updatedTrip = await prisma.trip.update({
      where: { id: Number(id) },
      data: {
        vanId: Number(vanId),
        routeId: Number(routeId),
        tripDate: new Date(tripDate),
        availableSeats: Number.parseInt(availableSeats),
        driverName: driverName || null,
        driverPhone: driverPhone || null,
      },
      include: {
        van: true,
        route: true,
      },
    })

    return NextResponse.json(updatedTrip, { status: 200 })
  } catch (error) {
    console.error("Trip update error:", error)
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 })
  }
}