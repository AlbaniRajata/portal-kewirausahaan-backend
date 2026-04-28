-- Migration: Create m_user table
-- Depends on: m_role

CREATE TABLE IF NOT EXISTS public.m_user (
    id_user int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    id_role int4 NOT NULL,
    username varchar(50) NOT NULL,
    email varchar(100) NOT NULL,
    password_hash varchar(255) NOT NULL,
    no_hp varchar(20) NULL,
    foto varchar(255) NULL,
    email_verified_at timestamp NULL,
    is_active bool DEFAULT false NULL,
    created_at timestamp DEFAULT now() NULL,
    nama_lengkap text NULL,
    alamat text NULL,
    CONSTRAINT m_user_email_key UNIQUE (email),
    CONSTRAINT m_user_pkey PRIMARY KEY (id_user),
    CONSTRAINT m_user_username_key UNIQUE (username),
    CONSTRAINT m_user_id_role_fkey FOREIGN KEY (id_role) REFERENCES public.m_role(id_role)
);
