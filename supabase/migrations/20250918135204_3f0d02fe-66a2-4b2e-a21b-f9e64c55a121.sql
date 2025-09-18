-- Add winner name and drawing date fields to testimonials table
ALTER TABLE testimonials 
ADD COLUMN winner_name VARCHAR(255),
ADD COLUMN drawing_date TIMESTAMP WITH TIME ZONE;

-- Add index for better performance on drawing_date queries
CREATE INDEX idx_testimonials_drawing_date ON testimonials(drawing_date);

-- Add comment for documentation
COMMENT ON COLUMN testimonials.winner_name IS 'Name of the winner (can be different from username)';
COMMENT ON COLUMN testimonials.drawing_date IS 'Date when the drawing was performed';