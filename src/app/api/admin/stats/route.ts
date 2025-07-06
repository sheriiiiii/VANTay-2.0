import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log("=== STATS API DEBUG ===")

    // Get total vans count
    const totalVans = await prisma.van.count()
    console.log("Total vans:", totalVans)

    // Get active vans count (status = ACTIVE)
    const activeVans = await prisma.van.count({
      where: {
        status: "ACTIVE",
      },
    })
    console.log("Active vans:", activeVans)

    // Get today's date range (more flexible)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    console.log("Date range - Today:", today.toISOString())
    console.log("Date range - Tomorrow:", tomorrow.toISOString())

    // Get ALL trips for today (debug)
    const allTodayTrips = await prisma.trip.findMany({
      where: {
        tripDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        id: true,
        status: true,
        tripDate: true,
        van: {
          select: {
            plateNumber: true,
          },
        },
        route: {
          select: {
            name: true,
          },
        },
      },
    })

    console.log("All today's trips:", JSON.stringify(allTodayTrips, null, 2))

    // Get today's trips count
    const todayTripCount = allTodayTrips.length
    console.log("Today trip count:", todayTripCount)

    // Get completed trips count (all time, not just today)
    const completedTripsCount = await prisma.trip.count({
      where: {
        status: "COMPLETED",
      },
    })

    console.log("Completed trips today:", completedTripsCount)

    // Alternative: Get completed trips from any date (for testing)
    const allCompletedTrips = await prisma.trip.findMany({
      where: {
        status: "COMPLETED",
      },
      select: {
        id: true,
        status: true,
        tripDate: true,
        van: {
          select: {
            plateNumber: true,
          },
        },
      },
      orderBy: {
        tripDate: "desc",
      },
      take: 5, // Get last 5 completed trips
    })
    console.log("All completed trips (any date):", JSON.stringify(allCompletedTrips, null, 2))

    // Get current month date range
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    console.log("Month range - Start:", startOfMonth.toISOString())
    console.log("Month range - End:", endOfMonth.toISOString())

    // Get tickets sold this month
    const ticketsSold = await prisma.ticket.count({
      where: {
        bookedAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
    })
    console.log("Tickets sold this month:", ticketsSold)

    // Get pending tickets count
    const pendingTickets = await prisma.ticket.count({
      where: {
        paymentStatus: "PENDING",
      },
    })
    console.log("Pending tickets:", pendingTickets)

    // Check all trip statuses in database
    const tripStatusCounts = await prisma.trip.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    })
    console.log("Trip status counts:", JSON.stringify(tripStatusCounts, null, 2))

    console.log("=== END STATS DEBUG ===")

    return NextResponse.json({
      totalVans,
      activeVans,
      todayTripCount,
      completedTripsCount,
      ticketsSold,
      pendingTickets,
      // Debug info (remove in production)
      debug: {
        allTodayTrips: allTodayTrips.length,
        allCompletedTrips: allCompletedTrips.length,
        tripStatusCounts,
        dateRange: {
          today: today.toISOString(),
          tomorrow: tomorrow.toISOString(),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
