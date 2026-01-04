-- Add reactions column to letters table
ALTER TABLE letters 
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{"fire": 0}';