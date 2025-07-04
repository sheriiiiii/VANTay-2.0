-- Create seats for each van (01-13)
-- This script should be run after creating vans

-- First, let's create a sample van and route if they don't exist
INSERT INTO "Route" (name, origin, destination) 
VALUES ('Terminal A to Terminal B', 'Terminal A', 'Terminal B')
ON CONFLICT DO NOTHING;

INSERT INTO "Van" (plateNumber, capacity, model, routeId) 
VALUES ('ABC-123', 13, 'Toyota Hiace', 1)
ON CONFLICT (plateNumber) DO NOTHING;

-- Create seats 01-13 for each van
DO $$
DECLARE
    van_record RECORD;
    seat_num TEXT;
BEGIN
    FOR van_record IN SELECT id FROM "Van" LOOP
        FOR i IN 1..13 LOOP
            seat_num := LPAD(i::TEXT, 2, '0'); -- Format as 01, 02, 03, etc.
            
            INSERT INTO "Seat" (vanId, seatNumber)
            VALUES (van_record.id, seat_num)
            ON CONFLICT (vanId, seatNumber) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
