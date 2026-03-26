INSERT INTO menu_sections (id, label, section_title, description, sort_order)
VALUES ('prix-fixe', 'Prix Fixe', 'Prix Fixe Menus', 'Content coming soon.', 8)
ON CONFLICT (id) DO NOTHING;