"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock, Bus } from "lucide-react";

interface Trip {
  id: number;
  tripNumber: string;
  route: string;
  availableSeats: number;
  tripDate: string;
  status: "SCHEDULED" | "BOARDING" | "DEPARTED" | "COMPLETED" | "CANCELLED";
  arrivalTime?: string;
  driverName?: string;
}

export default function TripLists() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return {
          text: "Ready to Board",
          color: "text-green-600",
          bgColor: "bg-green-100",
        };
      case "BOARDING":
        return {
          text: "Now Boarding",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        };
      default:
        return { text: status, color: "text-gray-600", bgColor: "bg-gray-100" };
    }
  };

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/passenger/trips");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch trips");

      console.log("Fetched trips from API:", data);

      // No need for client-side filtering anymore - API handles it
      setTrips(data);
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();

    // Refresh trips every 30 seconds to get real-time updates
    const interval = setInterval(fetchTrips, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectSeat = (tripId: number) => {
    router.push(`/passenger/seat-selection?tripId=${tripId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-blue-100 px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-700">Find Your Ride</h1>
        <p className="text-sm text-gray-700 mt-1">Available trips for today</p>
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(new Date().toISOString())}</span>
        </div>
      </div>

      <div className="space-y-4 max-w-xs mx-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">
              Loading today&#39;s trips...
            </p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm font-medium">
              No trips available today
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Check back tomorrow for new trips
            </p>
          </div>
        ) : (
          trips.map((trip) => {
            const statusInfo = getStatusInfo(trip.status);
            return (
              <Card
                key={trip.id}
                className="bg-white shadow-gray-400 rounded-2xl border-0 overflow-hidden p-0"
              >
                <CardContent className="p-0">
                  <div className="p-4">
                    {/* Trip Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
                          <Bus className="w-3.5 h-3.5" />
                          <span>{trip.tripNumber}</span>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900">
                          {trip.route}
                        </h2>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-lg ${statusInfo.bgColor}`}
                      >
                        <span
                          className={`text-xs font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          Available Seats:{" "}
                          <span className="font-bold text-gray-800">
                            {trip.availableSeats}
                          </span>
                        </span>
                      </div>

                      {trip.arrivalTime && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>Estimated: {trip.arrivalTime}</span>
                        </div>
                      )}

                      {trip.driverName && (
                        <div className="text-xs text-gray-600">
                          <span>Driver: {trip.driverName}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleSelectSeat(trip.id)}
                      disabled={trip.availableSeats === 0}
                      className="w-full bg-cyan-800 hover:bg-cyan-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white h-9 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                      {trip.availableSeats === 0
                        ? "Fully Booked"
                        : "Select a seat"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-400">
          Updates automatically every 30 seconds
        </p>
      </div>
    </div>
  );
}
