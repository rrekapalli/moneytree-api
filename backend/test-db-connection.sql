-- Test queries to verify kite_instrument_master table
-- Run these in your PostgreSQL client to check the table status

-- 1. Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'kite_instrument_master'
);

-- 2. Count total records
SELECT COUNT(*) as total_records FROM kite_instrument_master;

-- 3. Check distinct exchanges
SELECT DISTINCT exchange 
FROM kite_instrument_master 
WHERE exchange IS NOT NULL AND exchange != ''
ORDER BY exchange;

-- 4. Check distinct segments
SELECT DISTINCT segment 
FROM kite_instrument_master 
WHERE segment IS NOT NULL AND segment != ''
ORDER BY segment;

-- 5. Check distinct indices (where segment = 'INDICES')
SELECT DISTINCT tradingsymbol 
FROM kite_instrument_master 
WHERE segment = 'INDICES' 
  AND tradingsymbol IS NOT NULL 
  AND tradingsymbol != ''
ORDER BY tradingsymbol
LIMIT 10;

-- 6. Sample data
SELECT * FROM kite_instrument_master LIMIT 5;
