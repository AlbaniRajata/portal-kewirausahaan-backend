-- Migration: Add file_pdf column to t_berita

ALTER TABLE public.t_berita
ADD COLUMN IF NOT EXISTS file_pdf varchar(255) NULL;
