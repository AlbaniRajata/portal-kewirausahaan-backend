-- Migration: Create m_kategori table

CREATE TABLE IF NOT EXISTS public.m_kategori (
    id_kategori int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    nama_kategori varchar(100) NOT NULL,
    keterangan text NULL,
    CONSTRAINT m_kategori_nama_kategori_key UNIQUE (nama_kategori),
    CONSTRAINT m_kategori_pkey PRIMARY KEY (id_kategori)
);
