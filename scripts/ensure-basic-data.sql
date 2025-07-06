-- Ensure we have a route
INSERT INTO "Route" (name, origin, destination, createdAt, updatedAt) 
VALUES ('Terminal A to Terminal B', 'Terminal A', 'Terminal B', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Ensure we have a van
INSERT INTO "Van" (plateNumber, capacity, model, routeId, createdAt, updatedAt) 
VALUES ('ABC-123', 13, 'Toyota Hiace', 1, NOW(), NOW())
ON CONFLICT (plateNumber) DO NOTHING;

-- Ensure we have a trip for today
INSERT INTO "Trip" (vanId, routeId, driverName, driverPhone, tripDate, arrivalTime, availableSeats, createdAt, updatedAt)
VALUES (
  1, -- Van ID
  1, -- Route ID
  'Juan Dela Cruz',
  '+639123456789',
  CURRENT_DATE,
  '08:00 AM',
  13,
  NOW(),
  NOW()
) ON CONFLICT (vanId, tripDate) DO NOTHING;

-- Show what we have
SELECT 'Routes' as table_name, COUNT(*) as count FROM "Route"
UNION ALL
SELECT 'Vans' as table_name, COUNT(*) as count FROM "Van"
UNION ALL
SELECT 'Trips' as table_name, COUNT(*) as count FROM "Trip"
UNION ALL
SELECT 'Seats' as table_name, COUNT(*) as count FROM "Seat";
