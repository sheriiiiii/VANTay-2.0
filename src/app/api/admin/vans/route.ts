// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"

// // GET all vans with route and trip preview
// export async function GET() {
//   try {
//     const vans = await prisma.van.findMany({
//       include: {
//         route: true,
//         trips: {
//           where: {
//             tripDate: {
//               gte: new Date(),
//             },
//           },
//           orderBy: { tripDate: "asc" },
//           take: 5,
//         },
//         seats: true,
//       },
//       orderBy: { createdAt: "desc" },
//     })
//     return NextResponse.json(vans)
//   } catch (error) {
//     console.error("Error fetching vans:", error)
//     return NextResponse.json({ error: "Failed to fetch vans" }, { status: 500 })
//   }
// }

// // POST create a van (uses routeId from dropdown selection)
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { plateNumber, capacity, model, routeId, status = "ACTIVE" } = body

//     if (!plateNumber || !capacity || !model || !routeId) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
//     }

//     // Validate status
//     const validStatuses = ["ACTIVE", "MAINTENANCE", "INACTIVE"]
//     if (!validStatuses.includes(status)) {
//       return NextResponse.json({ error: "Invalid van status" }, { status: 400 })
//     }

//     // Check if route exists
//     const existingRoute = await prisma.route.findUnique({
//       where: { id: routeId },
//     })

//     if (!existingRoute) {
//       return NextResponse.json({ error: "Route not found" }, { status: 400 })
//     }

//     const result = await prisma.$transaction(async (tx) => {
//       const van = await tx.van.create({
//         data: {
//           plateNumber,
//           capacity,
//           model,
//           routeId: existingRoute.id,
//           status,
//         },
//         include: { route: true },
//       })

//       const now = new Date()
//       const seats = Array.from({ length: capacity }, (_, i) => ({
//         vanId: van.id,
//         seatNumber: String(i + 1).padStart(2, "0"),
//         createdAt: now,
//         updatedAt: now,
//       }))

//       await tx.seat.createMany({ data: seats })

//       return van
//     })

//     return NextResponse.json(result, { status: 201 })
//   } catch (error) {
//     console.error("Error creating van:", error)
//     return NextResponse.json({ error: "Failed to create van" }, { status: 500 })
//   }
// }

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all vans with route and trip preview
export async function GET() {
  try {
    const vans = await prisma.van.findMany({
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
        _count: {
          select: {
            trips: {
              where: {
                tripDate: {
                  gte: new Date(),
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(vans)
  } catch (error) {
    console.error("Error fetching vans:", error)
    return NextResponse.json({ error: "Failed to fetch vans" }, { status: 500 })
  }
}

// POST create a van (uses routeId from dropdown selection)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plateNumber, capacity, model, routeId, status = "ACTIVE" } = body

    if (!plateNumber || !capacity || !model || !routeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate capacity
    if (capacity < 1 || capacity > 50) {
      return NextResponse.json({ error: "Van capacity must be between 1 and 50" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["ACTIVE", "MAINTENANCE", "INACTIVE"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid van status" }, { status: 400 })
    }

    // Check if plate number already exists
    const existingVan = await prisma.van.findFirst({
      where: { plateNumber },
    })

    if (existingVan) {
      return NextResponse.json({ error: "Van with this plate number already exists" }, { status: 400 })
    }

    // Check if route exists
    const existingRoute = await prisma.route.findUnique({
      where: { id: routeId },
    })

    if (!existingRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const van = await tx.van.create({
        data: {
          plateNumber,
          capacity,
          model,
          routeId: existingRoute.id,
          status,
        },
        include: { route: true },
      })

      const now = new Date()
      const seats = Array.from({ length: capacity }, (_, i) => ({
        vanId: van.id,
        seatNumber: String(i + 1).padStart(2, "0"),
        createdAt: now,
        updatedAt: now,
      }))

      await tx.seat.createMany({ data: seats })

      return van
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating van:", error)
    return NextResponse.json({ error: "Failed to create van" }, { status: 500 })
  }
}
