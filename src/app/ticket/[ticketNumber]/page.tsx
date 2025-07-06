import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, User, Phone, CreditCard } from "lucide-react"
import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"

const prisma = new PrismaClient()

interface TicketPageProps {
  params: {
    ticketNumber: string
  }
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { ticketNumber } = params

  // Fetch ticket information from database
  const ticket = await prisma.ticket.findUnique({
    where: {
      ticketNumber: ticketNumber,
    },
    include: {
      trip: {
        include: {
          route: true,
          van: true,
        },
      },
      seat: true,
    },
  })

  if (!ticket) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "PAID":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-blue-100 text-blue-800"
      case "USED":
        return "bg-gray-100 text-gray-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RidA</h1>
          <p className="text-gray-600">Digital Ticket Verification</p>
        </div>

        {/* Main Ticket Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center items-center gap-4 mb-2">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Ticket Status</p>
                <Badge className={getTicketStatusColor(ticket.ticketStatus)}>{ticket.ticketStatus}</Badge>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                <Badge className={getStatusColor(ticket.paymentStatus)}>{ticket.paymentStatus}</Badge>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Seat {ticket.seat.seatNumber}</CardTitle>
            <p className="text-sm text-gray-500">{ticket.ticketNumber}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Passenger Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{ticket.passengerName}</p>
                  <p className="text-sm text-gray-500">Age: {ticket.passengerAge}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <p className="text-gray-700">{ticket.passengerPhone}</p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p className="text-gray-700">{ticket.passengerEmergencyContact}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <p className="text-gray-700">{ticket.passengerAddress}</p>
              </div>
            </div>

            <hr className="my-4" />

            {/* Trip Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Route</p>
                  <p className="text-sm text-gray-600">
                    {ticket.trip.route.origin} → {ticket.trip.route.destination}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Trip Date</p>
                  <p className="text-sm text-gray-600">
                    {new Date(ticket.trip.tripDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            {/* Payment Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Fare Breakdown</p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Regular Fare:</span>
                      <span>₱{ticket.regularFare.toFixed(2)}</span>
                    </div>
                    {ticket.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({ticket.passengerType}):</span>
                        <span>-₱{ticket.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-gray-900 pt-1 border-t">
                      <span>Total:</span>
                      <span>₱{ticket.totalFare.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>This is a digital ticket verification page</p>
          <p className="mt-1">Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
