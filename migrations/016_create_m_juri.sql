-- Migration: Create m_juri table
-- Depends on: m_user

CREATE TABLE IF NOT EXISTS public.m_juri (
    id_user int4 NOT NULL,
    institusi varchar(150) NULL,
    bidang_keahlian text NULL,
    CONSTRAINT m_juri_pkey PRIMARY KEY (id_user),
    CONSTRAINT m_juri_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.m_user(id_user) ON DELETE CASCADE
);
