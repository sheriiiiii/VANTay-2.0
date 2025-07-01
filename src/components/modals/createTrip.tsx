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

interface CreateTripModalProps {
  trigger?: React.ReactNode;
}

export default function CreateTripModal({ trigger }: CreateTripModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    van: "",
    route: "",
    date: "",
    seats: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating trip:", formData);
    setOpen(false);
    // Reset form
    setFormData({
      van: "",
      route: "",
      date: "",
      seats: "",
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
            Add New Trip
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Create Trip
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="van" className="text-sm font-medium text-gray-700">
              Van
            </Label>
            <Input
              id="van"
              placeholder="ABC-123"
              value={formData.van}
              onChange={(e) => handleInputChange("van", e.target.value)}
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
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
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

          <div className="space-y-2">
            <Label
              htmlFor="seats"
              className="text-sm font-medium text-gray-700"
            >
              Seats
            </Label>
            <Input
              id="seats"
              type="number"
              placeholder="8"
              value={formData.seats}
              onChange={(e) => handleInputChange("seats", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg mt-6"
          >
            Create Trip
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
