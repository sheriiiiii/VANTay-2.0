"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Home,
  Info,
  Truck,
  CheckCircle,
  Ticket,
  XCircle,
  Plus,
  Calendar,
  Eye,
  Settings,
  RefreshCw,
} from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time?: Date;
  timeAgo: string;
  icon: string;
}

interface Stats {
  title: string;
  value: string;
  subtitle: string;
  highlight?: string;
  highlightColor?: string;
}

interface StatsData {
  totalVans: number;
  activeVans: number;
  todayTripCount: number;
  completedTripsCount: number;
  ticketsSold: number;
  pendingTickets: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats[]>([
    { title: "Total Vans", value: "-", subtitle: "Active Vehicles" },
    {
      title: "Today's Trips",
      value: "-",
      subtitle: "Scheduled departures",
      highlight: "-",
      highlightColor: "text-green-500",
    },
    {
      title: "Tickets Sold",
      value: "-",
      subtitle: "This month",
      highlight: "-",
      highlightColor: "text-green-500",
    },
  ]);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");

      const data: StatsData = await res.json();

      setStats([
        {
          title: "Total Vans",
          value: data.totalVans.toString(),
          subtitle: "Registered Vehicles",
          highlight: `${data.activeVans} active vehicles`,
          highlightColor: "text-green-500",
        },
        {
          title: "Today's Trips",
          value: data.todayTripCount.toString(),
          subtitle: "Scheduled departures",
          highlight: `${data.completedTripsCount} trips completed`,
          highlightColor: "text-green-500",
        },
        {
          title: "Tickets Sold",
          value: data.ticketsSold.toString(),
          subtitle: "This month",
          highlight: `${data.pendingTickets} pending tickets`,
          highlightColor: "text-yellow-600",
        },
      ]);
    } catch (err) {
      console.error("Failed to load stats:", err);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const res = await fetch("/api/admin/activities");
      if (!res.ok) throw new Error("Failed to fetch activities");

      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error("Failed to load activities:", err);
      toast.error("Failed to load recent activities");
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchActivities();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchActivities();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case "truck":
        return <Truck className="h-3 w-3 text-blue-600" />;
      case "check-circle":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "ticket":
        return <Ticket className="h-3 w-3 text-purple-600" />;
      case "x-circle":
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Info className="h-3 w-3 text-blue-600" />;
    }
  };

  const getActivityBgColor = (iconType: string, isPlaceholder = false) => {
    if (isPlaceholder) {
      return "bg-gray-100";
    }

    switch (iconType) {
      case "truck":
        return "bg-blue-100";
      case "check-circle":
        return "bg-green-100";
      case "ticket":
        return "bg-purple-100";
      case "x-circle":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const getPlaceholderIcon = (iconType: string) => {
    switch (iconType) {
      case "truck":
        return <Truck className="h-3 w-3 text-gray-400" />;
      case "check-circle":
        return <CheckCircle className="h-3 w-3 text-gray-400" />;
      case "ticket":
        return <Ticket className="h-3 w-3 text-gray-400" />;
      case "x-circle":
        return <XCircle className="h-3 w-3 text-gray-400" />;
      default:
        return <Info className="h-3 w-3 text-gray-400" />;
    }
  };

  const quickActions = [
    {
      title: "Add New Van",
      icon: <Plus className="h-4 w-4" />,
      action: () => router.push("/admin/dashboard/manage-van"),
      description: "Register a new vehicle",
    },
    {
      title: "Schedule Trip",
      icon: <Calendar className="h-4 w-4" />,
      action: () => router.push("/admin/dashboard/manage-trip"),
      description: "Create new trip schedule",
    },
    {
      title: "View Today's Tickets",
      icon: <Eye className="h-4 w-4" />,
      action: () => router.push("/admin/dashboard/manage-ticket"),
      description: "Manage passenger tickets",
    },
    {
      title: "System Settings",
      icon: <Settings className="h-4 w-4" />,
      action: () => toast.info("Settings page coming soon!"),
      description: "Configure system preferences",
    },
  ];

  const handleRefresh = () => {
    fetchStats();
    fetchActivities();
    toast.success("Dashboard refreshed!");
  };

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-r bg-white px-4 py-10 shadow-xl z-50">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-black" />
              <h1 className="text-[16px] font-semibold text-black">
                Dashboard
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loadingStats || loadingActivities}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  loadingStats || loadingActivities ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
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
                    {loadingStats ? (
                      <div className="animate-pulse bg-gray-200 h-10 w-16 rounded"></div>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {stat.subtitle}
                  </div>
                  {stat.highlight && (
                    <div
                      className={`text-sm font-medium ${stat.highlightColor}`}
                    >
                      {loadingStats ? (
                        <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                      ) : (
                        stat.highlight
                      )}
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
                  Latest actions in the system (4 categories)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingActivities
                  ? // Loading skeleton - exactly 4 items
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 py-4"
                      >
                        <div className="animate-pulse bg-gray-200 w-6 h-6 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
                          <div className="animate-pulse bg-gray-200 h-3 w-1/2 rounded"></div>
                        </div>
                        <div className="animate-pulse bg-gray-200 h-3 w-16 rounded"></div>
                      </div>
                    ))
                  : // Always show exactly 4 activities (real or placeholder)
                    activities.map((activity) => {
                      const isPlaceholder = activity.type === "placeholder";
                      return (
                        <div
                          key={activity.id}
                          className={`flex items-start space-x-3 py-4 border-b border-gray-50 last:border-b-0 transition-colors duration-200 rounded-lg px-2 -mx-2 ${
                            isPlaceholder ? "opacity-60" : "hover:bg-gray-25"
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={`w-6 h-6 ${getActivityBgColor(
                                activity.icon,
                                isPlaceholder
                              )} rounded-full flex items-center justify-center`}
                            >
                              {isPlaceholder
                                ? getPlaceholderIcon(activity.icon)
                                : getActivityIcon(activity.icon)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`font-medium ${
                                isPlaceholder
                                  ? "text-gray-500"
                                  : "text-gray-900"
                              }`}
                            >
                              {activity.title}
                            </div>
                            <div
                              className={`text-sm ${
                                isPlaceholder
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {activity.description}
                            </div>
                          </div>
                          <div
                            className={`text-sm ${
                              isPlaceholder ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {activity.timeAgo}
                          </div>
                        </div>
                      );
                    })}
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
                    className="w-full justify-start text-left font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm h-auto p-4 transition-all duration-200 border border-gray-100 hover:border-gray-200"
                    onClick={action.action}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="flex-shrink-0">{action.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-gray-500 font-normal">
                          {action.description}
                        </div>
                      </div>
                    </div>
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
