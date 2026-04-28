-- Migration: Create m_kriteria_penilaian table
-- Depends on: m_tahap_penilaian

CREATE TABLE IF NOT EXISTS public.m_kriteria_penilaian (
    id_kriteria int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    id_tahap int4 NOT NULL,
    nama_kriteria varchar(100) NOT NULL,
    deskripsi text NULL,
    bobot int4 NOT NULL,
    status int4 DEFAULT 1 NOT NULL,
    urutan int4 NOT NULL,
    CONSTRAINT m_kriteria_penilaian_pkey PRIMARY KEY (id_kriteria),
    CONSTRAINT fk_kriteria_tahap FOREIGN KEY (id_tahap) REFERENCES public.m_tahap_penilaian(id_tahap) ON DELETE CASCADE
);
