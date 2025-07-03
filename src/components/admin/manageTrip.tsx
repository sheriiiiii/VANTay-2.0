"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  Users,
} from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import { Separator } from "@/components/ui/separator";
import CreateTripModal from "@/components/modals/createTrip";

interface Trip {
  id: number;
  tripDate: string;
  availableSeats: number;
  driverName?: string;
  driverPhone?: string;
  van: {
    plateNumber: string;
  };
  route: {
    name: string;
  };
}

export default function ManageTrip() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const res = await fetch("/api/admin/trips");
      if (!res.ok) throw new Error("Failed to fetch trips");
      const data = await res.json();
      setTrips(data);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

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
                            <div className="flex items-center space-x-2 text-gray-900">
                              <Users className="h-4 w-4" />
                              <span>{trip.availableSeats}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-900">{trip.driverName || "-"}</td>
                          <td className="py-4 px-6 text-gray-900">{trip.driverPhone || "-"}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
      </SidebarInset>
    </SidebarProvider>
  );
}
