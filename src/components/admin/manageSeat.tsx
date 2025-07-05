"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, ArrowLeft, Loader2, User, MapPin, Calendar, Download, Filter, CalendarDays } from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AdminSidebar from "@/components/sidebar/AdminSidebar"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"

interface Trip {
  id: number
  route: string
  tripDate: string
  arrivalTime: string
  driverName: string
  van: {
    plateNumber: string
    capacity: number
  }
  totalSeats: number
  occupiedSeats: number
  availableSeats: number
  tickets: Array<{
    id: number
    seatNumber: string
    passengerName: string
    paymentStatus: string
    ticketStatus: string
  }>
}

interface Seat {
  id: number
  seatNumber: string
  status: "available" | "occupied" | "pending"
  ticket: {
    id: number
    seatNumber: string
    passengerName: string
    paymentStatus: string
    ticketStatus: string
  } | null
}

interface SeatData {
  tripId: number
  seats: Seat[]
  tripDetails: {
    route: string
    driverName: string
    arrivalTime: string
    tripDate: string
  }
  stats: {
    totalSeats: number
    availableSeats: number
    occupiedSeats: number
    pendingSeats: number
  }
}

interface PassengerData {
  name: string
  address: string
  age: string
  contactNumber: string
  emergencyContact: string
  classification: string
  paymentMethod: string
}

type ViewState = "trips" | "seats" | "passenger-info" | "payment" | "receipt"
type DateFilter = "today" | "tomorrow" | "custom" | "all"

export default function ManageSeat() {
  const [currentView, setCurrentView] = useState<ViewState>("trips")
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [seatData, setSeatData] = useState<SeatData | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Date filtering states
  const [dateFilter, setDateFilter] = useState<DateFilter>("today")
  const [customDate, setCustomDate] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)

  interface CreatedTicket {
    ticketNumber: string
    seat: {
      seatNumber: string
    }
    trip: {
      route: string
      tripDate: string
      arrivalTime: string
    }
    passenger: {
      name: string
    }
    totalFare: number
    qrCodeUrl?: string
  }

  const [createdTicket, setCreatedTicket] = useState<CreatedTicket | null>(null)
  const [passengerData, setPassengerData] = useState<PassengerData>({
    name: "",
    address: "",
    age: "",
    contactNumber: "",
    emergencyContact: "",
    classification: "Regular",
    paymentMethod: "CASH",
  })

  // Fetch trips on component mount and when date filter changes
  useEffect(() => {
    fetchTrips()
  }, [dateFilter, customDate])

  const getDateForFilter = (): string | null => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    switch (dateFilter) {
      case "today":
        return today.toISOString().split("T")[0] // Always send today's date
      case "tomorrow":
        return tomorrow.toISOString().split("T")[0]
      case "custom":
        return customDate || null
      case "all":
        return null // No date parameter = all trips
      default:
        return today.toISOString().split("T")[0] // Default to today
    }
  }

  const fetchTrips = async () => {
    try {
      setLoading(true)
      setError(null)
      const filterDate = getDateForFilter()
      const url = filterDate ? `/api/admin/seats/trips?date=${filterDate}` : `/api/admin/seats/trips`
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch trips")
      const data = await response.json()
      setTrips(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trips")
    } finally {
      setLoading(false)
    }
  }

  const fetchSeatData = async (tripId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/seats/trips/${tripId}/seats`)
      if (!response.ok) throw new Error("Failed to fetch seat data")
      const data = await response.json()
      setSeatData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load seat data")
    } finally {
      setLoading(false)
    }
  }

  const handleTripSelect = async (trip: Trip) => {
    setSelectedTrip(trip)
    await fetchSeatData(trip.id)
    setCurrentView("seats")
  }

  const handleSeatSelect = (seat: Seat) => {
    if (seat.status === "available") {
      setSelectedSeat(seat)
      setCurrentView("passenger-info")
    }
  }

  const handlePassengerSubmit = () => {
    if (isFormValid()) {
      setCurrentView("payment")
    }
  }

  const handlePaymentConfirm = async () => {
    if (!selectedTrip || !selectedSeat) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/seats/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripId: selectedTrip.id,
          seatId: selectedSeat.id,
          passengerName: passengerData.name,
          passengerAddress: passengerData.address,
          passengerAge: Number(passengerData.age),
          passengerPhone: passengerData.contactNumber,
          passengerEmergencyContact: passengerData.emergencyContact || passengerData.contactNumber,
          passengerType: passengerData.classification.toUpperCase().replace(" ", "_"),
          paymentMethod: passengerData.paymentMethod,
          paymentStatus: "PAID",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create ticket")
      }

      const data = await response.json()
      setCreatedTicket(data.ticket)
      setCurrentView("receipt")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = () => {
    if (!createdTicket) return

    // Create a canvas to generate the ticket image
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (ctx) {
      canvas.width = 400
      canvas.height = 700

      // Fill background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add watermark background text
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.font = "bold 60px Arial"
      ctx.textAlign = "center"
      ctx.fillText("VANTAY", canvas.width / 2, canvas.height / 2 - 50)

      // Add main content
      ctx.fillStyle = "#000000"
      ctx.font = "bold 24px Arial"
      ctx.textAlign = "center"
      ctx.fillText("VANTAY", canvas.width / 2, 80)

      // Large seat number
      ctx.font = "bold 80px Arial"
      ctx.fillText(createdTicket.seat.seatNumber, canvas.width / 2, 200)

      // Trip information
      ctx.font = "bold 18px Arial"
      ctx.fillText(createdTicket.ticketNumber, canvas.width / 2, 280)
      ctx.font = "16px Arial"
      ctx.fillText(createdTicket.trip.route, canvas.width / 2, 310)
      ctx.fillText(`Departure: ${createdTicket.trip.arrivalTime}`, canvas.width / 2, 340)

      // Payment status
      ctx.font = "14px Arial"
      ctx.fillStyle = "#16a34a"
      ctx.fillText("PAID", canvas.width / 2, 370)

      // Load and draw QR code
      const qrImage = new window.Image()
      qrImage.crossOrigin = "anonymous"
      qrImage.onload = () => {
        // Draw QR code
        const qrSize = 120
        const qrX = (canvas.width - qrSize) / 2
        const qrY = 400
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

        // Add instructions below QR code
        ctx.fillStyle = "#000000"
        ctx.font = "12px Arial"
        ctx.fillText("Present this ticket at the counter", canvas.width / 2, 550)
        ctx.fillText(`Total: ₱${createdTicket.totalFare.toFixed(2)}`, canvas.width / 2, 570)

        // Convert to blob and download after QR code is drawn
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `vantay-ticket-${createdTicket.ticketNumber}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        })
      }

      qrImage.onerror = () => {
        // If QR code fails to load, still generate the ticket without it
        console.warn("QR code failed to load, generating ticket without QR code")
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `vantay-ticket-${createdTicket.ticketNumber}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        })
      }

      qrImage.src = createdTicket.qrCodeUrl || "/placeholder.svg?height=120&width=120"
    }
  }

  const handleInputChange = (field: keyof PassengerData, value: string) => {
    setPassengerData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const isFormValid = () => {
    const requiredFields = ["name", "address", "age", "contactNumber", "classification"]
    return requiredFields.every((field) => passengerData[field as keyof PassengerData].trim() !== "")
  }

  const calculateTotalFare = () => {
    const regularFare = 200.0
    const transactionFee = 10.0
    let discount = 0.0
    let totalFare = regularFare + transactionFee

    if (["Student", "PWD", "Senior Citizen"].includes(passengerData.classification)) {
      discount = 40.0
      totalFare = 160.0 + transactionFee
    }

    return { regularFare, discount, totalFare }
  }

  const getSeatColor = (seat: Seat) => {
    if (selectedSeat?.id === seat.id) return "bg-blue-500 text-white"
    switch (seat.status) {
      case "available":
        return "bg-green-500 text-white hover:bg-green-600"
      case "occupied":
        return "bg-red-500 text-white"
      case "pending":
        return "bg-orange-500 text-white"
      default:
        return "bg-gray-300 text-gray-700"
    }
  }

  const resetFlow = () => {
    setCurrentView("trips")
    setSelectedTrip(null)
    setSeatData(null)
    setSelectedSeat(null)
    setCreatedTicket(null)
    setPassengerData({
      name: "",
      address: "",
      age: "",
      contactNumber: "",
      emergencyContact: "",
      classification: "Regular",
      paymentMethod: "CASH",
    })
    setError(null)
  }

  const getFilterDisplayText = () => {
    switch (dateFilter) {
      case "today":
        return "Today's Trips"
      case "tomorrow":
        return "Tomorrow's Trips"
      case "custom":
        return customDate ? `Trips for ${new Date(customDate).toLocaleDateString()}` : "Custom Date"
      case "all":
        return "All Trips"
      default:
        return "Today's Trips"
    }
  }

  if (loading && currentView === "trips") {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading trips...</span>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Manage Seat</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-8 bg-gray-50">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Trip Selection View */}
          {currentView === "trips" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Trip Management</h2>
                  <p className="text-gray-600">{getFilterDisplayText()}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter Trips</span>
                </Button>
              </div>

              {/* Date Filter Controls */}
              {showFilters && (
                <Card className="bg-white shadow-md border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <Button
                        variant={dateFilter === "today" ? "default" : "outline"}
                        onClick={() => setDateFilter("today")}
                        className="flex items-center space-x-2"
                      >
                        <CalendarDays className="h-4 w-4" />
                        <span>Today</span>
                      </Button>
                      <Button
                        variant={dateFilter === "tomorrow" ? "default" : "outline"}
                        onClick={() => setDateFilter("tomorrow")}
                        className="flex items-center space-x-2"
                      >
                        <CalendarDays className="h-4 w-4" />
                        <span>Tomorrow</span>
                      </Button>
                      <Button
                        variant={dateFilter === "all" ? "default" : "outline"}
                        onClick={() => setDateFilter("all")}
                        className="flex items-center space-x-2"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>All Trips</span>
                      </Button>
                      <Button
                        variant={dateFilter === "custom" ? "default" : "outline"}
                        onClick={() => setDateFilter("custom")}
                        className="flex items-center space-x-2"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Custom Date</span>
                      </Button>
                    </div>
                    {dateFilter === "custom" && (
                      <div className="space-y-2">
                        <Label htmlFor="customDate" className="text-gray-700 font-medium">
                          Select Date
                        </Label>
                        <Input
                          id="customDate"
                          type="date"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          className="bg-gray-50 border-gray-200 max-w-xs"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Trips List */}
              <div className="grid gap-4">
                {trips.length === 0 ? (
                  <Card className="bg-white shadow-md border-0">
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trips Found</h3>
                      <p className="text-gray-600">
                        {dateFilter === "today"
                          ? "No trips scheduled for today."
                          : dateFilter === "tomorrow"
                            ? "No trips scheduled for tomorrow."
                            : dateFilter === "custom" && customDate
                              ? `No trips found for ${new Date(customDate).toLocaleDateString()}.`
                              : "No trips found for the selected criteria."}
                      </p>
                      {dateFilter !== "all" && (
                        <Button variant="outline" onClick={() => setDateFilter("all")} className="mt-4">
                          View All Trips
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  trips.map((trip) => (
                    <Card
                      key={trip.id}
                      className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 border-0 cursor-pointer"
                      onClick={() => handleTripSelect(trip)}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900">{trip.route}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                Van: {trip.van.plateNumber}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(trip.tripDate).toLocaleDateString()}
                              </span>
                              <span>Time: {trip.arrivalTime}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-green-600">Available: {trip.availableSeats}</span>
                              <span className="text-red-600">Occupied: {trip.occupiedSeats}</span>
                              <span className="text-gray-600">Total: {trip.totalSeats}</span>
                            </div>
                            {trip.driverName && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                Driver: {trip.driverName}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Click to manage seats</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Seat Selection View */}
          {currentView === "seats" && seatData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Seat Management</h2>
                  <p className="text-gray-600">{seatData.tripDetails.route}</p>
                  <p className="text-sm text-gray-500">
                    {seatData.tripDetails.driverName} • {seatData.tripDetails.arrivalTime}
                  </p>
                </div>
                <Button variant="outline" onClick={resetFlow} className="flex items-center space-x-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Trips</span>
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white shadow-md border-0">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Seats</h3>
                    <div className="text-2xl font-bold text-gray-900">{seatData.stats.totalSeats}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-md border-0">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Available</h3>
                    <div className="text-2xl font-bold text-green-600">{seatData.stats.availableSeats}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-md border-0">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Occupied</h3>
                    <div className="text-2xl font-bold text-red-600">{seatData.stats.occupiedSeats}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-md border-0">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Pending</h3>
                    <div className="text-2xl font-bold text-orange-600">{seatData.stats.pendingSeats}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Occupied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Pending</span>
                </div>
              </div>

              {/* Van Seat Layout */}
              <Card className="bg-white shadow-md border-0 p-8">
                <CardContent className="p-0">
                  <div className="flex justify-center">
                    <div className="relative bg-gray-100 rounded-2xl p-8 w-full max-w-2xl">
                      {/* Driver Section */}
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex space-x-4">
                          {seatData.seats
                            .filter((seat) => ["11", "08", "05", "02"].includes(seat.seatNumber))
                            .sort(
                              (a, b) =>
                                ["11", "08", "05", "02"].indexOf(a.seatNumber) -
                                ["11", "08", "05", "02"].indexOf(b.seatNumber),
                            )
                            .map((seat) => (
                              <Button
                                key={seat.id}
                                onClick={() => handleSeatSelect(seat)}
                                className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(seat)}`}
                                disabled={seat.status !== "available"}
                              >
                                {seat.seatNumber}
                              </Button>
                            ))}
                        </div>
                        <div className="bg-gray-200 border-2 border-gray-300 rounded-lg px-4 py-6 text-center font-semibold text-gray-700">
                          Driver
                        </div>
                      </div>

                      {/* Row 2 */}
                      <div className="flex space-x-4 mb-6">
                        {seatData.seats
                          .filter((seat) => ["12", "09", "06", "03"].includes(seat.seatNumber))
                          .sort(
                            (a, b) =>
                              ["12", "09", "06", "03"].indexOf(a.seatNumber) -
                              ["12", "09", "06", "03"].indexOf(b.seatNumber),
                          )
                          .map((seat) => (
                            <Button
                              key={seat.id}
                              onClick={() => handleSeatSelect(seat)}
                              className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(seat)}`}
                              disabled={seat.status !== "available"}
                            >
                              {seat.seatNumber}
                            </Button>
                          ))}
                      </div>

                      {/* Row 3 */}
                      <div className="flex space-x-4">
                        {seatData.seats
                          .filter((seat) => ["13", "10", "07", "04", "01"].includes(seat.seatNumber))
                          .sort(
                            (a, b) =>
                              ["13", "10", "07", "04", "01"].indexOf(a.seatNumber) -
                              ["13", "10", "07", "04", "01"].indexOf(b.seatNumber),
                          )
                          .map((seat) => (
                            <Button
                              key={seat.id}
                              onClick={() => handleSeatSelect(seat)}
                              className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(seat)}`}
                              disabled={seat.status !== "available"}
                            >
                              {seat.seatNumber}
                            </Button>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Passenger Information View */}
          {currentView === "passenger-info" && selectedSeat && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Passenger Information</h2>
                  <p className="text-gray-600">
                    Seat {selectedSeat.seatNumber} • {selectedTrip?.route}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentView("seats")}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Seats</span>
                </Button>
              </div>

              <Card className="bg-white shadow-md border-0">
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={passengerData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="bg-gray-50 border-gray-200"
                        placeholder="Enter passenger's full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-gray-700 font-medium">
                        Age *
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={passengerData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        className="bg-gray-50 border-gray-200"
                        placeholder="Enter age"
                        min="1"
                        max="120"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-700 font-medium">
                      Address *
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      value={passengerData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="bg-gray-50 border-gray-200"
                      placeholder="Enter complete address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber" className="text-gray-700 font-medium">
                        Contact Number *
                      </Label>
                      <Input
                        id="contactNumber"
                        type="tel"
                        value={passengerData.contactNumber}
                        onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                        className="bg-gray-50 border-gray-200"
                        placeholder="Enter contact number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact" className="text-gray-700 font-medium">
                        Emergency Contact
                      </Label>
                      <Input
                        id="emergencyContact"
                        type="tel"
                        value={passengerData.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        className="bg-gray-50 border-gray-200"
                        placeholder="Emergency contact (optional)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="classification" className="text-gray-700 font-medium">
                        Classification *
                      </Label>
                      <Select
                        value={passengerData.classification}
                        onValueChange={(value) => handleInputChange("classification", value)}
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue placeholder="Select classification" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Regular">Regular (₱210)</SelectItem>
                          <SelectItem value="Student">Student (₱170)</SelectItem>
                          <SelectItem value="PWD">PWD (₱170)</SelectItem>
                          <SelectItem value="Senior Citizen">Senior Citizen (₱170)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod" className="text-gray-700 font-medium">
                        Payment Method *
                      </Label>
                      <Select
                        value={passengerData.paymentMethod}
                        onValueChange={(value) => handleInputChange("paymentMethod", value)}
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="GCASH">GCash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {["Student", "PWD", "Senior Citizen"].includes(passengerData.classification) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm">
                        **Please verify ID for {passengerData.classification} discount eligibility.
                      </p>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      onClick={handlePassengerSubmit}
                      disabled={!isFormValid()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-medium"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment Confirmation View */}
          {currentView === "payment" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payment Confirmation</h2>
                  <p className="text-gray-600">Review and confirm the booking details</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentView("passenger-info")}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Info</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booking Summary */}
                <Card className="bg-white shadow-md border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Route:</span>
                        <span className="font-medium">{selectedTrip?.route}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seat:</span>
                        <span className="font-medium">{selectedSeat?.seatNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {selectedTrip && new Date(selectedTrip.tripDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{selectedTrip?.arrivalTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Passenger:</span>
                        <span className="font-medium">{passengerData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Classification:</span>
                        <span className="font-medium">{passengerData.classification}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">{passengerData.paymentMethod}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fare Breakdown */}
                <Card className="bg-white shadow-md border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fare Breakdown</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Fare:</span>
                        <span>₱{calculateTotalFare().regularFare.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction Fee:</span>
                        <span>₱10.00</span>
                      </div>
                      {calculateTotalFare().discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({passengerData.classification}):</span>
                          <span>-₱{calculateTotalFare().discount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span>₱{calculateTotalFare().totalFare.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handlePaymentConfirm}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Ticket...
                    </>
                  ) : (
                    "Confirm Payment & Generate Ticket"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Receipt/Ticket View */}
          {currentView === "receipt" && createdTicket && (
            <div className="space-y-6 max-w-sm mx-auto">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-green-600 mb-2">E-Ticket Generated!</h2>
                <p className="text-gray-600 text-sm">Please proceed to the counter and present this ticket.</p>
                <p className="text-gray-500 text-xs mt-1">Total: ₱{createdTicket.totalFare.toFixed(2)}</p>
                <div className="mt-2">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                    PAID
                  </span>
                </div>
              </div>

              <Card className="bg-white shadow-lg rounded-3xl border-0 overflow-hidden relative">
                <CardContent className="p-8 text-center">
                  {/* Download Button */}
                  <div className="mb-6">
                    <Button
                      onClick={handleDownload}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full px-4 py-2"
                    >
                      <span className="text-sm font-medium mr-2">Download</span>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Background Logo - Watermarked */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="text-6xl font-bold text-gray-300 tracking-wider">VANTAY</div>
                  </div>

                  {/* Seat Number - Prominent display */}
                  <div className="mb-8 relative z-10">
                    <div className="text-8xl font-bold text-gray-900 mb-2">{createdTicket.seat.seatNumber}</div>
                  </div>

                  {/* Trip Information */}
                  <div className="mb-8 relative z-10">
                    <p className="text-lg font-semibold text-gray-900 mb-1">{createdTicket.ticketNumber}</p>
                    <p className="text-gray-700 text-sm mb-1">{createdTicket.trip.route}</p>
                    <p className="text-gray-600 text-xs">Departure: {createdTicket.trip.arrivalTime}</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center relative z-10 mb-4">
                    <Image
                      src={createdTicket.qrCodeUrl || "/placeholder.svg?height=120&width=120" || "/placeholder.svg"}
                      alt="Booking QR Code"
                      width={120}
                      height={120}
                      className="w-30 h-30"
                      crossOrigin="anonymous"
                      unoptimized
                      priority
                    />
                  </div>

                  {/* Status */}
                  <div className="mt-4 relative z-10">
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      PAID
                    </span>
                  </div>

                  {/* Instructions */}
                  <div className="mt-4 relative z-10">
                    <p className="text-xs text-gray-500">Present this QR code at the counter</p>
                    <p className="text-xs text-gray-500">Total: ₱{createdTicket.totalFare.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="w-full rounded-2xl h-12 font-medium"
                >
                  Print Ticket
                </Button>
                <Button
                  onClick={resetFlow}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-2xl h-12 font-medium"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Create Another Booking
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
