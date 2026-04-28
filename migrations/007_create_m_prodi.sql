-- Migration: Create m_prodi table
-- Depends on: m_jurusan, m_kampus

CREATE TABLE IF NOT EXISTS public.m_prodi (
    id_prodi int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    id_jurusan int4 NOT NULL,
    id_kampus int4 NOT NULL,
    nama_prodi varchar(150) NOT NULL,
    jenjang varchar(5) NOT NULL,
    CONSTRAINT m_prodi_id_kampus_nama_prodi_jenjang_key UNIQUE (id_kampus, nama_prodi, jenjang),
    CONSTRAINT m_prodi_pkey PRIMARY KEY (id_prodi),
    CONSTRAINT m_prodi_id_jurusan_fkey FOREIGN KEY (id_jurusan) REFERENCES public.m_jurusan(id_jurusan),
    CONSTRAINT m_prodi_id_kampus_fkey FOREIGN KEY (id_kampus) REFERENCES public.m_kampus(id_kampus)
);
