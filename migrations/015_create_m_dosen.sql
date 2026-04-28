-- Migration: Create m_dosen table
-- Depends on: m_user, m_prodi

CREATE TABLE IF NOT EXISTS public.m_dosen (
    id_user int4 NOT NULL,
    nip varchar(20) NOT NULL,
    id_prodi int4 NOT NULL,
    bidang_keahlian text NULL,
    status_verifikasi int4 DEFAULT 0 NULL,
    catatan text NULL,
    CONSTRAINT m_dosen_nidn_key UNIQUE (nip),
    CONSTRAINT m_dosen_pkey PRIMARY KEY (id_user),
    CONSTRAINT m_dosen_id_prodi_fkey FOREIGN KEY (id_prodi) REFERENCES public.m_prodi(id_prodi),
    CONSTRAINT m_dosen_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.m_user(id_user) ON DELETE CASCADE
);
