"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, Home, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface TicketData {
  id: number
  ticketNumber: string
  totalFare: number
  qrCodeUrl: string
  qrCodeData: string
  paymentStatus?: string
  trip: {
    route: string
    arrivalTime: string
  }
  seat: {
    seatNumber: string
  }
}

export default function ReceiptPage() {
  const router = useRouter()
  const [ticketData, setTicketData] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get ticket data from sessionStorage
    const storedReceiptData = sessionStorage.getItem("receiptData")
    if (storedReceiptData) {
      try {
        const parsedData = JSON.parse(storedReceiptData)
        setTicketData(parsedData)
      } catch (error) {
        console.error("Failed to parse receipt data:", error)
      }
    }
    setLoading(false)
  }, [])

  const handleBack = () => {
    router.back()
  }

  const handleDownload = () => {
    if (!ticketData) return

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
      ctx.fillText(ticketData.seat.seatNumber, canvas.width / 2, 200)

      // Trip information
      ctx.font = "bold 18px Arial"
      ctx.fillText(ticketData.ticketNumber, canvas.width / 2, 280)
      ctx.font = "16px Arial"
      ctx.fillText(ticketData.trip.route, canvas.width / 2, 310)
      ctx.fillText(`Departure: ${ticketData.trip.arrivalTime}`, canvas.width / 2, 340)

      // Payment status
      ctx.font = "14px Arial"
      ctx.fillStyle = "#f59e0b"
      ctx.fillText("PAYMENT PENDING", canvas.width / 2, 370)

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
        ctx.fillText(`Total: ₱${ticketData.totalFare.toFixed(2)}`, canvas.width / 2, 570)

        // Convert to blob and download after QR code is drawn
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `vantay-ticket-${ticketData.ticketNumber}.png`
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
            a.download = `vantay-ticket-${ticketData.ticketNumber}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        })
      }
      qrImage.src = ticketData.qrCodeUrl
    }
  }

  const handleBackToHome = () => {
    // Clear session storage
    sessionStorage.removeItem("ticketData")
    sessionStorage.removeItem("receiptData")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading receipt...</span>
        </div>
      </div>
    )
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No ticket information found</p>
          <Button onClick={() => router.push("/passenger/trips")}>Back to Trips</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={handleBack} className="mr-4" aria-label="Go back">
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">E-Ticket Generated!</h1>
      </div>

      {/* Instructions */}
      <div className="text-center mb-8">
        <p className="text-gray-600 text-sm">Please proceed to the counter and present this ticket.</p>
        <p className="text-gray-500 text-xs mt-1">Total: ₱{ticketData.totalFare.toFixed(2)}</p>
        <div className="mt-2">
          <span className="inline-block bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
            Payment Pending
          </span>
        </div>
      </div>

      {/* Receipt/Ticket Card */}
      <div className="max-w-sm mx-auto mb-8">
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
              <div className="text-8xl font-bold text-gray-900 mb-2">{ticketData.seat.seatNumber}</div>
            </div>

            {/* Trip Information */}
            <div className="mb-8 relative z-10">
              <p className="text-lg font-semibold text-gray-900 mb-1">{ticketData.ticketNumber}</p>
              <p className="text-gray-700 text-sm mb-1">{ticketData.trip.route}</p>
              <p className="text-gray-600 text-xs">Departure: {ticketData.trip.arrivalTime}</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center relative z-10 mb-4">
              <Image
                src={ticketData.qrCodeUrl || "/placeholder.svg?height=120&width=120"}
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
              <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                Payment Pending
              </span>
            </div>

            {/* Instructions */}
            <div className="mt-4 relative z-10">
              <p className="text-xs text-gray-500">Present this QR code at the counter</p>
              <p className="text-xs text-gray-500">Total: ₱{ticketData.totalFare.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Back to Home Button */}
      <div className="max-w-sm mx-auto">
        <Button
          onClick={handleBackToHome}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-2xl h-12 font-medium"
        >
          <Home className="h-5 w-5 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  )
}
