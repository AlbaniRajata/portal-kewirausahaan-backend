-- Migration: Create t_berita table
-- Depends on: m_user

CREATE TABLE IF NOT EXISTS public.t_berita (
    id_berita int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    judul varchar(200) NULL,
    isi text NULL,
    file_gambar varchar(255) NULL,
    created_at timestamp DEFAULT now() NULL,
    slug varchar(255) NOT NULL,
    status int2 DEFAULT 0 NOT NULL,
    id_author int4 NULL,
    updated_at timestamp DEFAULT now() NULL,
    CONSTRAINT t_berita_pkey PRIMARY KEY (id_berita),
    CONSTRAINT t_berita_slug_key UNIQUE (slug),
    CONSTRAINT t_berita_id_author_fkey FOREIGN KEY (id_author) REFERENCES public.m_user(id_user)
);
