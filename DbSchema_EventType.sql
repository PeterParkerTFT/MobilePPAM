-- Migration: Add event_type to sitios table
-- Description: Adds a column to categorize sites by event type (e.g., 'EXPOSITORES', 'BODEGA').
-- Default value is set to 'EXPOSITORES' for existing records to ensure data integrity.

ALTER TABLE sitios 
ADD COLUMN event_type text DEFAULT 'EXPOSITORES';

-- Optional: Create an index for faster filtering by event type
CREATE INDEX IF NOT EXISTS idx_sitios_event_type ON sitios(event_type);

-- Validation (Optional, can be removed if not needed strict constraint yet)
-- ALTER TABLE sitios 
-- ADD CONSTRAINT check_event_type 
-- CHECK (event_type IN ('EXPOSITORES', 'GUIAS', 'ESCUELAS', 'EDITORIALES', 'ENCUESTAS', 'BODEGA'));
