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
      status: ticket.ticketStatus,
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

export async function PUT(request: Request) {
  try {
    console.log("=== PUT /api/admin/tickets ===")
    const { searchParams } = new URL(request.url)
    const ticketIdParam = searchParams.get("id")

    if (!ticketIdParam) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 })
    }

    const ticketId = Number.parseInt(ticketIdParam, 10)
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID format" }, { status: 400 })
    }

    const body = await request.json()
    console.log("Update request body:", body)

    // Validate required fields
    const { passengerName, passengerPhone, paymentStatus, ticketStatus } = body
    if (!passengerName || !passengerPhone || !paymentStatus || !ticketStatus) {
      return NextResponse.json(
        { error: "Missing required fields: passengerName, passengerPhone, paymentStatus, ticketStatus" },
        { status: 400 },
      )
    }

    // Validate payment status
    const validPaymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"]
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(", ")}` },
        { status: 400 },
      )
    }

    // Validate ticket status
    const validTicketStatuses = ["ACTIVE", "USED", "CANCELLED", "EXPIRED"]
    if (!validTicketStatuses.includes(ticketStatus)) {
      return NextResponse.json(
        { error: `Invalid ticket status. Must be one of: ${validTicketStatuses.join(", ")}` },
        { status: 400 },
      )
    }

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
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    console.log("Found ticket to update:", {
      id: existingTicket.id,
      ticketNumber: existingTicket.ticketNumber,
      currentPaymentStatus: existingTicket.paymentStatus,
      currentTicketStatus: existingTicket.ticketStatus,
    })

    // Update the ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        paymentStatus,
        ticketStatus,
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

    console.log("Successfully updated ticket:", {
      id: updatedTicket.id,
      ticketNumber: updatedTicket.ticketNumber,
      newPaymentStatus: updatedTicket.paymentStatus,
      newTicketStatus: updatedTicket.ticketStatus,
    })

    // Return formatted response
    const formattedTicket = {
      id: updatedTicket.id,
      ticketNumber: updatedTicket.ticketNumber,
      passenger: updatedTicket.passengerName,
      contactNumber: updatedTicket.passengerPhone,
      route: updatedTicket.trip.route.name,
      date: new Date(updatedTicket.trip.tripDate).toLocaleDateString(),
      time: updatedTicket.trip.arrivalTime || "N/A",
      seat: updatedTicket.seat.seatNumber,
      payment: updatedTicket.paymentStatus,
      status: updatedTicket.ticketStatus,
    }

    return NextResponse.json({
      success: true,
      message: "Ticket updated successfully",
      ticket: formattedTicket,
    })
  } catch (error) {
    console.error("[PUT /api/admin/tickets] Error:", error)
    console.error("Error type:", typeof error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: "Failed to update ticket",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
