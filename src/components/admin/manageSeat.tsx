//VANTay-2.0\src\components\admin\manageSeat.tsx

"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Home,
  ArrowLeft,
  Loader2,
  User,
  MapPin,
  Calendar,
  Download,
  Filter,
  CalendarDays,
} from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

interface Trip {
  id: number;
  route: string;
  tripDate: string;
  arrivalTime: string;
  driverName: string;
  van: {
    plateNumber: string;
    capacity: number;
  };
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  tickets: Array<{
    id: number;
    seatNumber: string;
    passengerName: string;
    paymentStatus: string;
    ticketStatus: string;
  }>;
}

interface Seat {
  id: number;
  seatNumber: string;
  status: "available" | "occupied" | "pending";
  ticket: {
    id: number;
    seatNumber: string;
    passengerName: string;
    paymentStatus: string;
    ticketStatus: string;
  } | null;
}

interface SeatData {
  tripId: number;
  seats: Seat[];
  tripDetails: {
    route: string;
    driverName: string;
    arrivalTime: string;
    tripDate: string;
  };
  stats: {
    totalSeats: number;
    availableSeats: number;
    occupiedSeats: number;
    pendingSeats: number;
  };
}

interface PassengerData {
  name: string;
  address: string;
  age: string;
  contactNumber: string;
  emergencyContact: string;
  classification: string;
  paymentMethod: string;
}

type ViewState = "trips" | "seats" | "passenger-info" | "payment" | "receipt";
type DateFilter = "today" | "tomorrow" | "custom" | "all";

export default function ManageSeat() {
  const [currentView, setCurrentView] = useState<ViewState>("trips");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [seatData, setSeatData] = useState<SeatData | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Date filtering states
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [customDate, setCustomDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  interface CreatedTicket {
    ticketNumber: string;
    seat: {
      seatNumber: string;
    };
    trip: {
      route: string;
      tripDate: string;
      arrivalTime: string;
    };
    passenger: {
      name: string;
    };
    totalFare: number;
    qrCodeUrl?: string;
  }

  const [createdTicket, setCreatedTicket] = useState<CreatedTicket | null>(
    null
  );
  const [passengerData, setPassengerData] = useState<PassengerData>({
    name: "",
    address: "",
    age: "",
    contactNumber: "",
    emergencyContact: "",
    classification: "Regular",
    paymentMethod: "CASH",
  });

  // Fetch trips on component mount and when date filter changes
  useEffect(() => {
    fetchTrips();
  }, [dateFilter, customDate]);

  const getDateForFilter = (): string | null => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (dateFilter) {
      case "today":
        return today.toISOString().split("T")[0]; // Always send today's date
      case "tomorrow":
        return tomorrow.toISOString().split("T")[0];
      case "custom":
        return customDate || null;
      case "all":
        return null; // No date parameter = all trips
      default:
        return today.toISOString().split("T")[0]; // Default to today
    }
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const filterDate = getDateForFilter();
      const url = filterDate
        ? `/api/admin/seats/trips?date=${filterDate}`
        : `/api/admin/seats/trips`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch trips");
      const data = await response.json();
      setTrips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeatData = async (tripId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/seats/trips/${tripId}/seats`);
      if (!response.ok) throw new Error("Failed to fetch seat data");
      const data = await response.json();
      setSeatData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load seat data");
    } finally {
      setLoading(false);
    }
  };

  const handleTripSelect = async (trip: Trip) => {
    setSelectedTrip(trip);
    await fetchSeatData(trip.id);
    setCurrentView("seats");
  };

  const handleSeatSelect = (seat: Seat) => {
    if (seat.status === "available") {
      setSelectedSeat(seat);
      setCurrentView("passenger-info");
    }
  };

  const handlePassengerSubmit = () => {
    if (isFormValid()) {
      setCurrentView("payment");
    }
  };

  const handlePaymentConfirm = async () => {
    if (!selectedTrip || !selectedSeat) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/seats/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripId: selectedTrip.id,
          seatId: selectedSeat.id,
          passengerName: passengerData.name,
          passengerAddress: passengerData.address,
          passengerAge: Number(passengerData.age),
          passengerPhone: passengerData.contactNumber,
          passengerEmergencyContact:
            passengerData.emergencyContact || passengerData.contactNumber,
          passengerType: passengerData.classification
            .toUpperCase()
            .replace(" ", "_"),
          paymentMethod: passengerData.paymentMethod,
          paymentStatus: "PAID",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create ticket");
      }

      const data = await response.json();
      setCreatedTicket(data.ticket);
      setCurrentView("receipt");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (!createdTicket) return;

    // Create a canvas to generate the ticket image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = 400;
      canvas.height = 700;

      // Fill background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add watermark background text
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.font = "bold 60px Arial";
      ctx.textAlign = "center";
      ctx.fillText("RidA", canvas.width / 2, canvas.height / 2 - 50);

      // Add main content
      ctx.fillStyle = "#000000";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("RidA", canvas.width / 2, 80);

      // Large seat number
      ctx.font = "bold 80px Arial";
      ctx.fillText(createdTicket.seat.seatNumber, canvas.width / 2, 200);

      // Trip information
      ctx.font = "bold 18px Arial";
      ctx.fillText(createdTicket.ticketNumber, canvas.width / 2, 280);
      ctx.font = "16px Arial";
      ctx.fillText(createdTicket.trip.route, canvas.width / 2, 310);

      // Payment status
      ctx.font = "14px Arial";
      ctx.fillStyle = "#16a34a";
      ctx.fillText("PAID", canvas.width / 2, 370);

      // Load and draw QR code
      const qrImage = new window.Image();
      qrImage.crossOrigin = "anonymous";
      qrImage.onload = () => {
        // Draw QR code
        const qrSize = 120;
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = 400;
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

        ctx.fillText(
          `Total: ₱${createdTicket.totalFare.toFixed(2)}`,
          canvas.width / 2,
          570
        );

        // Convert to blob and download after QR code is drawn
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `rida-ticket-${createdTicket.ticketNumber}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        });
      };

      qrImage.onerror = () => {
        // If QR code fails to load, still generate the ticket without it
        console.warn(
          "QR code failed to load, generating ticket without QR code"
        );
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `rida-ticket-${createdTicket.ticketNumber}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        });
      };

      qrImage.src =
        createdTicket.qrCodeUrl || "/placeholder.svg?height=120&width=120";
    }
  };

  const handleInputChange = (field: keyof PassengerData, value: string) => {
    setPassengerData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = () => {
    const requiredFields = [
      "name",
      "address",
      "age",
      "contactNumber",
      "classification",
    ];
    return requiredFields.every(
      (field) => passengerData[field as keyof PassengerData].trim() !== ""
    );
  };

  const calculateTotalFare = () => {
    const regularFare = 200.0;
    const transactionFee = 10.0;
    let discount = 0.0;
    let totalFare = regularFare + transactionFee;

    if (
      ["Student", "PWD", "Senior Citizen"].includes(
        passengerData.classification
      )
    ) {
      discount = 40.0;
      totalFare = 160.0 + transactionFee;
    }

    return { regularFare, discount, totalFare };
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeat?.id === seat.id) return "bg-blue-500 text-white";
    switch (seat.status) {
      case "available":
        return "bg-green-500 text-white hover:bg-green-600";
      case "occupied":
        return "bg-red-500 text-white";
      case "pending":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const resetFlow = () => {
    setCurrentView("trips");
    setSelectedTrip(null);
    setSeatData(null);
    setSelectedSeat(null);
    setCreatedTicket(null);
    setPassengerData({
      name: "",
      address: "",
      age: "",
      contactNumber: "",
      emergencyContact: "",
      classification: "Regular",
      paymentMethod: "CASH",
    });
    setError(null);
  };

  const getFilterDisplayText = () => {
    switch (dateFilter) {
      case "today":
        return "Today's Trips";
      case "tomorrow":
        return "Tomorrow's Trips";
      case "custom":
        return customDate
          ? `Trips for ${new Date(customDate).toLocaleDateString()}`
          : "Custom Date";
      case "all":
        return "All Trips";
      default:
        return "Today's Trips";
    }
  };

  if (loading && currentView === "trips") {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading trips...</span>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-r bg-white px-4 py-10 shadow-xl z-50">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-black" />
            <h1 className="text-[16px] font-semibold text-black">
              Manage Seat Selection
            </h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-8 bg-[rgba(219,234,254,0.3)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Trip Selection View */}
          {currentView === "trips" && (
            <div className="space-y-6">
              {/* Header and Filter Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-black mb-2">
                    Select a Trip
                  </h2>
                  <p className="text-gray-800">{getFilterDisplayText()}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter Trips</span>
                </Button>
              </div>

              {/* Date Filter Controls */}
              {showFilters && (
                <Card className="bg-white shadow-md border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Filter by Date
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <Button
                        variant={dateFilter === "today" ? "default" : "outline"}
                        onClick={() => setDateFilter("today")}
                        className="flex items-center space-x-2"
                      >
                        <CalendarDays className="h-4 w-4" />
                        <span>Today</span>
                      </Button>
                      <Button
                        variant={
                          dateFilter === "tomorrow" ? "default" : "outline"
                        }
                        onClick={() => setDateFilter("tomorrow")}
                        className="flex items-center space-x-2"
                      >
                        <CalendarDays className="h-4 w-4" />
                        <span>Tomorrow</span>
                      </Button>
                      <Button
                        variant={dateFilter === "all" ? "default" : "outline"}
                        onClick={() => setDateFilter("all")}
                        className="flex items-center space-x-2"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>All Trips</span>
                      </Button>
                      <Button
                        variant={
                          dateFilter === "custom" ? "default" : "outline"
                        }
                        onClick={() => setDateFilter("custom")}
                        className="flex items-center space-x-2"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Custom Date</span>
                      </Button>
                    </div>
                    {dateFilter === "custom" && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="customDate"
                          className="text-gray-700 font-medium"
                        >
                          Select Date
                        </Label>
                        <Input
                          id="customDate"
                          type="date"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          className="bg-gray-50 border-gray-200 max-w-xs"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Trips Grid */}
              {trips.length === 0 ? (
                <Card className="bg-white shadow-md border-0">
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Trips Found
                    </h3>
                    <p className="text-gray-600">
                      {dateFilter === "today"
                        ? "No trips scheduled for today."
                        : dateFilter === "tomorrow"
                        ? "No trips scheduled for tomorrow."
                        : dateFilter === "custom" && customDate
                        ? `No trips found for ${new Date(
                            customDate
                          ).toLocaleDateString()}.`
                        : "No trips found for the selected criteria."}
                    </p>
                    {dateFilter !== "all" && (
                      <Button
                        variant="outline"
                        onClick={() => setDateFilter("all")}
                        className="mt-4"
                      >
                        View All Trips
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                  {trips.map((trip) => (
                    <Card
                      key={trip.id}
                      className="bg-gradient-to-br from-white to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl hover:ring-2 hover:ring-blue-500 transform hover:scale-105 transition-all duration-300 ease-out cursor-pointer"
                      onClick={() => handleTripSelect(trip)}
                    >
                      <CardContent className="p-4 text-black flex flex-col gap-3 h-full">
                        <div className="space-y-1">
                          <h3 className="text-base font-bold">{trip.route}</h3>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-blue-600" />
                              <span className="font-medium">
                                Van: {trip.van.plateNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-green-600" />
                              <span className="font-medium">
                                {new Date(trip.tripDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs font-medium mt-auto">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-green-600">
                              Available: {trip.availableSeats}
                            </span>
                            <span className="text-red-600">
                              Occupied: {trip.occupiedSeats}
                            </span>
                            <span>Total: {trip.totalSeats}</span>
                          </div>
                          {trip.driverName && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-indigo-600" />
                              <span>Driver: {trip.driverName}</span>
                            </div>
                          )}
                          <div className="text-right text-[10px] text-gray-500 italic">
                            Click to manage seats
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Seat Selection View */}
          {currentView === "seats" && seatData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Left side: Route and Driver */}
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Route Box */}
                  <div className="inline-flex items-center bg-blue-50 border border-blue-400 px-4 py-2 shadow-sm">
                    <span className="text-sm font-medium text-blue-800">
                      Route:
                    </span>
                    <span className="ml-2 text-sm text-gray-900 font-semibold">
                      {seatData.tripDetails.route}
                    </span>
                  </div>

                  {/* Driver Box */}
                  <div className="inline-flex items-center bg-blue-50 border border-blue-400 px-4 py-2 shadow-sm">
                    <span className="text-sm font-medium text-blue-800">
                      Driver:
                    </span>
                    <span className="ml-2 text-sm text-gray-900 font-semibold">
                      {seatData.tripDetails.driverName}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      • {seatData.tripDetails.arrivalTime}
                    </span>
                  </div>
                </div>

                {/* Right side: Back Button */}
                <Button
                  variant="outline"
                  onClick={resetFlow}
                  className="flex items-center space-x-2 border border-blue-400 text-blue-800 hover:bg-blue-100 transition rounded px-4 py-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Trips</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Seats */}
                <Card className="bg-white shadow-lg hover:shadow-xl rounded-xl transition-all duration-300">
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold text-gray-700 mb-3">
                      Total Seats
                    </h3>
                    <div className="text-4xl font-extrabold text-gray-900 mb-3">
                      {seatData.stats.totalSeats}
                    </div>
                    <p className="text-xs font-semibold text-blue-400">
                      Total number of seats in this trip
                    </p>
                  </CardContent>
                </Card>

                {/* Available */}
                <Card className="bg-white shadow-lg hover:shadow-xl rounded-xl transition-all duration-300">
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold text-green-700 mb-3">
                      Available
                    </h3>
                    <div className="text-4xl font-extrabold text-green-800 mb-3">
                      {seatData.stats.availableSeats}
                    </div>
                    <p className="text-xs font-semibold text-green-400">
                      Seats ready to be booked
                    </p>
                  </CardContent>
                </Card>

                {/* Occupied */}
                <Card className="bg-white shadow-lg hover:shadow-xl rounded-xl transition-all duration-300">
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold text-red-700 mb-3">
                      Occupied
                    </h3>
                    <div className="text-4xl font-extrabold text-red-800 mb-3">
                      {seatData.stats.occupiedSeats}
                    </div>
                    <p className="text-xs font-semibold text-red-400">
                      Seats already booked
                    </p>
                  </CardContent>
                </Card>

                {/* Pending */}
                <Card className="bg-white shadow-lg hover:shadow-xl rounded-xl transition-all duration-300">
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold text-orange-700 mb-3">
                      Pending
                    </h3>
                    <div className="text-4xl font-extrabold text-orange-800 mb-3">
                      {seatData.stats.pendingSeats}
                    </div>
                    <p className="text-xs font-semibold text-orange-400">
                      Seats awaiting confirmation
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Legend Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-black text-xl mt-10">
                  Passenger seats!
                </h3>

                <div className="flex items-center space-x-8 mt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Available</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Occupied</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Selected</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Pending</span>
                  </div>
                </div>
              </div>

              {/* Van Seat Layout */}
              <Card className="bg-gradient-to-br from-white to-blue-100 shadow-lg border border-blue-300 p-8 max-w-3xl mx-auto rounded-xl">
                <CardContent className="p-0">
                  {/* Van Seat Layout */}
                  {currentView === "seats" && seatData && (
                    <div className="flex justify-center">
                      <div className="relative  rounded-2xl p-8 w-full max-w-2xl">
                        {/* Driver Section */}
                        <div className="flex justify-between items-center mb-8">
                          <div className="flex space-x-4">
                            {seatData.seats
                              .filter((seat) =>
                                ["11", "08", "05", "02"].includes(
                                  seat.seatNumber
                                )
                              )
                              .sort(
                                (a, b) =>
                                  ["11", "08", "05", "02"].indexOf(
                                    a.seatNumber
                                  ) -
                                  ["11", "08", "05", "02"].indexOf(b.seatNumber)
                              )
                              .map((seat) => (
                                <button
                                  key={seat.id}
                                  onClick={() => handleSeatSelect(seat)}
                                  disabled={seat.status !== "available"}
                                  className={`w-16 h-12 rounded-lg font-semibold
                  ${getSeatColor(seat)} 
                  shadow-md
                  hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                                >
                                  {seat.seatNumber}
                                </button>
                              ))}
                          </div>
                          <div className="bg-gray-200 border border-gray-300 rounded-lg px-6 py-6 text-center font-semibold text-gray-700 shadow-sm select-none">
                            Driver
                          </div>
                        </div>

                        {/* Row 2 */}
                        <div className="flex space-x-4 mb-8">
                          {seatData.seats
                            .filter((seat) =>
                              ["12", "09", "06", "03"].includes(seat.seatNumber)
                            )
                            .sort(
                              (a, b) =>
                                ["12", "09", "06", "03"].indexOf(a.seatNumber) -
                                ["12", "09", "06", "03"].indexOf(b.seatNumber)
                            )
                            .map((seat) => (
                              <button
                                key={seat.id}
                                onClick={() => handleSeatSelect(seat)}
                                disabled={seat.status !== "available"}
                                className={`w-16 h-12 rounded-lg font-semibold
                ${getSeatColor(seat)} 
                shadow-md
                hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                              >
                                {seat.seatNumber}
                              </button>
                            ))}
                        </div>

                        {/* Row 3 */}
                        <div className="flex space-x-4">
                          {seatData.seats
                            .filter((seat) =>
                              ["13", "10", "07", "04", "01"].includes(
                                seat.seatNumber
                              )
                            )
                            .sort(
                              (a, b) =>
                                ["13", "10", "07", "04", "01"].indexOf(
                                  a.seatNumber
                                ) -
                                ["13", "10", "07", "04", "01"].indexOf(
                                  b.seatNumber
                                )
                            )
                            .map((seat) => (
                              <button
                                key={seat.id}
                                onClick={() => handleSeatSelect(seat)}
                                disabled={seat.status !== "available"}
                                className={`w-16 h-12 rounded-lg font-semibold
                ${getSeatColor(seat)} 
                shadow-md
                hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                              >
                                {seat.seatNumber}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentView === "passenger-info" && selectedSeat && (
            <div className="w-full space-y-8 px-8">
              {/* Header Section */}
              <div className="w-full flex items-center justify-between px-6">
                {/* Left-aligned Title */}
                <div className="flex flex-col text-left mt-4 space-y-2">
                  {/* Styled title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-blue-500 w-fit pb-1">
                    Passenger Information
                  </h2>

                  {/* Seat and Route Info */}
                  <div className="flex items-center gap-2 text-sm  px-3 py-1 rounded-md w-fit">
                    <span className="text-red-600 font-semibold">
                      Seat {selectedSeat.seatNumber}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-indigo-700 italic bg-indigo-100 px-2 py-0.5 rounded">
                      {selectedTrip?.route}
                    </span>
                  </div>
                </div>

                {/* Right-aligned Back Button */}
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView("seats")}
                    className="flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Seats</span>
                  </Button>
                </div>
              </div>

              {/* Form Card */}
              <div className="max-w-5xl mx-auto mt-8 px-4">
                <Card className="rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-white shadow-2xl z-50">
                  <CardContent className="p-10 space-y-8">
                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Left Column */}
                      <div className="space-y-6">
                        {/* Full Name */}
                        <div className="space-y-1">
                          <Label
                            htmlFor="name"
                            className="text-gray-800 font-semibold"
                          >
                            Full Name *
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            value={passengerData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            className="rounded-xl bg-white text-black border border-blue-200 px-4 py-3 h-12 shadow-sm focus:ring-2 focus:ring-blue-300"
                            placeholder="Enter passenger's full name"
                          />
                        </div>

                        {/* Address */}
                        <div className="space-y-1">
                          <Label
                            htmlFor="address"
                            className="text-gray-800 font-semibold"
                          >
                            Address *
                          </Label>
                          <Input
                            id="address"
                            type="text"
                            value={passengerData.address}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            className="rounded-xl bg-white text-black border border-blue-300 px-4 py-3 h-12 shadow-sm focus:ring-2 focus:ring-blue-300"
                            placeholder="Enter complete address"
                          />
                        </div>

                        {/* Contact Number */}
                        <div className="space-y-1">
                          <Label
                            htmlFor="contactNumber"
                            className="text-gray-800 font-semibold"
                          >
                            Contact Number *
                          </Label>
                          <Input
                            id="contactNumber"
                            type="tel"
                            value={passengerData.contactNumber}
                            onChange={(e) =>
                              handleInputChange("contactNumber", e.target.value)
                            }
                            className="rounded-xl bg-white text-black border border-blue-300 px-4 py-3 h-12 shadow-sm focus:ring-2 focus:ring-blue-300"
                            placeholder="Enter contact number"
                          />
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        {/* Age */}
                        <div className="space-y-1">
                          <Label
                            htmlFor="age"
                            className="text-gray-800 font-semibold"
                          >
                            Age *
                          </Label>
                          <Input
                            id="age"
                            type="number"
                            value={passengerData.age}
                            onChange={(e) =>
                              handleInputChange("age", e.target.value)
                            }
                            className="rounded-xl bg-white text-black border border-blue-300 px-4 py-3 h-12 shadow-sm focus:ring-2 focus:ring-blue-300"
                            placeholder="Enter age"
                            min="1"
                            max="120"
                          />
                        </div>

                        {/* Emergency Contact */}
                        <div className="space-y-1">
                          <Label
                            htmlFor="emergencyContact"
                            className="text-gray-800 font-semibold"
                          >
                            Emergency Contact
                          </Label>
                          <Input
                            id="emergencyContact"
                            type="tel"
                            value={passengerData.emergencyContact}
                            onChange={(e) =>
                              handleInputChange(
                                "emergencyContact",
                                e.target.value
                              )
                            }
                            className="rounded-xl bg-white text-black border border-blue-300 px-4 py-3 h-12 shadow-sm focus:ring-2 focus:ring-blue-300"
                            placeholder="Emergency contact (optional)"
                          />
                        </div>

                        {/* Classification + Payment */}
                        <div className="flex gap-4">
                          <div className="w-1/2 space-y-3">
                            <Label
                              htmlFor="classification"
                              className="text-gray-800 font-semibold mt-2"
                            >
                              Classification *
                            </Label>
                            <Select
                              value={passengerData.classification}
                              onValueChange={(value) =>
                                handleInputChange("classification", value)
                              }
                            >
                              <SelectTrigger className="rounded-xl bg-white text-black border border-blue-300 px-4 py-3 h-12 shadow-sm focus:ring-2 focus:ring-blue-300">
                                <SelectValue placeholder="Select classification" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Regular">
                                  Regular (₱210)
                                </SelectItem>
                                <SelectItem value="Student">
                                  Student (₱170)
                                </SelectItem>
                                <SelectItem value="PWD">PWD (₱170)</SelectItem>
                                <SelectItem value="Senior Citizen">
                                  Senior Citizen (₱170)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="w-1/2 space-y-3">
                            <Label
                              htmlFor="paymentMethod"
                              className="text-gray-800 font-semibold mt-2"
                            >
                              Payment Method *
                            </Label>
                            <Select
                              value={passengerData.paymentMethod}
                              onValueChange={(value) =>
                                handleInputChange("paymentMethod", value)
                              }
                            >
                              <SelectTrigger className="rounded-xl bg-white text-black border border-blue-300 px-4 py-3 h-12 shadow-sm focus:ring-2 focus:ring-blue-300">
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="GCASH">GCash</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Discount Banner */}
                    {["Student", "PWD", "Senior Citizen"].includes(
                      passengerData.classification
                    ) && (
                      <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 rounded-lg px-6 py-4 text-sm shadow">
                        ** Please verify ID for {passengerData.classification}{" "}
                        discount eligibility.
                      </div>
                    )}

                    {/* Submit */}
                    <div className="text-center pt-4">
                      <Button
                        onClick={handlePassengerSubmit}
                        disabled={!isFormValid()}
                        className="bg-sky-400 hover:bg-sky-600 text-white h-12 w-56 rounded-3xl shadow-md transition-all"
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentView === "payment" && (
            <div className="w-full px-6 py-10 space-y-10">
              {/* Header Section (left-aligned title, right-aligned button) */}
              <div className="w-full flex items-center justify-between">
                {/* Left: Title */}
                <div className="flex flex-col text-left">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-blue-500 w-fit pb-1">
                    Payment Confirmation
                  </h2>
                  <p className="text-sm italic text-gray-600 tracking-wide">
                    Review and confirm the booking details
                  </p>
                </div>

                {/* Right: Button */}
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView("passenger-info")}
                    className="flex items-center space-x-2 border border-gray-300 shadow-sm bg-white hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Info</span>
                  </Button>
                </div>
              </div>

              {/* Cards centered below */}
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                  {/* Booking Summary Card */}

                  <Card className="rounded-xl shadow-2xl ring-1 ring-blue-200 bg-gradient-to-br from-sky-50 via-white to-sky-100">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-black">
                        Booking Summary
                      </h3>

                      <div className="space-y-3 text-sm text-gray-700">
                        {/* Route */}
                        <div className="flex items-center gap-2 pl-3">
                          <span className="text-black min-w-[90px]">
                            Route:
                          </span>
                          <span className="bg-green-100 text-black font-medium text-sm px-3 py-0.5 rounded-full w-fit">
                            {selectedTrip?.route}
                          </span>
                        </div>

                        {/* Seat */}
                        <div className="flex items-center gap-2 pl-3">
                          <span className="text-black min-w-[90px]">Seat:</span>
                          <span className="bg-green-100 text-black font-medium text-sm px-3 py-0.5 rounded-full w-fit">
                            Seat {selectedSeat?.seatNumber}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 pl-3">
                          <span className="text-black min-w-[90px]">Date:</span>
                          <span className="bg-green-100 text-black font-medium text-sm px-3 py-0.5 rounded-full w-fit">
                            {selectedTrip
                              ? new Date(
                                  selectedTrip.tripDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>

                        {/* Passenger */}
                        <div className="flex items-center gap-2 pl-3">
                          <span className="text-black min-w-[90px]">
                            Passenger:
                          </span>
                          <span className="bg-green-100 text-black font-medium text-sm px-3 py-0.5 rounded-full w-fit">
                            {passengerData.name}
                          </span>
                        </div>

                        {/* Classification */}
                        <div className="flex items-center gap-2 pl-3">
                          <span className="text-black min-w-[90px]">
                            Classification:
                          </span>
                          <span className="bg-green-100 text-black font-medium text-sm px-3 py-0.5 rounded-full w-fit">
                            {passengerData.classification}
                          </span>
                        </div>

                        {/* Payment */}
                        <div className="flex items-center gap-2 pl-3">
                          <span className="text-black min-w-[90px]">
                            Payment:
                          </span>
                          <span className="bg-green-100 text-black font-medium text-sm px-3 py-0.5 rounded-full w-fit">
                            {passengerData.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fare Breakdown Card */}
                  <Card className="rounded-xl shadow-2xl ring-1 ring-blue-200 bg-gradient-to-br from-sky-50 via-white to-sky-100">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-black-100">
                        Fare Breakdown
                      </h3>
                      <div className="space-y-3 text-sm font-semibold text-red-700">
                        <div className="flex justify-between">
                          <span>Base Fare:</span>
                          <span>
                            ₱{calculateTotalFare().regularFare.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transaction Fee:</span>
                          <span>₱10.00</span>
                        </div>
                        {calculateTotalFare().discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>
                              Discount ({passengerData.classification}):
                            </span>
                            <span>
                              -₱{calculateTotalFare().discount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-lg font-semibold text-black">
                          <span>Total Amount:</span>
                          <span>
                            ₱{calculateTotalFare().totalFare.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Confirm Button Centered */}
              <div className="text-center pt-6">
                <Button
                  onClick={handlePaymentConfirm}
                  disabled={isSubmitting}
                  className="bg-sky-400 hover:bg-sky-600 text-white px-12 py-6 text-lg font-semibold rounded-3xl shadow-lg shadow-blue-300/40 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Ticket...
                    </>
                  ) : (
                    "Confirm Payment & Generate Ticket"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Receipt/Ticket View */}
          {currentView === "receipt" && createdTicket && (
            <div className="space-y-6 max-w-sm mx-auto">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-green-600 mb-2">
                  E-Ticket Generated!
                </h2>
                <p className="text-gray-600 text-sm">
                  Please proceed to the counter and present this ticket.
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Total: ₱{createdTicket.totalFare.toFixed(2)}
                </p>
                <div className="mt-2">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                    PAID
                  </span>
                </div>
              </div>

              <Card className="bg-white shadow-lg rounded-3xl border-0 overflow-hidden relative">
                <CardContent className="p-8 text-center">
                  {/* Download Button */}
                  <div className="mb-6">
                    <Button
                      onClick={handleDownload}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full px-4 py-2"
                    >
                      <span className="text-sm font-medium mr-2">Download</span>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Background Logo - Watermarked */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="text-6xl font-bold text-gray-300 tracking-wider">
                      RidA
                    </div>
                  </div>

                  {/* Seat Number - Prominent display */}
                  <div className="mb-8 relative z-10">
                    <div className="text-8xl font-bold text-gray-900 mb-2">
                      {createdTicket.seat.seatNumber}
                    </div>
                  </div>

                  {/* Trip Information */}
                  <div className="mb-8 relative z-10">
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      {createdTicket.ticketNumber}
                    </p>
                    <p className="text-gray-700 text-sm mb-1">
                      {createdTicket.trip.route}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center relative z-10 mb-4">
                    <Image
                      src={
                        createdTicket.qrCodeUrl ||
                        "/placeholder.svg?height=120&width=120" ||
                        "/placeholder.svg"
                      }
                      alt="Booking QR Code"
                      width={120}
                      height={120}
                      className="w-30 h-30"
                      crossOrigin="anonymous"
                      unoptimized
                      priority
                    />
                  </div>

                  {/* Status */}
                  <div className="mt-4 relative z-10">
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      PAID
                    </span>
                  </div>

                  {/* Instructions */}
                  <div className="mt-4 relative z-10">
                    <p className="text-xs text-gray-500">
                      Total: ₱{createdTicket.totalFare.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="w-full rounded-2xl h-12 font-medium"
                >
                  Print Ticket
                </Button>
                <Button
                  onClick={resetFlow}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl h-12 font-medium"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Create Another Booking
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
