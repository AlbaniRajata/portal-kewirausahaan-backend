-- Migration: Create m_luaran table
-- Depends on: m_program

CREATE TABLE IF NOT EXISTS public.m_luaran (
    id_luaran int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    id_program int4 NOT NULL,
    nama_luaran varchar(100) NOT NULL,
    keterangan text NULL,
    tipe int4 NOT NULL,
    deadline timestamp NOT NULL,
    urutan int4 NOT NULL,
    CONSTRAINT m_luaran_pkey PRIMARY KEY (id_luaran),
    CONSTRAINT m_luaran_unique_urutan UNIQUE (id_program, urutan),
    CONSTRAINT m_luaran_id_program_fkey FOREIGN KEY (id_program) REFERENCES public.m_program(id_program) ON DELETE CASCADE
);
