"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

type SeatStatus = "available" | "occupied" | "selected" | "pending"

interface Seat {
  id: string
  seatId: number
  status: SeatStatus
  seatNumber: string
}

interface TripDetails {
  driverName?: string
  arrivalTime?: string
  tripDate: string
}

interface SeatData {
  tripId: number
  vanId: number
  seats: Seat[]
  tripDetails: TripDetails
}

export default function SeatSelection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tripId = searchParams.get("tripId")

  const [seatData, setSeatData] = useState<SeatData | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tripId) {
      setError("Trip ID is required")
      setLoading(false)
      return
    }

    fetchSeats()
  }, [tripId])

  const fetchSeats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/trips/${tripId}/seats`)

      if (!response.ok) {
        throw new Error("Failed to fetch seat data")
      }

      const data: SeatData = await response.json()
      setSeatData(data)
      setSeats(data.seats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load seats")
    } finally {
      setLoading(false)
    }
  }

  const handleSeatClick = async (seatNumber: string) => {
    const seat = seats.find((s) => s.seatNumber === seatNumber)
    if (!seat || seat.status === "occupied" || seat.status === "pending") return

    // Update UI immediately for better UX
    setSeats((prevSeats) =>
      prevSeats.map((s) => {
        if (s.seatNumber === selectedSeat) return { ...s, status: "available" }
        if (s.seatNumber === seatNumber) return { ...s, status: "selected" }
        return s
      }),
    )
    setSelectedSeat(seatNumber)
  }

  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case "available":
        return "bg-green-500 hover:bg-green-600 cursor-pointer"
      case "occupied":
        return "bg-red-500 cursor-not-allowed"
      case "selected":
        return "bg-blue-500 cursor-pointer"
      case "pending":
        return "bg-orange-500 cursor-not-allowed"
      default:
        return "bg-gray-300"
    }
  }

  const handleContinue = async () => {
    if (!selectedSeat || !tripId) return

    try {
      setReserving(true)

      // Reserve the seat
      const response = await fetch(`/api/trips/${tripId}/seats/reserve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seatNumber: selectedSeat }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to reserve seat")
      }

      const reservationData = await response.json()

      // Navigate to passenger info with seat and trip details
      router.push(
        `/passenger/passenger-info?tripId=${tripId}&seatId=${reservationData.seatId}&seatNumber=${selectedSeat}`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reserve seat")
      // Refresh seat data to get current status
      fetchSeats()
    } finally {
      setReserving(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b via-gray-100 from-indigo-300 to-transparent flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading seats...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b via-gray-100 from-indigo-300 to-transparent flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  // Group seats into rows of 3 (excluding driver seat)
  const seatRows: string[][] = []
  const passengerSeats = seats.filter((seat) => seat.seatNumber !== "driver")

  for (let i = 0; i < passengerSeats.length; i += 3) {
    const row = passengerSeats.slice(i, i + 3).map((seat) => seat.seatNumber)
    // Pad row to ensure 3 seats per row for consistent layout
    while (row.length < 3) {
      row.push("")
    }
    seatRows.push(row)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b via-gray-100 from-indigo-300 to-transparent px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={handleBack} className="mr-4" aria-label="Go back">
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Choose Your Seat</h1>
          <p className="text-gray-600 text-sm">
            {seatData?.tripDetails.driverName && `Driver: ${seatData.tripDetails.driverName}`}
            {seatData?.tripDetails.arrivalTime && ` • ${seatData.tripDetails.arrivalTime}`}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center gap-4 mb-8 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full" />
          <span>Pending</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="max-w-xs mx-auto mb-8 px-4">
        {/* Top Row - Driver and Seat 01 */}
        {/* Driver Section and Seat 01 */}
        <div className="flex justify-between items-center gap-3 mb-4">
          <div className="bg-gray-100 border-2 border-gray-200 rounded-xl p-4 flex-1 text-center min-h-[64px] flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">Driver</span>
          </div>
          <button
            onClick={() => handleSeatClick("01")}
            className={`w-20 h-16 rounded-xl transition-colors flex items-center justify-center font-bold text-white text-sm ${
              seats.find((s) => s.seatNumber === "01")?.status === "selected" || selectedSeat === "01"
                ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                : seats.find((s) => s.seatNumber === "01")?.status === "occupied"
                  ? "bg-red-500 cursor-not-allowed"
                  : seats.find((s) => s.seatNumber === "01")?.status === "pending"
                    ? "bg-orange-500 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 cursor-pointer"
            }`}
            disabled={
              seats.find((s) => s.seatNumber === "01")?.status === "occupied" ||
              seats.find((s) => s.seatNumber === "01")?.status === "pending"
            }
            title="Seat 01"
            aria-label={`Seat 01 - ${seats.find((s) => s.seatNumber === "01")?.status || "available"}`}
          >
            01
          </button>
        </div>

        {/* Passenger Seats Grid - 4 rows of 3 seats each */}
        {/* Passenger Seats Grid */}
        <div className="grid grid-cols-3 gap-3 justify-items-center">
          {["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"].map((seatNumber) => {
            const seat = seats.find((s) => s.seatNumber === seatNumber)
            const isSelected = seatNumber === selectedSeat
            const status = isSelected ? "selected" : seat?.status || "available"

            return (
              <button
                key={`seat-${seatNumber}`}
                onClick={() => handleSeatClick(seatNumber)}
                className={`w-20 h-16 rounded-xl transition-colors flex items-center justify-center font-bold text-white text-sm ${getSeatColor(status)}`}
                title={`Seat ${seatNumber}`}
                aria-label={`Seat ${seatNumber} - ${status}`}
                disabled={status === "occupied" || status === "pending"}
              >
                {seatNumber}
              </button>
            )
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="max-w-xs mx-auto mb-8">
        <Button
          onClick={handleContinue}
          disabled={!selectedSeat || reserving}
          className="w-full bg-blue-800 hover:bg-blue-900 text-white rounded-lg h-12 font-medium disabled:opacity-50"
        >
          {reserving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reserving...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>

      {/* Seat Count Info */}
      <div className="max-w-xs mx-auto text-center text-sm text-gray-600">
        <p>
          Available: {seats.filter((s) => s.status === "available").length} | Occupied:{" "}
          {seats.filter((s) => s.status === "occupied").length} | Pending:{" "}
          {seats.filter((s) => s.status === "pending").length}
        </p>
      </div>
    </div>
  )
}
