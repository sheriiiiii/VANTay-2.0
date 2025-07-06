-- First, let's check what we have
SELECT v.id as van_id, v.plateNumber, COUNT(s.id) as seat_count 
FROM "Van" v 
LEFT JOIN "Seat" s ON v.id = s.vanId 
GROUP BY v.id, v.plateNumber;

-- Delete existing seats to start fresh (optional - only if you want to reset)
-- DELETE FROM "Seat" WHERE vanId IN (SELECT id FROM "Van");

-- Create seats 01-13 for each van
DO $$
DECLARE
    van_record RECORD;
    seat_num TEXT;
    i INTEGER;
BEGIN
    -- Loop through all vans
    FOR van_record IN SELECT id, plateNumber FROM "Van" LOOP
        RAISE NOTICE 'Creating seats for Van ID: %, Plate: %', van_record.id, van_record.plateNumber;
        
        -- Create seats 01 through 13
        FOR i IN 1..13 LOOP
            seat_num := LPAD(i::TEXT, 2, '0'); -- Format as 01, 02, 03, etc.
            
            INSERT INTO "Seat" (vanId, seatNumber, createdAt, updatedAt)
            VALUES (van_record.id, seat_num, NOW(), NOW())
            ON CONFLICT (vanId, seatNumber) DO NOTHING;
            
            RAISE NOTICE 'Created/Checked seat: %', seat_num;
        END LOOP;
    END LOOP;
END $$;

-- Verify the seats were created
SELECT v.plateNumber, s.seatNumber, s.id as seat_id
FROM "Van" v 
JOIN "Seat" s ON v.id = s.vanId 
ORDER BY v.id, s.seatNumber;

-- Show final count
SELECT v.id as van_id, v.plateNumber, COUNT(s.id) as total_seats 
FROM "Van" v 
LEFT JOIN "Seat" s ON v.id = s.vanId 
GROUP BY v.id, v.plateNumber;
