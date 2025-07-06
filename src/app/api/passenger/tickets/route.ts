//VANTay-2.0\src\app\api\passenger\tickets\route.ts

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log("=== TICKET CREATION API CALLED ===")

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
    } = body

    // 🧪 Validate required fields
    if (
      !tripId ||
      !seatId ||
      !passengerName ||
      !passengerAddress ||
      !passengerAge ||
      !passengerPhone ||
      !passengerType
    ) {
      console.warn("❌ Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 🔍 Check if seat is still available
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
      console.warn("❌ Seat already taken")
      return NextResponse.json({ error: "Seat is no longer available" }, { status: 409 })
    }

    // 💰 Fare calculation
    const regularFare = 200.0
    const transactionFee = 10.0
    let discount = 0.0
    let totalFare = regularFare + transactionFee

    if (["STUDENT", "PWD", "SENIOR_CITIZEN"].includes(passengerType)) {
      discount = 40.0
      totalFare = 160.0 + transactionFee
    }

    console.log("💰 Fare:", { regularFare, discount, totalFare, passengerType })

    // 🚌 Fetch trip and seat info
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
      console.error("❌ Trip or seat not found")
      return NextResponse.json({ error: "Trip or seat not found" }, { status: 404 })
    }

    // 🎟️ Generate ticket number & QR data
    const ticketNumber = `RIDA-${Date.now()}`
    const qrCodeData = JSON.stringify({
      ticketNumber,
      passengerName,
      seatNumber: seat.seatNumber,
      tripId: trip.id,
      route: `${trip.route.origin} to ${trip.route.destination}`,
      tripDate: trip.tripDate.toISOString(),
      bookingTime: new Date().toISOString(),
      totalFare,
    })

    // 📦 Create the ticket
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        tripId: trip.id,
        seatId: seat.id,
        passengerName,
        passengerAddress,
        passengerAge: Number(passengerAge),
        passengerPhone,
        passengerEmergencyContact: passengerEmergencyContact || passengerPhone,
        passengerType: passengerType,
        regularFare,
        discount,
        totalFare,
        qrCode: qrCodeData,
        paymentStatus: "PENDING",
        ticketStatus: "ACTIVE",
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

    // 🛠️ Update trip available seats
    await prisma.trip.update({
      where: { id: trip.id },
      data: {
        availableSeats: {
          decrement: 1,
        },
      },
    })

    // 🔗 Generate QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`

    // ✅ Build response
    const response = {
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        totalFare: ticket.totalFare,
        discount: ticket.discount,
        passengerType: ticket.passengerType,
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
      },
    }

    console.log("✅ Ticket created:", ticket.ticketNumber)
    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ TICKET CREATION ERROR:", error)
    return NextResponse.json(
      {
        error: "Failed to create ticket",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
