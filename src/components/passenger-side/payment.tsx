
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface TicketData {
  id: number
  ticketNumber: string
  totalFare: number
  discount: number
  passengerType: string
  qrCodeUrl: string
  qrCodeData: string
  trip: {
    id: number
    route: string
    tripDate: string
    arrivalTime: string
  }
  seat: {
    seatNumber: string
  }
}

export default function Payment() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ticketId = searchParams.get("ticketId")
  const [ticketData, setTicketData] = useState<TicketData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedTicketData = sessionStorage.getItem("ticketData")
    if (storedTicketData) {
      try {
        const parsedData = JSON.parse(storedTicketData)
        setTicketData(parsedData)
      } catch {
        setError("Failed to parse ticket information")
      }
    } else {
      setError("No ticket information found")
    }
  }, [ticketId])

  const handleBack = () => {
    router.back()
  }

  const handlePayAtCounter = async () => {
    if (!ticketData) return

    setIsProcessing(true)
    setError(null)

    try {
      // Fixed URL - changed from 'payment' to 'payments' to match the route file
      const response = await fetch(`/api/passenger/tickets/${ticketData.id}/payments`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentStatus: "PENDING",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update payment status")
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to process payment")
      }

      // Store the updated ticket data for the receipt
      const updatedTicketData = {
        ...ticketData,
        paymentStatus: "PENDING",
      }

      sessionStorage.setItem("receiptData", JSON.stringify(updatedTicketData))

      // Navigate to receipt page
      router.push("/passenger/receipt")
    } catch (err) {
      console.error("Payment processing error:", err)
      setError(err instanceof Error ? err.message : "Failed to process payment")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatAmount = (amount: number) => amount.toFixed(2)

  const getDiscountInfo = () => {
    if (!ticketData) return null
    const originalAmount = 210 // Regular fare + transaction fee
    const isDiscounted = ticketData.discount > 0
    let discountType = null

    switch (ticketData.passengerType) {
      case "STUDENT":
        discountType = "Student Discount"
        break
      case "PWD":
        discountType = "PWD Discount"
        break
      case "SENIOR_CITIZEN":
        discountType = "Senior Citizen Discount"
        break
    }

    return {
      isDiscounted,
      originalAmount: isDiscounted ? originalAmount : null,
      discountType,
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/passenger/trips")}>Back to Trips</Button>
        </div>
      </div>
    )
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading payment information...</span>
        </div>
      </div>
    )
  }

  const discountInfo = getDiscountInfo()

  return (
    <div className="min-h-screen bg-blue-100 px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-12">
        <button onClick={handleBack} className="mr-4" disabled={isProcessing} aria-label="Go back">
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Payment</h1>
          <p className="text-sm text-gray-600">
            {ticketData.trip.route} • Seat {ticketData.seat.seatNumber}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-sm mx-auto mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Total Amount Section */}
      <div className="text-center mb-16">
        <p className="text-gray-600 text-lg mb-8">TOTAL</p>
        <p className="text-5xl font-bold text-gray-900">₱{formatAmount(ticketData.totalFare)}</p>
        {discountInfo?.isDiscounted && discountInfo.originalAmount && (
          <div className="mt-4">
            <p className="text-lg text-gray-500 line-through">₱{formatAmount(discountInfo.originalAmount)}</p>
            <p className="text-sm text-green-600 font-medium mt-2">
              {discountInfo.discountType} Applied (-₱{formatAmount(ticketData.discount)})
            </p>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">Includes ₱10.00 transaction fee</p>
      </div>

      {/* Payment Options */}
      <div className="space-y-4 max-w-sm mx-auto mb-8">
        <Button
          onClick={handlePayAtCounter}
          disabled={isProcessing}
          variant="outline"
          className="w-full h-14 text-lg font-medium border-0 shadow-gray-500 hover:border-cyan-800 hover:bg-cyan-800 rounded-lg bg-cyan-700"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white ">
              <MapPin className="h-5 w-5 text-white" />
              Pay at the Counter
            </div>
          )}
        </Button>
      </div>

      {/* Payment Method Info */}
      <div className="max-w-sm mx-auto text-center text-sm text-gray-500 mb-8">
        <p className="mb-2">Complete your payment at the counter when you arrive.</p>
        <p className="text-xs">Your seat will be reserved as pending until payment is completed.</p>
      </div>

      {/* Ticket Info */}
      <div className="max-w-sm mx-auto bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-2">Booking Details</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>Ticket: {ticketData.ticketNumber}</p>
          <p>Route: {ticketData.trip.route}</p>
          <p>Seat: {ticketData.seat.seatNumber}</p>
        </div>
      </div>
    </div>
  )
}
