import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PATCH(request: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const { ticketId } = await params
    const { paymentStatus } = await request.json()

    console.log("=== PAYMENT STATUS UPDATE ===")
    console.log("Updating payment status for ticket:", ticketId, "to:", paymentStatus)

    // Validate the payment status
    const validStatuses = ["PENDING", "PAID", "FAILED"]
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 })
    }

    // Update the ticket payment status
    const ticket = await prisma.ticket.update({
      where: { id: Number(ticketId) },
      data: {
        paymentStatus,
        paidAt: paymentStatus === "PAID" ? new Date() : null,
        // Update ticket status based on payment status
        ticketStatus: paymentStatus === "PENDING" ? "ACTIVE" : paymentStatus === "PAID" ? "ACTIVE" : "CANCELLED",
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

    console.log("✅ Payment status updated successfully:", {
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      paymentStatus: ticket.paymentStatus,
      ticketStatus: ticket.ticketStatus,
    })

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        paymentStatus: ticket.paymentStatus,
        ticketStatus: ticket.ticketStatus,
        totalFare: ticket.totalFare,
        trip: {
          id: ticket.trip.id,
          route: `${ticket.trip.route.origin} to ${ticket.trip.route.destination}`,
          tripDate: ticket.trip.tripDate,
          arrivalTime: ticket.trip.arrivalTime,
        },
        seat: {
          seatNumber: ticket.seat.seatNumber,
        },
        qrCode: ticket.qrCode,
      },
    })
  } catch (error) {
    console.error("❌ Error updating payment status:", error)

    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        error: "Failed to update payment status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
