import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function runSetup() {
  try {
    console.log("🚀 Starting database setup...")

    // Step 1: Ensure basic data
    console.log("📝 Step 1: Creating basic data...")

    // Create route
    const route = await prisma.route.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Terminal A to Terminal B",
        origin: "Terminal A",
        destination: "Terminal B",
      },
    })
    console.log("✅ Route created/verified:", route.name)

    // Create van
    const van = await prisma.van.upsert({
      where: { plateNumber: "ABC-123" },
      update: {},
      create: {
        plateNumber: "ABC-123",
        capacity: 13,
        model: "Toyota Hiace",
        routeId: route.id,
      },
    })
    console.log("✅ Van created/verified:", van.plateNumber)

    // Create trip
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const trip = await prisma.trip.upsert({
      where: {
        vanId_tripDate: {
          vanId: van.id,
          tripDate: today,
        },
      },
      update: {},
      create: {
        vanId: van.id,
        routeId: route.id,
        driverName: "Juan Dela Cruz",
        driverPhone: "+639123456789",
        tripDate: today,
        arrivalTime: "08:00 AM",
        availableSeats: 13,
      },
    })
    console.log("✅ Trip created/verified for date:", today.toDateString())

    // Step 2: Check existing seats and create missing ones
    console.log("📝 Step 2: Checking and creating seats...")

    // First, delete tickets for this trip to avoid conflicts
    const deletedTickets = await prisma.ticket.deleteMany({
      where: { tripId: trip.id },
    })
    console.log(`🗑️ Cleared ${deletedTickets.count} existing tickets for this trip`)

    // Check existing seats
    const existingSeats = await prisma.seat.findMany({
      where: { vanId: van.id },
      orderBy: { seatNumber: 'asc' }
    })
    console.log(`📊 Found ${existingSeats.length} existing seats`)

    // Create missing seats (01-13)
    const seats = []
    for (let i = 1; i <= 13; i++) {
      const seatNumber = i.toString().padStart(2, "0")
      
      // Check if seat already exists
      let seat = existingSeats.find(s => s.seatNumber === seatNumber)
      
      if (!seat) {
        // Create the seat if it doesn't exist
        seat = await prisma.seat.create({
          data: {
            vanId: van.id,
            seatNumber: seatNumber,
          },
        })
        console.log(`✅ Created seat: ${seatNumber}`)
      } else {
        console.log(`ℹ️ Seat ${seatNumber} already exists`)
      }
      
      seats.push(seat)
    }

    // Step 3: Create some sample tickets for testing
    console.log("📝 Step 3: Creating sample tickets...")

    // Create some occupied and pending seats
    const occupiedSeats = ["02", "05", "08"]
    const pendingSeats = ["03", "07"]

    for (const seatNumber of occupiedSeats) {
      const seat = seats.find((s) => s.seatNumber === seatNumber)
      if (seat) {
        await prisma.ticket.create({
          data: {
            tripId: trip.id,
            seatId: seat.id,
            passengerName: `Test Passenger ${seatNumber}`,
            passengerAddress: "Test Address",
            passengerAge: 25,
            passengerPhone: "+639123456789",
            passengerEmergencyContact: "+639987654321",
            totalFare: 200.0,
            qrCode: `QR_${seatNumber}_${Date.now()}`,
            paymentStatus: "PAID",
            ticketStatus: "ACTIVE",
          },
        })
        console.log(`✅ Created OCCUPIED ticket for seat: ${seatNumber}`)
      }
    }

    for (const seatNumber of pendingSeats) {
      const seat = seats.find((s) => s.seatNumber === seatNumber)
      if (seat) {
        await prisma.ticket.create({
          data: {
            tripId: trip.id,
            seatId: seat.id,
            passengerName: `Pending Passenger ${seatNumber}`,
            passengerAddress: "Test Address",
            passengerAge: 30,
            passengerPhone: "+639123456789",
            passengerEmergencyContact: "+639987654321",
            totalFare: 200.0,
            qrCode: `QR_PENDING_${seatNumber}_${Date.now()}`,
            paymentStatus: "PENDING",
            ticketStatus: "ACTIVE",
          },
        })
        console.log(`✅ Created PENDING ticket for seat: ${seatNumber}`)
      }
    }

    // Final verification
    console.log("📊 Final verification...")
    const finalCount = await prisma.seat.count({
      where: { vanId: van.id },
    })
    console.log(`✅ Total seats for this van: ${finalCount}`)

    const ticketCount = await prisma.ticket.count({
      where: { tripId: trip.id },
    })
    console.log(`✅ Total tickets for this trip: ${ticketCount}`)

    // Show seat status summary
    const availableCount = finalCount - ticketCount
    console.log(`📈 Seat Summary:`)
    console.log(`   - Available: ${availableCount}`)
    console.log(`   - Occupied: ${occupiedSeats.length}`)
    console.log(`   - Pending: ${pendingSeats.length}`)

    console.log("🎉 Setup completed successfully!")
    console.log(`🔗 Test URL: http://localhost:3000/passenger/seat-selection?tripId=${trip.id}`)
    
    // Show all seats with their status
    console.log("\n📋 Seat Status:")
    for (const seat of seats) {
      const ticket = await prisma.ticket.findFirst({
        where: { 
          tripId: trip.id, 
          seatId: seat.id,
          ticketStatus: { in: ["ACTIVE", "USED"] }
        }
      })
      
      let status = "Available"
      if (ticket) {
        status = ticket.paymentStatus === "PENDING" ? "Pending" : "Occupied"
      }
      
      console.log(`   Seat ${seat.seatNumber}: ${status}`)
    }

  } catch (error) {
    console.error("❌ Setup failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

runSetup()
