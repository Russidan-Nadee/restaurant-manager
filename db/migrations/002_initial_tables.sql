-- Initial restaurant configuration requested by the owner, not sample orders or menu data.
CREATE UNIQUE INDEX restaurant_tables_name_key ON restaurant_tables (name);

INSERT INTO restaurant_tables (name)
VALUES ('001'), ('002'), ('003'), ('004'), ('005')
ON CONFLICT (name) DO NOTHING;
