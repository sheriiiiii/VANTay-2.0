"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Info } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import { Separator } from "@/components/ui/separator";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Vans",
      value: "24",
      subtitle: "Active Vehicles",
    },
    {
      title: "Today's Trip",
      value: "24",
      subtitle: "Scheduled departures",
      highlight: "24 completed",
      highlightColor: "text-green-500",
    },
    {
      title: "Tickets Sold",
      value: "100",
      subtitle: "This month",
      highlight: "15% from last month",
      highlightColor: "text-green-500",
    },
  ];

  const recentActivities = [
    {
      title: "New van added",
      description: "Van ABC-123 added to Route 1",
      time: "2 hours ago",
    },
    {
      title: "Trip completed",
      description: "Route 2 - 14:30 departure",
      time: "2 hours ago",
    },
    {
      title: "Ticket Generated",
      description: "Ticket #TK001234 sold",
      time: "2 hours ago",
    },
    {
      title: "Seat cancelled",
      description: "Seat A1 cancelled for Trip #TR567",
      time: "2 hours ago",
    },
  ];

  const quickActions = [
    "Add New Van",
    "Schedule Trip",
    "View Today's Ticket",
    "Manage Seat Selection",
  ];

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Van dashboard
            </h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-8 bg-[rgba(219,234,254,0.3)]">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-white shadow-xl hover:shadow-2xl rounded-xl transition-all duration-300 hover:scale-[1.01] border-0"
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {stat.title}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {stat.subtitle}
                  </div>
                  {stat.highlight && (
                    <div
                      className={`text-sm font-medium ${stat.highlightColor}`}
                    >
                      {stat.highlight}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="bg-white shadow-xl hover:shadow-2xl rounded-xl transition-all duration-300 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Recent Activity
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Latest Action in the system
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-25 transition-colors duration-200 rounded-lg px-2 -mx-2"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Info className="h-3 w-3 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {activity.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {activity.description}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white shadow-xl hover:shadow-2xl rounded-xl transition-all duration-300 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Quick Actions
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Common administrative tasks
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm h-12 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                  >
                    {action}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
