import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    console.log("=== ADMIN: CREATING TICKET ===")

    const body = await request.json()
    console.log("Request body:", body)

    const {
      tripId,
      seatId,
      passengerName,
      passengerAddress,
      passengerAge,
      passengerPhone,
      passengerEmergencyContact,
      passengerType,
      paymentMethod,
      paymentStatus = "PAID", // Admin bookings are typically paid immediately
    } = body

    // Validate required fields
    if (!tripId || !seatId || !passengerName || !passengerAddress || !passengerAge || !passengerPhone) {
      console.log("❌ Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if seat is still available
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        tripId: Number(tripId),
        seatId: Number(seatId),
        ticketStatus: {
          in: ["ACTIVE", "USED"],
        },
      },
    })

    if (existingTicket) {
      console.log("❌ Seat already taken")
      return NextResponse.json({ error: "Seat is no longer available" }, { status: 409 })
    }

    // Calculate fare based on passenger type
    const regularFare = 200.0
    const transactionFee = 10.0
    let discount = 0.0
    let totalFare = regularFare + transactionFee

    if (["STUDENT", "PWD", "SENIOR_CITIZEN"].includes(passengerType)) {
      discount = 40.0
      totalFare = 160.0 + transactionFee
    }

    console.log("💰 Fare calculation:", { regularFare, discount, totalFare, passengerType })

    // Get trip and seat details
    const trip = await prisma.trip.findUnique({
      where: { id: Number(tripId) },
      include: {
        route: true,
        van: true,
      },
    })

    const seat = await prisma.seat.findUnique({
      where: { id: Number(seatId) },
    })

    if (!trip || !seat) {
      console.log("❌ Trip or seat not found")
      return NextResponse.json({ error: "Trip or seat not found" }, { status: 404 })
    }

    // Create ticket number
    const ticketNumber = `ADMIN-${Date.now()}`

    // Create QR code data
    const qrCodeData = JSON.stringify({
      ticketNumber,
      passengerName,
      seatNumber: seat.seatNumber,
      tripId: trip.id,
      route: `${trip.route.origin} to ${trip.route.destination}`,
      tripDate: trip.tripDate.toISOString(),
      bookingTime: new Date().toISOString(),
      totalFare,
      bookedBy: "ADMIN",
    })

    // Create the ticket
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        tripId: Number(tripId),
        seatId: Number(seatId),
        passengerName,
        passengerAddress,
        passengerAge: Number(passengerAge),
        passengerPhone,
        passengerEmergencyContact: passengerEmergencyContact || passengerPhone,
        passengerType: passengerType || "REGULAR",
        regularFare,
        discount,
        totalFare,
        paymentMethod: paymentMethod || "CASH",
        paymentStatus,
        qrCode: qrCodeData,
        ticketStatus: "ACTIVE",
        paidAt: paymentStatus === "PAID" ? new Date() : null,
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

    console.log("✅ Admin ticket created:", ticket.ticketNumber)

    // Update trip available seats
    await prisma.trip.update({
      where: { id: Number(tripId) },
      data: {
        availableSeats: {
          decrement: 1,
        },
      },
    })

    // Generate QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`

    const response = {
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        totalFare: ticket.totalFare,
        discount: ticket.discount,
        passengerType: ticket.passengerType,
        paymentStatus: ticket.paymentStatus,
        qrCodeUrl,
        qrCodeData,
        trip: {
          id: ticket.trip.id,
          route: `${ticket.trip.route.origin} to ${ticket.trip.route.destination}`,
          tripDate: ticket.trip.tripDate,
          arrivalTime: ticket.trip.arrivalTime,
        },
        seat: {
          seatNumber: ticket.seat.seatNumber,
        },
        passenger: {
          name: ticket.passengerName,
          address: ticket.passengerAddress,
          age: ticket.passengerAge,
          phone: ticket.passengerPhone,
        },
      },
    }

    console.log("=== ADMIN TICKET CREATION SUCCESS ===")
    return NextResponse.json(response)
  } catch (error) {
    console.error("=== ADMIN TICKET CREATION ERROR ===", error)
    return NextResponse.json(
      {
        error: "Failed to create ticket",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
