UPDATE basics_cards
SET bullets = bullets || '[{"text":"Additional half-hour of service","price":"+$5pp"}]'::jsonb,
    updated_at = now()
WHERE id = '37ed4b8b-4c91-42e4-a821-6482812ead98';