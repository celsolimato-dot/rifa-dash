-- Create storage bucket for raffle images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('raffle-images', 'raffle-images', true);

-- Create RLS policies for raffle images
CREATE POLICY "Public can view raffle images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'raffle-images');

CREATE POLICY "Admins can upload raffle images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'raffle-images' 
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update raffle images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'raffle-images' 
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete raffle images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'raffle-images' 
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);