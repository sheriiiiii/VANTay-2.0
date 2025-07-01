"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AdminSidebar from "@/components/sidebar/AdminSidebar"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

interface Trip {
  id: string
  route: string
  date: string
  time: string
  totalSeats: number
  van: {
    plateNumber: string
  }
  tickets: Array<{
    id: string
    seatNumber: number
  }>
}

export default function ManageSeat() {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null)

  // Hardcoded trips data
  const trips: Trip[] = [
    {
      id: "1",
      route: "Iloilo to SanJose",
      date: "2024-01-15",
      time: "08:00 AM",
      totalSeats: 13,
      van: {
        plateNumber: "ABC-1234",
      },
      tickets: [
        { id: "t1", seatNumber: 3 },
        { id: "t2", seatNumber: 1 },
      ],
    },
  ]

  const seatStatuses = {
    1: "pending",
    2: "available",
    3: "occupied",
    4: "available",
    5: "available",
    6: "available",
    7: "available",
    8: "available",
    9: "unavailable",
    10: "unavailable",
    11: "available",
    12: "unavailable",
    13: "unavailable",
  }

  const getSeatColor = (seatNumber: number) => {
    if (selectedSeats.includes(seatNumber)) return "bg-blue-500 text-white"

    switch (seatStatuses[seatNumber as keyof typeof seatStatuses]) {
      case "available":
        return "bg-green-500 text-white hover:bg-green-600"
      case "occupied":
        return "bg-red-500 text-white"
      case "pending":
        return "bg-orange-500 text-white"
      case "unavailable":
        return "bg-gray-400 text-white"
      default:
        return "bg-gray-300 text-gray-700"
    }
  }

  const handleSeatClick = (seatNumber: number) => {
    const status = seatStatuses[seatNumber as keyof typeof seatStatuses]
    if (status === "available") {
      setSelectedSeats((prev) =>
        prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber],
      )
    }
  }

  const stats = [
    {
      title: "Total Seats",
      value: "13",
    },
    {
      title: "Available Seats",
      value: "10",
    },
    {
      title: "Occupied Seats",
      value: "5",
    },
  ]

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
          {!selectedTrip ? (
            // Trip Selection View
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Trip</h2>
                <p className="text-gray-600 mb-6">Choose a trip to manage seat assignments</p>
              </div>

              <div className="grid gap-4">
                {trips.map((trip) => (
                  <Card
                    key={trip.id}
                    className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 border-0 cursor-pointer"
                    onClick={() => setSelectedTrip(trip.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900">{trip.route}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Van: {trip.van.plateNumber}</span>
                            <span>Date: {new Date(trip.date).toLocaleDateString()}</span>
                            <span>Time: {trip.time}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-green-600">Available: {trip.totalSeats - trip.tickets.length}</span>
                            <span className="text-gray-600">Total: {trip.totalSeats}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Click to manage seats</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            // Seat Management View
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Seat Management</h2>
                  <p className="text-gray-600">Managing seats for selected trip</p>
                </div>
                <Button variant="outline" onClick={() => setSelectedTrip(null)} className="flex items-center space-x-2">
                  <span>← Back to Trips</span>
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <Card
                    key={index}
                    className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 border-0"
                  >
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{stat.title}</h3>
                      <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Seat Selection Section */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Seats for Passenger</h2>
                  <p className="text-gray-600 mb-4">Click on seats to manage occupancy and status</p>

                  {/* Legend */}
                  <div className="flex items-center space-x-6 mb-6">
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
                </div>

                {/* Van Seat Layout */}
                <Card className="bg-white shadow-md border-0 p-8">
                  <CardContent className="p-0">
                    <div className="flex justify-center">
                      <div className="relative bg-gray-100 rounded-2xl p-8 w-full max-w-2xl">
                        {/* Row 1 */}
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex space-x-4">
                            <Button
                              onClick={() => handleSeatClick(11)}
                              className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(11)}`}
                            >
                              11
                            </Button>
                            <Button
                              onClick={() => handleSeatClick(8)}
                              className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(8)}`}
                            >
                              08
                            </Button>
                            <Button
                              onClick={() => handleSeatClick(5)}
                              className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(5)}`}
                            >
                              05
                            </Button>
                            <Button
                              onClick={() => handleSeatClick(2)}
                              className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(2)}`}
                            >
                              02
                            </Button>
                          </div>
                          <div className="bg-gray-200 border-2 border-gray-300 rounded-lg px-4 py-6 text-center font-semibold text-gray-700">
                            Driver
                          </div>
                        </div>

                        {/* Row 2 */}
                        <div className="flex space-x-4 mb-6">
                          <Button
                            onClick={() => handleSeatClick(12)}
                            className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(12)}`}
                            disabled={seatStatuses[12] === "unavailable"}
                          >
                            12
                          </Button>
                          <Button
                            onClick={() => handleSeatClick(9)}
                            className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(9)}`}
                            disabled={seatStatuses[9] === "unavailable"}
                          >
                            09
                          </Button>
                          <Button
                            onClick={() => handleSeatClick(6)}
                            className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(6)}`}
                          >
                            06
                          </Button>
                          <Button
                            onClick={() => handleSeatClick(3)}
                            className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(3)}`}
                            disabled={seatStatuses[3] === "occupied"}
                          >
                            03
                          </Button>
                        </div>

                        {/* Row 3 */}
                        <div className="flex space-x-4">
                          <Button
                            onClick={() => handleSeatClick(13)}
                            className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(13)}`}
                            disabled={seatStatuses[13] === "unavailable"}
                          >
                            13
                          </Button>
                          <Button
                            onClick={() => handleSeatClick(10)}
                            className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(10)}`}
                            disabled={seatStatuses[10] === "unavailable"}
                          >
                            10
                          </Button>
                          <Button
                            onClick={() => handleSeatClick(7)}
                            className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(7)}`}
                          >
                            07
                          </Button>
                          <Button
                            onClick={() => handleSeatClick(4)}
                            className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(4)}`}
                          >
                            04
                          </Button>
                          <Button
                            onClick={() => handleSeatClick(1)}
                            className={`w-16 h-12 rounded-lg font-semibold ${getSeatColor(1)}`}
                            disabled={seatStatuses[1] === "pending"}
                          >
                            01
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
