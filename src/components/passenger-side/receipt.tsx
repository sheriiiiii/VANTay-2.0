"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, Home } from "lucide-react"
import { useRouter } from "next/navigation"

interface ReceiptProps {
  tripNumber?: string
  route?: string
  seatNumber?: string | number
  bookingReference?: string
  qrCodeData?: string
}

export default function Receipt({
  tripNumber = "Trip 1",
  route = "Iloilo to San Jose",
  seatNumber = "8",
  bookingReference = "VANTAY-001-2024",
  qrCodeData = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VANTAY-BOOKING-001-2024",
}: ReceiptProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const handleDownload = () => {
    // Create a canvas to generate the ticket image
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (ctx) {
      canvas.width = 400
      canvas.height = 600

      // Fill background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add content (simplified version)
      ctx.fillStyle = "#000000"
      ctx.font = "bold 24px Arial"
      ctx.textAlign = "center"
      ctx.fillText("VANTAY", canvas.width / 2, 100)

      ctx.font = "bold 48px Arial"
      ctx.fillText(seatNumber.toString(), canvas.width / 2, 200)

      ctx.font = "16px Arial"
      ctx.fillText(tripNumber, canvas.width / 2, 250)
      ctx.fillText(route, canvas.width / 2, 280)

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `vantay-ticket-${bookingReference}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      })
    }
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b via-white from-indigo-300 px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Pending Payment</h1>
      </div>

      {/* Instructions */}
      <div className="text-center mb-8">
        <p className="text-gray-600 text-md">Please proceed to the counter and present this.</p>
      </div>

      {/* Download Button */}
     
      <div className="text-center mb-8">
        <Button
          onClick={handleDownload}
          variant="outline"
          className="bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg px-6 py-3"
        >
          <Download className="h-5 w-5 mr-2" />
          Download
        </Button>
      </div>
      {/* Receipt/Ticket Card */}
      <div className="max-w-sm mx-auto mb-8">
        <Card className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden">
          <CardContent className="p-8 text-center relative">
            {/* Background Logo - Transparent and Bigger */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <img src="/assets/vantay-logo.png" alt="VANTAY Logo Background" className="w-96 h-96 object-contain" />
            </div>

            {/* Seat Number - Over the transparent logo */}
            <div className="mb-6 relative z-10 mt-8">
              <div className="text-8xl font-bold text-gray-900 mb-2">{seatNumber}</div>
            </div>

            {/* Trip Information */}
            <div className="mb-8 relative z-10">
              <p className="text-lg font-semibold text-gray-900 mb-1">{tripNumber}</p>
              <p className="text-gray-700">{route}</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center relative z-10">
              <img
                src={qrCodeData || "/placeholder.svg"}
                alt="Booking QR Code"
                className="w-32 h-32"
                crossOrigin="anonymous"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Back to Home Button */}
      <div className="max-w-sm mx-auto mb-8">
        <Button
          onClick={handleBackToHome}
          className="w-full  bg-blue-800 hover:bg-blue-900 text-white rounded-lg h-12 font-medium"
        >
          <Home className="h-5 w-5 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  )
}
