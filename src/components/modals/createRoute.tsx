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

interface CreateRouteModalProps {
  trigger?: React.ReactNode;
}

export default function CreateRouteModal({ trigger }: CreateRouteModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    routeName: "",
    origin: "",
    destination: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating route:", formData);
    setOpen(false);
    // Reset form
    setFormData({
      routeName: "",
      origin: "",
      destination: "",
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
            Add New Route
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Create Route
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="routeName"
              className="text-sm font-medium text-gray-700"
            >
              Route Name
            </Label>
            <Input
              id="routeName"
              placeholder="Iloilo - Antique"
              value={formData.routeName}
              onChange={(e) => handleInputChange("routeName", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="origin"
              className="text-sm font-medium text-gray-700"
            >
              Origin
            </Label>
            <Input
              id="origin"
              placeholder="Iloilo City"
              value={formData.origin}
              onChange={(e) => handleInputChange("origin", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="destination"
              className="text-sm font-medium text-gray-700"
            >
              Destination
            </Label>
            <Input
              id="capacity"
              placeholder="15 seats"
              value={formData.destination}
              onChange={(e) => handleInputChange("destination", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="text-sm text-gray-600">
            Please ensure the route name is unique and descriptive.
          </div>

          <Button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg mt-6"
          >
            Create Route
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
