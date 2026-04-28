-- Migration: Create m_tahap_penilaian table
-- Depends on: m_program

CREATE TABLE IF NOT EXISTS public.m_tahap_penilaian (
    id_tahap int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    nama_tahap varchar(50) NOT NULL,
    urutan int4 NOT NULL,
    penilaian_mulai timestamp NOT NULL,
    penilaian_selesai timestamp NOT NULL,
    status int4 DEFAULT 1 NOT NULL,
    id_program int4 NOT NULL,
    CONSTRAINT m_tahap_penilaian_pkey PRIMARY KEY (id_tahap),
    CONSTRAINT unique_tahap_per_program UNIQUE (id_program, urutan),
    CONSTRAINT fk_tahap_program FOREIGN KEY (id_program) REFERENCES public.m_program(id_program) ON DELETE CASCADE
);
