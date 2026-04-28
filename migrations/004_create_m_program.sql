-- Migration: Create m_program table

CREATE TABLE IF NOT EXISTS public.m_program (
    id_program int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    nama_program varchar(50) NOT NULL,
    keterangan text NULL,
    pendaftaran_mulai timestamp NULL,
    pendaftaran_selesai timestamp NULL,
    CONSTRAINT m_program_nama_program_key UNIQUE (nama_program),
    CONSTRAINT m_program_pkey PRIMARY KEY (id_program),
    CONSTRAINT valid_timeline_program CHECK ((pendaftaran_mulai < pendaftaran_selesai))
);
