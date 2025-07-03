'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface Trip {
  id: number;
  tripNumber: string;
  route: string;
  availableSeats: number;
}

const mockTrips: Trip[] = [
  {
    id: 1,
    tripNumber: 'Trip 1',
    route: 'Iloilo to San Jose',
    availableSeats: 5,
  },
  {
    id: 2,
    tripNumber: 'Trip 2',
    route: 'Iloilo to San Jose',
    availableSeats: 10,
  },
  {
    id: 3,
    tripNumber: 'Trip 3',
    route: 'Iloilo to San Jose',
    availableSeats: 10,
  },
];

export default function TripLists() {
  const router = useRouter();

  const handleSelectSeat = (tripId: number) => {
    // Redirect to the seat selection page with the tripId as a query param
    router.push(`/passenger/seat-selection?tripId=${tripId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b via-white from-indigo-300 px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Find Your Ride</h1>
        <p className="text-sm text-gray-700 mt-1">Select available trip</p>
      </div>

      {/* Trip Cards */}
      <div className="space-y-8 max-w-xs mx-auto">
        {mockTrips.map((trip) => (
          <Card
            key={trip.id}
            className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden p-0 h-44"
          >
            <CardContent className="p-0">
              {/* Dark Header */}
              <div className="bg-blue-400 bg-gradient-to-t via-blue-500 from-blue-700 h-8 w-full" />

              {/* Content Section */}
              <div className="p-3 text-left">
                <p className="text-gray-600 text-xs mb-1">{trip.tripNumber}</p>

                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {trip.route}
                </h2>

                <p className="text-gray-700 text-xs mb-4">
                  Available Seats:{' '}
                  <span className="font-bold">{trip.availableSeats}</span>
                </p>

                <Button
                  onClick={() => handleSelectSeat(trip.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-medium flex items-center justify-center gap-1"
                >
                  <ArrowRight className="w-4 h-4" />
                  Select a seat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
