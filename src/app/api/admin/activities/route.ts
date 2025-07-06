import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const activities = [];

    // Get exactly 1 most recent van added (last 7 days)
    const recentVan = await prisma.van.findFirst({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        route: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (recentVan) {
      activities.push({
        id: `van-${recentVan.id}`,
        type: "van_added",
        title: "New van added",
        description: `Van ${recentVan.plateNumber} added to ${
          recentVan.route?.name || "route"
        }`,
        time: recentVan.createdAt,
        icon: "truck",
      });
    }

    // Get exactly 1 most recent trip completed (last 3 days)
    const recentTrip = await prisma.trip.findFirst({
      where: {
        status: "COMPLETED",
        updatedAt: {
          gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Last 3 days
        },
      },
      include: {
        route: true,
        van: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (recentTrip) {
      activities.push({
        id: `trip-${recentTrip.id}`,
        type: "trip_completed",
        title: "Trip completed",
        description: `${recentTrip.route?.name || "Route"} - ${
          recentTrip.van.plateNumber
        }`,
        time: recentTrip.updatedAt,
        icon: "check-circle",
      });
    }

    // Get exactly 1 most recent ticket sold (last 24 hours)
    const recentTicket = await prisma.ticket.findFirst({
      where: {
        bookedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        trip: {
          include: {
            route: true,
          },
        },
      },
      orderBy: {
        bookedAt: "desc",
      },
    });

    if (recentTicket) {
      activities.push({
        id: `ticket-${recentTicket.id}`,
        type: "ticket_sold",
        title: "Ticket sold",
        description: `Ticket #${recentTicket.ticketNumber} for ${
          recentTicket.trip.route?.name || "route"
        }`,
        time: recentTicket.bookedAt,
        icon: "ticket",
      });
    }

    // Get exactly 1 most recent cancelled ticket (last 24 hours)
    const cancelledTicket = await prisma.ticket.findFirst({
      where: {
        ticketStatus: "CANCELLED",
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        trip: {
          include: {
            route: true,
          },
        },
        seat: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (cancelledTicket) {
      activities.push({
        id: `cancelled-${cancelledTicket.id}`,
        type: "ticket_cancelled",
        title: "Ticket cancelled",
        description: `Seat ${cancelledTicket.seat.seatNumber} cancelled for ${
          cancelledTicket.trip.route?.name || "route"
        }`,
        time: cancelledTicket.updatedAt,
        icon: "x-circle",
      });
    }

    // Sort by time (most recent first) and add time ago
    const sortedActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .map((activity) => ({
        ...activity,
        timeAgo: getTimeAgo(activity.time),
      }));

    // Always return exactly 4 activities, fill with placeholders if needed
    const finalActivities = [];

    // Add actual activities
    sortedActivities.forEach((activity) => finalActivities.push(activity));

    // Fill remaining slots with placeholder messages if we have less than 4
    const placeholderMessages = [
      {
        id: "placeholder-van",
        type: "placeholder",
        title: "No recent van activity",
        description: "No vans added in the last 7 days",
        timeAgo: "-",
        icon: "truck",
      },
      {
        id: "placeholder-trip",
        type: "placeholder",
        title: "No recent trip activity",
        description: "No trips completed in the last 3 days",
        timeAgo: "-",
        icon: "check-circle",
      },
      {
        id: "placeholder-ticket",
        type: "placeholder",
        title: "No recent ticket sales",
        description: "No tickets sold in the last 24 hours",
        timeAgo: "-",
        icon: "ticket",
      },
      {
        id: "placeholder-cancelled",
        type: "placeholder",
        title: "No recent cancellations",
        description: "No tickets cancelled in the last 24 hours",
        timeAgo: "-",
        icon: "x-circle",
      },
    ];

    // Check which activity types we're missing and add placeholders
    const existingTypes = new Set(sortedActivities.map((a) => a.type));
    const typeMapping = {
      van_added: 0,
      trip_completed: 1,
      ticket_sold: 2,
      ticket_cancelled: 3,
    };

    // Add placeholders for missing types
    Object.entries(typeMapping).forEach(([type, index]) => {
      if (!existingTypes.has(type) && finalActivities.length < 4) {
        finalActivities.push(placeholderMessages[index]);
      }
    });

    // Ensure we always have exactly 4 items
    while (finalActivities.length < 4) {
      finalActivities.push(placeholderMessages[finalActivities.length]);
    }

    return NextResponse.json(finalActivities.slice(0, 4));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - new Date(date).getTime()) / 1000
  );

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}
