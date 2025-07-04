-- Insert sample trip data for testing
-- Make sure you have a route and van first

-- Insert a sample trip for today
INSERT INTO "Trip" (vanId, routeId, driverName, driverPhone, tripDate, arrivalTime, availableSeats)
VALUES (
  1, -- Assuming van ID 1 exists
  1, -- Assuming route ID 1 exists
  'Juan Dela Cruz',
  '+639123456789',
  CURRENT_DATE,
  '08:00 AM',
  13
) ON CONFLICT (vanId, tripDate) DO NOTHING;

-- Insert some sample tickets to show occupied/pending seats
INSERT INTO "Ticket" (
  tripId, seatId, passengerName, passengerAddress, passengerAge, 
  passengerPhone, passengerEmergencyContact, totalFare, qrCode, paymentStatus
)
SELECT 
  1, -- Trip ID
  s.id, -- Seat ID
  'Sample Passenger ' || s.seatNumber,
  'Sample Address',
  25,
  '+639987654321',
  '+639111111111',
  200.00,
  'QR_' || s.seatNumber || '_' || EXTRACT(EPOCH FROM NOW()),
  CASE 
    WHEN s.seatNumber IN ('02', '05') THEN 'PENDING'::PaymentStatus
    WHEN s.seatNumber IN ('03', '07', '10') THEN 'PAID'::PaymentStatus
    ELSE 'PENDING'::PaymentStatus
  END
FROM "Seat" s
WHERE s.vanId = 1 AND s.seatNumber IN ('02', '03', '05', '07', '10')
ON CONFLICT (tripId, seatId) DO NOTHING;
