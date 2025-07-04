"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ticket, Filter, ArrowUpDown, Edit, Trash2, RefreshCw } from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AdminSidebar from "@/components/sidebar/AdminSidebar"
import { Separator } from "@/components/ui/separator"
import CreateTicketModal from "@/components/modals/createTicket"
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
import { useEffect, useState } from "react"
import { toast } from "sonner"

type TicketType = {
  id: number
  ticketNumber: string
  passenger: string
  contactNumber: string
  route: string
  date: string
  time: string
  seat: string
  payment: string
}

export default function ManageTickets() {
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching tickets...")
      const res = await fetch("/api/admin/tickets")

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(`HTTP ${res.status}: ${errorData.error || "Unknown error"}`)
      }

      const data = await res.json()
      console.log("Raw API response:", data)

      if (Array.isArray(data)) {
        // Log each ticket to see the structure
        data.forEach((ticket, index) => {
          console.log(`Ticket ${index}:`, ticket)
          console.log(`Ticket ${index} ID:`, ticket.id, typeof ticket.id)
        })

        setTickets(data)
        console.log(`Successfully loaded ${data.length} tickets`)
      } else {
        console.error("API returned non-array data:", data)
        setError("Invalid data format received from server")
        setTickets([])
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tickets"
      setError(errorMessage)
      setTickets([])
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTicket = async (ticketId: number, ticketNumber: string) => {
    console.log("handleDeleteTicket called with:", { ticketId, ticketNumber, type: typeof ticketId })

    // Validate the ticket ID
    if (!ticketId || ticketId === undefined || ticketId === null) {
      console.error("Invalid ticket ID - is undefined/null:", ticketId)
      toast.error("Invalid ticket ID. Cannot delete ticket.")
      return
    }

    if (typeof ticketId !== "number" || isNaN(ticketId)) {
      console.error("Invalid ticket ID - not a number:", ticketId, typeof ticketId)
      toast.error("Invalid ticket ID format. Cannot delete ticket.")
      return
    }

    setIsDeleting(ticketId)

    try {
      const deleteUrl = `/api/admin/tickets?id=${ticketId}`
      console.log("Making DELETE request to:", deleteUrl)

      const res = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Delete response status:", res.status)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        console.error("Delete failed:", errorData)
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to delete ticket`)
      }

      const result = await res.json()
      console.log("Delete success:", result)

      // Remove the ticket from the local state
      setTickets((prevTickets) => prevTickets.filter((ticket) => ticket.id !== ticketId))
      toast.success("Ticket deleted successfully")
    } catch (error) {
      console.error("Delete operation failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete ticket"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(null)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Manage Tickets</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-8 bg-[rgba(219,234,254,0.3)]">
          <div className="mb-4">
            <p className="text-gray-600">Generate tickets for passengers</p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <CreateTicketModal />
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 bg-transparent"
                onClick={fetchTickets}
                disabled={loading}
                title="Refresh tickets"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 bg-transparent">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 bg-transparent">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tickets Table */}
          <Card className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl border-0">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Loading tickets...</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <h3 className="text-red-800 font-semibold mb-2">Error Loading Tickets</h3>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                    <Button onClick={fetchTickets} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="p-8 text-center">
                    <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No tickets found</p>
                    <p className="text-gray-400 text-sm mt-2">Create your first ticket to get started</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">ID</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Ticket Number</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Passenger</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Contact Number</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Route</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Date</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Time</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Seat</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Payment</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => {
                        // Debug each ticket as it's rendered
                        console.log("Rendering ticket:", ticket.id, ticket.ticketNumber)

                        return (
                          <tr
                            key={ticket.id || ticket.ticketNumber}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="py-4 px-4 text-gray-900 font-mono text-sm">{ticket.id || "MISSING"}</td>
                            <td className="py-4 px-4 text-gray-900">{ticket.ticketNumber}</td>
                            <td className="py-4 px-4 text-gray-900">{ticket.passenger}</td>
                            <td className="py-4 px-4 text-gray-900">{ticket.contactNumber}</td>
                            <td className="py-4 px-4 text-gray-900">{ticket.route}</td>
                            <td className="py-4 px-4 text-gray-900">{ticket.date}</td>
                            <td className="py-4 px-4 text-gray-900">{ticket.time}</td>
                            <td className="py-4 px-4 text-gray-900">{ticket.seat}</td>
                            <td className="py-4 px-4">
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{ticket.payment}</Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                  title="Edit ticket"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:bg-red-50"
                                      disabled={isDeleting === ticket.id || !ticket.id}
                                      title={!ticket.id ? "Missing ticket ID" : "Delete ticket"}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this ticket? This action cannot be undone.
                                        <br />
                                        <br />
                                        <strong>Ticket Details:</strong>
                                        <br />
                                        ID: {ticket.id || "MISSING"}
                                        <br />
                                        Ticket Number: {ticket.ticketNumber}
                                        <br />
                                        Passenger: {ticket.passenger}
                                        <br />
                                        Route: {ticket.route}
                                        <br />
                                        Date: {ticket.date}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          console.log(
                                            "Delete button clicked for ticket:",
                                            ticket.id,
                                            ticket.ticketNumber,
                                          )
                                          handleDeleteTicket(ticket.id, ticket.ticketNumber)
                                        }}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={isDeleting === ticket.id || !ticket.id}
                                      >
                                        {isDeleting === ticket.id ? "Deleting..." : "Delete"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
