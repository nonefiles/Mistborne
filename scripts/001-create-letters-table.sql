-- Create the letters table for Mystic Letters
CREATE TABLE IF NOT EXISTS letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  mood TEXT NOT NULL,
  delivery_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on delivery_at for efficient querying of arrived letters
CREATE INDEX IF NOT EXISTS idx_letters_delivery_at ON letters(delivery_at DESC);
