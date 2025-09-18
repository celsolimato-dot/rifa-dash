-- Add missing columns to tickets table for PIX integration
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS pix_id TEXT,
ADD COLUMN IF NOT EXISTS reserved_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS user_email TEXT;