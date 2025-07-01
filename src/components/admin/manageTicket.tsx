"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Filter, ArrowUpDown, Edit, Trash2 } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import { Separator } from "@/components/ui/separator";
import CreateTicketModal from "@/components/modals/createTicket";

export default function ManageTickets() {
  const tickets = [
    {
      ticketNumber: "TK08",
      passenger: "Lowes Alonsagay",
      contactNumber: "09996499999",
      route: "Iloilo - Antique",
      date: "7/14/2025",
      time: "08:00 AM",
      seat: "SN15",
      price: "$200",
      payment: "Paid",
    },
  ];

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Manage Tickets
            </h1>
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
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 bg-transparent"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tickets Table */}
          <Card className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl border-0">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Ticket Number
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Passenger
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Contact Number
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Route
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Time
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Seat
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Price
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Payment
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="py-4 px-4 text-gray-900">
                          {ticket.ticketNumber}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {ticket.passenger}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {ticket.contactNumber}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {ticket.route}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {ticket.date}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {ticket.time}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {ticket.seat}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {ticket.price}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            {ticket.payment}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
