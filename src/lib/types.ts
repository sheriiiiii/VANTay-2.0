import type {
  User,
  Van,
  Route,
  Trip,
  Seat,
  Ticket,
  VanStatus,
  TripStatus,
  PassengerType,
  PaymentMethod,
  PaymentStatus,
  TicketStatus,
} from "@prisma/client"

// Extended types with relations
export interface VanWithRoute {
  id: number
  plateNumber: string
  model: string 
  capacity: number
  route: {
    id: number
    name: string
  } | null
}


export type TripWithRelations = Trip & {
  van: Van & { route: Route }
  route: Route
  tickets?: (Ticket & { seat: Seat })[]
}

export type TicketWithRelations = Ticket & {
  trip: Trip & {
    van: Van & { route: Route }
    route: Route
  }
  seat: Seat
}

export type SeatWithTickets = Seat & {
  tickets: Ticket[]
}

// Dashboard stats interface
export interface DashboardStats {
  totalVans: number
  activeVans: number
  totalRoutes: number
  todayTrips: number
  totalTickets: number
  todayRevenue: number
  pendingPayments: number
}

// Create data interfaces
export interface CreateVanData {
  plateNumber: string
  capacity: number
  model?: string
  routeId: number
}

export interface CreateRouteData {
  name: string
  origin: string
  destination: string
}

export interface CreateTripData {
  vanId: number
  routeId: number
  tripDate: string
  arrivalTime?: string
}

export interface CreateTicketData {
  tripId: number
  seatId: number
  passengerName: string
  passengerAddress: string
  passengerAge: number
  passengerPhone: string
  passengerEmergencyContact: string
  passengerType: PassengerType
  paymentMethod: PaymentMethod
  totalFare: number
  discount?: number
}

// Export Prisma enums
export type { VanStatus, TripStatus, PassengerType, PaymentMethod, PaymentStatus, TicketStatus }

// Export base types
export type { User, Van, Route, Trip, Seat, Ticket }
