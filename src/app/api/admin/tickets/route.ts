import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log("=== GET /api/admin/tickets ===")

    const tickets = await prisma.ticket.findMany({
      orderBy: { bookedAt: "desc" },
      include: {
        trip: {
          include: {
            route: true,
          },
        },
        seat: true,
      },
    })

    console.log(`Found ${tickets.length} tickets`)

    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      passenger: ticket.passengerName,
      contactNumber: ticket.passengerPhone,
      route: ticket.trip.route.name,
      date: new Date(ticket.trip.tripDate).toLocaleDateString(),
      time: ticket.trip.arrivalTime || "N/A",
      seat: ticket.seat.seatNumber,
      payment: ticket.paymentStatus,
    }))

    return NextResponse.json(formattedTickets)
  } catch (error) {
    console.error("[GET /api/admin/tickets] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch tickets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    console.log("=== DELETE /api/admin/tickets ===")

    const { searchParams } = new URL(request.url)
    const ticketIdParam = searchParams.get("id")

    console.log("Received delete request for ticket ID:", ticketIdParam)

    if (!ticketIdParam) {
      console.log("No ticket ID provided")
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 })
    }

    const ticketId = Number.parseInt(ticketIdParam, 10)

    if (isNaN(ticketId)) {
      console.log("Invalid ticket ID format:", ticketIdParam)
      return NextResponse.json({ error: "Invalid ticket ID format" }, { status: 400 })
    }

    console.log("Parsed ticket ID:", ticketId)

    // Check if ticket exists
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        trip: {
          include: {
            route: true,
          },
        },
        seat: true,
      },
    })

    if (!existingTicket) {
      console.log("Ticket not found with ID:", ticketId)
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    console.log("Found ticket to delete:", {
      id: existingTicket.id,
      ticketNumber: existingTicket.ticketNumber,
      passenger: existingTicket.passengerName,
    })

    // Delete the ticket
    const deletedTicket = await prisma.ticket.delete({
      where: { id: ticketId },
    })

    console.log("Successfully deleted ticket:", deletedTicket.id)

    return NextResponse.json({
      success: true,
      message: "Ticket deleted successfully",
      deletedTicket: {
        id: deletedTicket.id,
        ticketNumber: deletedTicket.ticketNumber,
      },
    })
  } catch (error) {
    console.error("[DELETE /api/admin/tickets] Error:", error)
    console.error("Error type:", typeof error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to delete ticket",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
