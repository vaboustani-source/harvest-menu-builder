INSERT INTO public.pricing_config (category, item_key, item_label, price, is_active, sort_order)
VALUES ('meal-inclusions', 'farewell_brunch', 'Upgrade to Farewell Brunch', 25, true, 3)
ON CONFLICT DO NOTHING;