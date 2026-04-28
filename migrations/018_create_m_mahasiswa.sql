-- Migration: Create m_mahasiswa table
-- Depends on: m_user, m_prodi

CREATE TABLE IF NOT EXISTS public.m_mahasiswa (
    id_user int4 NOT NULL,
    nim varchar(20) NOT NULL,
    id_prodi int4 NOT NULL,
    tahun_masuk int4 NOT NULL,
    foto_ktm varchar(255) NULL,
    status_verifikasi int4 DEFAULT 0 NULL,
    status_mahasiswa int4 DEFAULT 1 NULL,
    catatan text NULL,
    CONSTRAINT m_mahasiswa_nim_key UNIQUE (nim),
    CONSTRAINT m_mahasiswa_pkey PRIMARY KEY (id_user),
    CONSTRAINT m_mahasiswa_id_prodi_fkey FOREIGN KEY (id_prodi) REFERENCES public.m_prodi(id_prodi),
    CONSTRAINT m_mahasiswa_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.m_user(id_user) ON DELETE CASCADE
);
