"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

type SeatStatus = "available" | "occupied" | "selected" | "pending"

interface Seat {
  id: string
  status: SeatStatus
  row: number
  position: "left" | "right" | "driver"
}

const mockSeats: Seat[] = [
  // Driver seat
  { id: "driver", status: "occupied", row: 0, position: "driver" },

  // Row 1
  { id: "1A", status: "pending", row: 1, position: "left" },
  { id: "1B", status: "pending", row: 1, position: "right" },
  { id: "1C", status: "occupied", row: 1, position: "right" },

  // Row 2
  { id: "2A", status: "available", row: 2, position: "left" },
  { id: "2B", status: "available", row: 2, position: "right" },
  { id: "2C", status: "available", row: 2, position: "right" },

  // Row 3
  { id: "3A", status: "selected", row: 3, position: "left" },
  { id: "3B", status: "available", row: 3, position: "right" },
  { id: "3C", status: "available", row: 3, position: "right" },

  // Row 4
  { id: "4A", status: "available", row: 4, position: "left" },
  { id: "4B", status: "available", row: 4, position: "right" },
  { id: "4C", status: "available", row: 4, position: "right" },
]

export default function SeatSelection() {
  const router = useRouter()
  const [seats, setSeats] = useState<Seat[]>(mockSeats)
  const [selectedSeat, setSelectedSeat] = useState<string | null>("3A")

  const handleSeatClick = (seatId: string) => {
    if (seatId === "driver") return

    const seat = seats.find((s) => s.id === seatId)
    if (!seat || seat.status === "occupied") return

    setSeats((prevSeats) =>
      prevSeats.map((s) => {
        if (s.id === selectedSeat) {
          return { ...s, status: "available" }
        }
        if (s.id === seatId) {
          return { ...s, status: "selected" }
        }
        return s
      }),
    )
    setSelectedSeat(seatId)
  }

  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case "available":
        return "bg-green-500 hover:bg-green-600"
      case "occupied":
        return "bg-red-500 cursor-not-allowed"
      case "selected":
        return "bg-blue-500"
      case "pending":
        return "bg-orange-500"
      default:
        return "bg-gray-300"
    }
  }

  const handleContinue = () => {
    if (selectedSeat) {
      console.log(`Proceeding with seat ${selectedSeat}`)
      // Handle continue logic
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Choose Your Seat</h1>
          <p className="text-gray-600 text-sm">Trip 1</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center gap-4 mb-8 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span>Pending</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="max-w-xs mx-auto mb-8">
        {/* Driver Section */}
        <div className="flex justify-between mb-4">
          <div className="bg-gray-200 rounded-lg p-4 flex-1 mr-2 text-center">
            <span className="text-sm font-medium text-gray-700">Driver</span>
          </div>
          <button
            onClick={() => handleSeatClick("driver")}
            className="w-16 h-16 bg-red-500 rounded-lg cursor-not-allowed"
          />
        </div>

        {/* Passenger Seats */}
        <div className="space-y-3">
          {/* Row 1 */}
          <div className="flex justify-between">
            <button
              onClick={() => handleSeatClick("1A")}
              className={`w-16 h-16 rounded-lg transition-colors ${getSeatColor("pending")}`}
            />
            <button
              onClick={() => handleSeatClick("1B")}
              className={`w-16 h-16 rounded-lg transition-colors ${getSeatColor("pending")}`}
            />
            <button
              onClick={() => handleSeatClick("1C")}
              className={`w-16 h-16 rounded-lg transition-colors ${getSeatColor("occupied")}`}
            />
          </div>

          {/* Row 2 */}
          <div className="flex justify-between">
            <button
              onClick={() => handleSeatClick("2A")}
              className={`w-16 h-16 rounded-lg transition-colors ${getSeatColor("available")}`}
            />
            <button
              onClick={() => handleSeatClick("2B")}
              className={`w-16 h-16 rounded-lg transition-colors ${getSeatColor("available")}`}
            />
            <button
              onClick={() => handleSeatClick("2C")}
              className={`w-16 h-16 rounded-lg transition-colors ${getSeatColor("available")}`}
            />
          </div>

          {/* Row 3 */}
          <div className="flex justify-between">
            <button
              onClick={() => handleSeatClick("3A")}
              className={`w-16 h-16 rounded-lg transition-colors ${getSeatColor(selectedSeat === "3A" ? "selected" : "available")}`}
            />
            <button
              onClick={() => handleSeatClick("3B")}
              className={`w-16 h-16 rounded-lg transition-colors ${getSeatColor("available")}`}
            />
            <button
              onClick={() => handleSeatClick("3C")}
              className={`w-16 h-16 rounded-lg transition-colors ${getSeatColor("available")}`}
            />
          </div>

          {/* Row 4 */}
          <div className="flex justify-between">
            <button
              onClick={() => handleSeatClick("4A")}
              className={`w-16 h-16 rounded-lg transition-colors ${getSeatColor("available")}`}
            />
            <button
              onClick={() => handleSeatClick("4B")}
              className={`w-16 h-16 rounded-lg transition-colors ${getSeatColor("available")}`}
            />
            <button
              onClick={() => handleSeatClick("4C")}
              className={`w-16 h-16 rounded-lg transition-colors ${getSeatColor("available")}`}
            />
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="max-w-xs mx-auto mb-8">
        <Button
          onClick={handleContinue}
          disabled={!selectedSeat}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-lg h-12 font-medium disabled:opacity-50"
        >
          Continue
        </Button>
      </div>
     
    </div>
  )
}
