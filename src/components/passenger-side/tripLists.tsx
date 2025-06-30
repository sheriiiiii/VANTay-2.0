"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Trip {
  id: number
  tripNumber: string
  route: string
  availableSeats: number
}

const mockTrips: Trip[] = [
  {
    id: 1,
    tripNumber: "Trip 1",
    route: "Iloilo to San Jose",
    availableSeats: 5,
  },
  {
    id: 2,
    tripNumber: "Trip 2",
    route: "Iloilo to San Jose",
    availableSeats: 10,
  },
  {
    id: 3,
    tripNumber: "Trip 3",
    route: "Iloilo to San Jose",
    availableSeats: 10,
  },
]

export default function TripLists() {
  const handleSelectSeat = (tripId: number) => {
    console.log(`Selecting seat for trip ${tripId}`)
    // Handle seat selection logic here
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Find Your Ride</h1>
      </div>

      {/* Trip Cards */}
      <div className="space-y-6 max-w-sm mx-auto">
        {mockTrips.map((trip) => (
          <Card key={trip.id} className="bg-white shadow-md rounded-2xl border-0">
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{trip.tripNumber}</h2>

              <p className="text-gray-700 font-medium mb-3">{trip.route}</p>

              <div className="mb-4">
                <span className="text-gray-600 text-sm">Available Seats: </span>
                <span className="font-bold text-gray-900">{trip.availableSeats}</span>
              </div>

              <Button
                onClick={() => handleSelectSeat(trip.id)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-lg h-12 font-medium"
              >
                Select a seat
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
