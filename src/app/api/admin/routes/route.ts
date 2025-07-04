import { PrismaClient } from "@prisma/client"
import { NextResponse, type NextRequest } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
        origin: true,
        destination: true,
      },
    })
    return NextResponse.json(routes)
  } catch (error) {
    console.error("[GET /api/admin/routes", error)
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, origin, destination } = body

    if (!name || !origin || !destination) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newRoute = await prisma.route.create({
      data: {
        name,
        origin,
        destination,
      },
    })

    return NextResponse.json(newRoute, { status: 201 })
  } catch (error) {
    console.error("Error creating route:", error)
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const routeIdParam = searchParams.get("id")

    if (!routeIdParam) {
      return NextResponse.json({ error: "Route ID is required" }, { status: 400 })
    }

    // Convert string to number
    const routeId = Number.parseInt(routeIdParam, 10)

    if (isNaN(routeId)) {
      return NextResponse.json({ error: "Invalid route ID" }, { status: 400 })
    }

    // Check if route exists
    const existingRoute = await prisma.route.findUnique({
      where: { id: routeId },
    })

    if (!existingRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }

    // Check if route is being used by any trips
    const tripsUsingRoute = await prisma.trip.findFirst({
      where: { routeId: routeId },
    })

    if (tripsUsingRoute) {
      return NextResponse.json({ error: "Cannot delete route. It is being used by existing trips." }, { status: 400 })
    }

    // Delete the route
    await prisma.route.delete({
      where: { id: routeId },
    })

    return NextResponse.json({ message: "Route deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("[DELETE /api/admin/routes]", error)
    return NextResponse.json({ error: "Failed to delete route" }, { status: 500 })
  }
}
