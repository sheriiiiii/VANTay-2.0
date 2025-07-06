import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PUT update a van
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vanId = Number.parseInt(params.id)
    if (isNaN(vanId)) {
      return NextResponse.json({ error: "Invalid van ID" }, { status: 400 })
    }

    const body = await request.json()
    const { plateNumber, capacity, model, routeId, status } = body

    if (!plateNumber || !capacity || !model || !routeId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["ACTIVE", "MAINTENANCE", "INACTIVE"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid van status" }, { status: 400 })
    }

    // Check if van exists
    const existingVan = await prisma.van.findUnique({
      where: { id: vanId },
    })

    if (!existingVan) {
      return NextResponse.json({ error: "Van not found" }, { status: 404 })
    }

    // Check if route exists
    const existingRoute = await prisma.route.findUnique({
      where: { id: routeId },
    })

    if (!existingRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update van
      const updatedVan = await tx.van.update({
        where: { id: vanId },
        data: {
          plateNumber,
          capacity,
          model,
          routeId,
          status,
        },
        include: { route: true },
      })

      // If capacity changed, update seats
      if (existingVan.capacity !== capacity) {
        // Delete existing seats
        await tx.seat.deleteMany({
          where: { vanId },
        })

        // Create new seats
        const now = new Date()
        const seats = Array.from({ length: capacity }, (_, i) => ({
          vanId,
          seatNumber: String(i + 1).padStart(2, "0"),
          createdAt: now,
          updatedAt: now,
        }))

        await tx.seat.createMany({ data: seats })
      }

      return updatedVan
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating van:", error)
    return NextResponse.json({ error: "Failed to update van" }, { status: 500 })
  }
}

// DELETE a van
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vanId = Number.parseInt(params.id)
    if (isNaN(vanId)) {
      return NextResponse.json({ error: "Invalid van ID" }, { status: 400 })
    }

    // Check if van exists
    const existingVan = await prisma.van.findUnique({
      where: { id: vanId },
    })

    if (!existingVan) {
      return NextResponse.json({ error: "Van not found" }, { status: 404 })
    }

    // Delete van and related data in transaction
    await prisma.$transaction(async (tx) => {
      // Delete seats first (due to foreign key constraint)
      await tx.seat.deleteMany({
        where: { vanId },
      })

      // Delete trips
      await tx.trip.deleteMany({
        where: { vanId },
      })

      // Delete van
      await tx.van.delete({
        where: { id: vanId },
      })
    })

    return NextResponse.json({ message: "Van deleted successfully" })
  } catch (error) {
    console.error("Error deleting van:", error)
    return NextResponse.json({ error: "Failed to delete van" }, { status: 500 })
  }
}
