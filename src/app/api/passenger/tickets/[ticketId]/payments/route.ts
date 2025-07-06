import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    console.log("=== PAYMENT STATUS UPDATE ===")

    // Await the params since they're now a Promise in Next.js 15
    const { ticketId } = await params
    const body = await request.json()
    const { paymentStatus } = body

    console.log(`Updating payment status for ticket: ${ticketId} to: ${paymentStatus}`)

    // Validate ticketId
    if (!ticketId || isNaN(Number(ticketId))) {
      return NextResponse.json({ success: false, error: "Invalid ticket ID" }, { status: 400 })
    }

    // Validate paymentStatus
    const validStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"]
    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      return NextResponse.json({ success: false, error: "Invalid payment status" }, { status: 400 })
    }

    // Check if ticket exists first
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: Number(ticketId) },
    })

    if (!existingTicket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }

    // Update the ticket payment status
    const ticket = await prisma.ticket.update({
      where: { id: Number(ticketId) },
      data: {
        paymentStatus: paymentStatus,
        // Add payment date if status is PAID
        ...(paymentStatus === "PAID" && {
          paymentDate: new Date(),
        }),
      },
      include: {
        trip: {
          include: {
            route: true,
          },
        },
        seat: true,
      },
    })

    console.log("✅ Payment status updated successfully")

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        paymentStatus: ticket.paymentStatus,
        totalFare: ticket.totalFare,
        trip: {
          route: `${ticket.trip.route.origin} to ${ticket.trip.route.destination}`,
          arrivalTime: ticket.trip.arrivalTime,
        },
        seat: {
          seatNumber: ticket.seat.seatNumber,
        },
      },
    })
  } catch (error) {
    console.error("❌ Error updating payment status:", error)

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Can't reach database server")) {
        return NextResponse.json(
          {
            success: false,
            error: "Database connection failed. Please try again later.",
          },
          { status: 503 },
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update payment status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
