-- Add 'territorios' column to 'turnos' table
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS territorios text;
