-- Migration: Create m_kampus table

CREATE TABLE IF NOT EXISTS public.m_kampus (
    id_kampus int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    nama_kampus varchar(100) NOT NULL,
    CONSTRAINT m_kampus_nama_kampus_key UNIQUE (nama_kampus),
    CONSTRAINT m_kampus_pkey PRIMARY KEY (id_kampus)
);
