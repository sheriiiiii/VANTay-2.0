"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreateTicketModalProps {
  trigger?: React.ReactNode;
}

export default function CreateTicketModal({ trigger }: CreateTicketModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    ticketNumber: "",
    passenger: "",
    contactNumber: "",
    route: "",
    date: "",
    time: "",
    seat: "",
    price: "",
    payment: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating ticket:", formData);
    setOpen(false);
    // Reset form
    setFormData({
      ticketNumber: "",
      passenger: "",
      contactNumber: "",
      route: "",
      date: "",
      time: "",
      seat: "",
      price: "",
      payment: "",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-full">
            Create Ticket
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Create Ticket
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="ticketNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Ticket Number
                </Label>
                <Input
                  id="ticketNumber"
                  placeholder="TK08"
                  value={formData.ticketNumber}
                  onChange={(e) =>
                    handleInputChange("ticketNumber", e.target.value)
                  }
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="passenger"
                  className="text-sm font-medium text-gray-700"
                >
                  Passenger
                </Label>
                <Input
                  id="passenger"
                  placeholder="Lowes Al"
                  value={formData.passenger}
                  onChange={(e) =>
                    handleInputChange("passenger", e.target.value)
                  }
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="contactNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Contact Number
                </Label>
                <Input
                  id="contactNumber"
                  placeholder="0999999999"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    handleInputChange("contactNumber", e.target.value)
                  }
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="route"
                  className="text-sm font-medium text-gray-700"
                >
                  Route
                </Label>
                <Input
                  id="route"
                  placeholder="Iloilo-Antique"
                  value={formData.route}
                  onChange={(e) => handleInputChange("route", e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="date"
                  className="text-sm font-medium text-gray-700"
                >
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="time"
                  className="text-sm font-medium text-gray-700"
                >
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="seat"
                  className="text-sm font-medium text-gray-700"
                >
                  Seat
                </Label>
                <Input
                  id="seat"
                  placeholder="SN15"
                  value={formData.seat}
                  onChange={(e) => handleInputChange("seat", e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="price"
                  className="text-sm font-medium text-gray-700"
                >
                  Price
                </Label>
                <Input
                  id="price"
                  placeholder="$200"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="payment"
                  className="text-sm font-medium text-gray-700"
                >
                  Payment
                </Label>
                <Input
                  id="payment"
                  placeholder="Paid"
                  value={formData.payment}
                  onChange={(e) => handleInputChange("payment", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg mt-6"
          >
            Create Ticket
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
