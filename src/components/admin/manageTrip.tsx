"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Settings, Filter, ArrowUpDown, Edit, Trash2, Users } from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AdminSidebar from "@/components/sidebar/AdminSidebar"
import { Separator } from "@/components/ui/separator"
import CreateTripModal from "@/components/modals/createTrip"
import EditTripModal from "@/components/modals/editTrip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Trip {
  id: number
  tripDate: string
  availableSeats: number
  driverName?: string
  driverPhone?: string
  van: {
    id: number
    plateNumber: string
    capacity: number
  }
  route: {
    id: number
    name: string
  }
}

export default function ManageTrip() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const fetchTrips = async () => {
    try {
      const res = await fetch("/api/admin/trips")
      if (!res.ok) throw new Error("Failed to fetch trips")
      const data = await res.json()
      setTrips(data)
    } catch (error) {
      console.error("Error fetching trips:", error)
      toast.error("Failed to fetch trips")
    } finally {
      setLoading(false)
    }
  }

  const deleteTrip = async (tripId: number) => {
    setDeletingId(tripId)
    try {
      const res = await fetch(`/api/admin/trips?id=${tripId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to delete trip")
      }
      // Remove the trip from the local state
      setTrips(trips.filter((trip) => trip.id !== tripId))
      toast.success("Trip deleted successfully")
    } catch (error) {
      console.error("Error deleting trip:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete trip")
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip)
    setEditModalOpen(true)
  }

  const handleTripUpdated = () => {
    fetchTrips() // Refresh the trips list
  }

  // Helper function to get seat status color
  const getSeatStatusColor = (available: number, total: number) => {
    const percentage = (available / total) * 100
    if (percentage > 70) return "text-green-600"
    if (percentage > 30) return "text-yellow-600"
    return "text-red-600"
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Manage van trips</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-8 bg-[rgba(219,234,254,0.3)]">
          <div className="mb-4">
            <p className="text-gray-600">Manage scheduled trips and availability</p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <CreateTripModal onTripCreated={fetchTrips} />
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" className="h-10 w-10 bg-transparent">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 bg-transparent">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Trips Table */}
          <Card className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl border-0">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {loading ? (
                  <p className="p-4 text-gray-600">Loading trips...</p>
                ) : trips.length === 0 ? (
                  <p className="p-4 text-gray-500">No trips scheduled yet.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Van</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Route</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Seats</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Driver</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Phone</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.map((trip) => (
                        <tr
                          key={trip.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="py-4 px-6 text-gray-900">{trip.van.plateNumber}</td>
                          <td className="py-4 px-6 text-gray-900">{trip.route.name}</td>
                          <td className="py-4 px-6 text-gray-900">
                            {new Date(trip.tripDate).toLocaleDateString("en-PH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span
                                className={`font-medium ${getSeatStatusColor(trip.availableSeats, trip.van.capacity)}`}
                              >
                                {trip.availableSeats}/{trip.van.capacity}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-900">{trip.driverName || "-"}</td>
                          <td className="py-4 px-6 text-gray-900">{trip.driverPhone || "-"}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                onClick={() => handleEditTrip(trip)}
                                title="Edit trip"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:bg-red-50"
                                    disabled={deletingId === trip.id}
                                    title="Delete trip"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Trip</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this trip? This action cannot be undone.
                                      <br />
                                      <br />
                                      <strong>Trip Details:</strong>
                                      <br />
                                      Van: {trip.van.plateNumber}
                                      <br />
                                      Route: {trip.route.name}
                                      <br />
                                      Date:{" "}
                                      {new Date(trip.tripDate).toLocaleDateString("en-PH", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                      <br />
                                      Seats: {trip.availableSeats}/{trip.van.capacity}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteTrip(trip.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={deletingId === trip.id}
                                    >
                                      {deletingId === trip.id ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Trip Modal */}
        <EditTripModal
          trip={editingTrip}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onUpdated={handleTripUpdated}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
