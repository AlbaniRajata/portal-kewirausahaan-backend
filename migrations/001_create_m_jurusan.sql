-- Migration: Create m_jurusan table

CREATE TABLE IF NOT EXISTS public.m_jurusan (
    id_jurusan int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    nama_jurusan varchar(100) NOT NULL,
    CONSTRAINT m_jurusan_nama_jurusan_key UNIQUE (nama_jurusan),
    CONSTRAINT m_jurusan_pkey PRIMARY KEY (id_jurusan)
);
