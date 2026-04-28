-- Migration: Create m_role table

CREATE TABLE IF NOT EXISTS public.m_role (
    id_role int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    nama_role varchar(50) NOT NULL,
    keterangan text NULL,
    CONSTRAINT m_role_nama_role_key UNIQUE (nama_role),
    CONSTRAINT m_role_pkey PRIMARY KEY (id_role)
);
