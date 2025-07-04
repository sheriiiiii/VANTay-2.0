//VANTay-2.0\src\components\passenger-side\tripLists.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface Trip {
  id: number;
  tripDate: string;
  availableSeats: number;
  driverName?: string | null;
  driverPhone?: string | null;
  van: {
    plateNumber: string;
  };
  route: {
    origin: string;
    destination: string;
  };
}

export default function TripLists() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    async function fetchTrips() {
      try {
        const res = await fetch('/api/admin/trips');
        if (!res.ok) throw new Error('Failed to fetch trips');
        const data = await res.json();
        setTrips(data);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, []);

  const handleSelectSeat = (tripId: number) => {
    router.push(`/passenger/seat-selection?tripId=${tripId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b via-white from-indigo-300 px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Find Your Ride</h1>
        <p className="text-sm text-gray-700 mt-1">Select available trip</p>
      </div>

      <div className="space-y-8 max-w-xs mx-auto">
        {loading ? (
          <p className="text-center text-gray-600">Loading trips...</p>
        ) : trips.length === 0 ? (
          <p className="text-center text-gray-600">No available trips found.</p>
        ) : (
          trips.map((trip) => (
            <Card
              key={trip.id}
              className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden p-0 h-44"
            >
              <CardContent className="p-0">
                <div className="bg-blue-400 bg-gradient-to-t via-blue-500 from-blue-700 h-8 w-full" />
                <div className="p-3 text-left">
                  <p className="text-gray-600 text-xs mb-1">
                    {new Date(trip.tripDate).toLocaleDateString()}
                  </p>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {trip.route.origin} to {trip.route.destination}
                  </h2>
                  <p className="text-gray-700 text-xs mb-4">
                    Available Seats: <span className="font-bold">{trip.availableSeats}</span>
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
          ))
        )}
      </div>
    </div>
  );
}