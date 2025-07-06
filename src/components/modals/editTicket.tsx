"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit } from "lucide-react"
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
  status: string
}

interface EditTicketModalProps {
  ticket: TicketType
  onTicketUpdated: () => void
}

const PAYMENT_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
]

const TICKET_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "USED", label: "Used" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
]

export default function EditTicketModal({ ticket, onTicketUpdated }: EditTicketModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    passengerName: ticket.passenger || "",
    passengerPhone: ticket.contactNumber || "",
    paymentStatus: ticket.payment || "PENDING",
    ticketStatus: ticket.status || "ACTIVE",
  })

  // Add debugging
  console.log("EditTicketModal rendered with ticket:", ticket)
  console.log("Form data initialized:", formData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with data:", formData) // Add this debug line
    setLoading(true)

    try {
      console.log("Updating ticket:", ticket.id, formData)
      const response = await fetch(`/api/admin/tickets?id=${ticket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update ticket`)
      }

      const result = await response.json()
      console.log("Update success:", result)
      toast.success("Ticket updated successfully")
      setOpen(false)
      onTicketUpdated()
    } catch (error) {
      console.error("Update failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update ticket"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleClose = () => {
    console.log("Modal closing") // Add debug line
    setOpen(false)
    // Reset form data when closing
    setFormData({
      passengerName: ticket.passenger || "",
      passengerPhone: ticket.contactNumber || "",
      paymentStatus: ticket.payment || "PENDING",
      ticketStatus: ticket.status || "ACTIVE",
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    console.log("Modal open state changing to:", newOpen) // Add debug line
    setOpen(newOpen)
    if (!newOpen) {
      handleClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
          title="Edit ticket"
          onClick={() => {
            console.log("Edit button clicked for ticket:", ticket.id) // Add debug line
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Ticket</DialogTitle>
          <DialogDescription>
            Update passenger information, payment status, and ticket status for ticket #{ticket.ticketNumber}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ticketNumber">Ticket Number</Label>
              <Input id="ticketNumber" value={ticket.ticketNumber} disabled className="bg-gray-50" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="route">Route</Label>
              <Input id="route" value={ticket.route} disabled className="bg-gray-50" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="seat">Seat</Label>
              <Input id="seat" value={ticket.seat} disabled className="bg-gray-50" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="passengerName">Passenger Name</Label>
              <Input
                id="passengerName"
                value={formData.passengerName}
                onChange={(e) => handleInputChange("passengerName", e.target.value)}
                placeholder="Enter passenger name"
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="passengerPhone">Contact Number</Label>
              <Input
                id="passengerPhone"
                value={formData.passengerPhone}
                onChange={(e) => handleInputChange("passengerPhone", e.target.value)}
                placeholder="Enter contact number"
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select
                value={formData.paymentStatus}
                onValueChange={(value) => handleInputChange("paymentStatus", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ticketStatus">Ticket Status</Label>
              <Select
                value={formData.ticketStatus}
                onValueChange={(value) => handleInputChange("ticketStatus", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ticket status" />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
