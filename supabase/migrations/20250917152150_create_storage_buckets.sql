-- Migration: Create Supabase Storage buckets for file uploads
-- Created: 2025-09-17
-- Description: Sets up storage buckets for blood tests and medical records

-- Create blood-tests bucket for blood test images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blood-tests',
  'blood-tests',
  false, -- private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/heic', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create medical-records bucket for documents, images, and videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-records',
  'medical-records',
  false, -- private bucket
  52428800, -- 50MB limit for documents and videos
  ARRAY[
    -- Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    'application/vnd.oasis.opendocument.text',
    -- Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/heic',
    'image/webp',
    -- Videos
    'video/mp4',
    'video/quicktime',
    'video/avi',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/x-matroska',
    'video/webm'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS (Row Level Security) policies for blood-tests bucket
CREATE POLICY "Users can upload blood test images for their own cases"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blood-tests' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own blood test images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'blood-tests' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own blood test images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blood-tests' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Set up RLS policies for medical-records bucket
CREATE POLICY "Users can upload medical records for their own cases"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-records' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own medical records"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-records' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own medical records"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-records' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow specialists to view medical records for assigned cases
CREATE POLICY "Specialists can view medical records for assigned cases"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('blood-tests', 'medical-records') AND
  EXISTS (
    SELECT 1 FROM cases
    WHERE cases.specialist_id = auth.uid()::text
    AND cases.referring_vet_id = (storage.foldername(name))[1]
  )
);