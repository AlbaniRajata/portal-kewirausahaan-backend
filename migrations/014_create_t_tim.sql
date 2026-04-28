-- Migration: Create t_tim table
-- Depends on: m_program

CREATE TABLE IF NOT EXISTS public.t_tim (
    id_tim int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    id_program int4 NOT NULL,
    nama_tim varchar(100) NOT NULL,
    status int4 DEFAULT 0 NULL,
    created_at timestamp DEFAULT now() NULL,
    CONSTRAINT t_tim_pkey PRIMARY KEY (id_tim),
    CONSTRAINT unique_tim_per_program UNIQUE (id_program, nama_tim),
    CONSTRAINT t_tim_id_program_fkey FOREIGN KEY (id_program) REFERENCES public.m_program(id_program)
);
