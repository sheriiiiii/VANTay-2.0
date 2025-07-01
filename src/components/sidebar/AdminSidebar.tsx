"use client";

import { Home, Bus, Plus, Ticket, Users, User, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils"; 

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const navigationItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Manage Van", href: "/admin/manage-van", icon: Bus },
    { name: "Create Trip", href: "/admin/manage-trip", icon: Plus },
    { name: "Manage Tickets", href: "/admin/manage-ticket", icon: Ticket },
    { name: "Manage Seat", href: "/admin/manage-seat", icon: Users },
  ];

  const toggleAccountDropdown = () => {
    setIsAccountOpen((prev) => !prev);
  };

  return (
    <Sidebar className="border-r border-gray-100 bg-white shadow-xl z-30">
      {/* HEADER */}
      <SidebarHeader className="border-b border-gray-200">
        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              VANTAY
            </div>
            <div className="font-semibold text-gray-900">Welcome Admin</div>
          </div>
        </div>
      </SidebarHeader>

      {/* NAVIGATION */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-gray-500 uppercase tracking-wide">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600",
                        isActive && "bg-blue-100 text-blue-600 font-medium"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER WITH ACCOUNT DROPDOWN */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              onClick={toggleAccountDropdown}
              className="cursor-pointer flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2 px-3 py-2 w-full hover:bg-gray-100 transition-colors">
                <User className="h-5 w-5" />
                <span>Admin Account</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Dropdown options */}
          {isAccountOpen && (
            <div className="ml-8 mt-1 space-y-1">
              <Link
                href="/admin/profile"
                className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition"
              >
                Profile
              </Link>
              <button
                className="flex items-center gap-2 px-2 py-1 text-sm text-red-600 hover:bg-gray-100 rounded transition w-full"
                onClick={() => {
                  // Replace with real logout logic
                  console.log("Logging out...");
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
