import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET individual van by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const vanId = Number.parseInt(id)

    if (isNaN(vanId)) {
      return NextResponse.json({ error: "Invalid van ID" }, { status: 400 })
    }

    const van = await prisma.van.findUnique({
      where: { id: vanId },
      include: {
        route: true,
        trips: {
          where: {
            tripDate: {
              gte: new Date(),
            },
          },
          orderBy: { tripDate: "asc" },
          take: 5,
        },
        seats: true,
      },
    })

    if (!van) {
      return NextResponse.json({ error: "Van not found" }, { status: 404 })
    }

    return NextResponse.json(van)
  } catch (error) {
    console.error("Error fetching van:", error)
    return NextResponse.json({ error: "Failed to fetch van" }, { status: 500 })
  }
}

// DELETE a van by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const vanId = Number.parseInt(id)

    if (isNaN(vanId)) {
      return NextResponse.json({ error: "Invalid van ID" }, { status: 400 })
    }

    // Check if van exists
    const existingVan = await prisma.van.findUnique({
      where: { id: vanId },
      include: {
        trips: true,
        seats: true,
      },
    })

    if (!existingVan) {
      return NextResponse.json({ error: "Van not found" }, { status: 404 })
    }

    // Check if van has active trips
    const activeTrips = await prisma.trip.findMany({
      where: {
        vanId: vanId,
        tripDate: {
          gte: new Date(),
        },
      },
    })

    if (activeTrips.length > 0) {
      return NextResponse.json({ error: "Cannot delete van with active trips" }, { status: 400 })
    }

    // Delete van and related data in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete all seats associated with the van
      await tx.seat.deleteMany({
        where: { vanId: vanId },
      })

      // Delete all past trips associated with the van
      await tx.trip.deleteMany({
        where: { vanId: vanId },
      })

      // Delete the van
      const deletedVan = await tx.van.delete({
        where: { id: vanId },
        include: { route: true },
      })

      return deletedVan
    })

    return NextResponse.json({ message: "Van deleted successfully", van: result }, { status: 200 })
  } catch (error) {
    console.error("Error deleting van:", error)
    return NextResponse.json({ error: "Failed to delete van" }, { status: 500 })
  }
}

// PUT update a van by ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const vanId = Number.parseInt(id)

    if (isNaN(vanId)) {
      return NextResponse.json({ error: "Invalid van ID" }, { status: 400 })
    }

    const body = await request.json()
    const { plateNumber, capacity, model, routeId } = body

    // Check if van exists
    const existingVan = await prisma.van.findUnique({
      where: { id: vanId },
    })

    if (!existingVan) {
      return NextResponse.json({ error: "Van not found" }, { status: 404 })
    }

    // If routeId is provided, check if route exists
    if (routeId) {
      const existingRoute = await prisma.route.findUnique({
        where: { id: routeId },
      })

      if (!existingRoute) {
        return NextResponse.json({ error: "Route not found" }, { status: 400 })
      }
    }

    const updatedVan = await prisma.van.update({
      where: { id: vanId },
      data: {
        ...(plateNumber && { plateNumber }),
        ...(capacity && { capacity }),
        ...(model && { model }),
        ...(routeId && { routeId }),
      },
      include: { route: true },
    })

    return NextResponse.json(updatedVan)
  } catch (error) {
    console.error("Error updating van:", error)
    return NextResponse.json({ error: "Failed to update van" }, { status: 500 })
  }
}

