-- Migration: Create t_email_verification table
-- Depends on: m_user

CREATE TABLE IF NOT EXISTS public.t_email_verification (
    id serial4 NOT NULL,
    id_user int4 NOT NULL,
    "token" varchar(255) NOT NULL,
    expired_at timestamp NOT NULL,
    used bool DEFAULT false NULL,
    created_at timestamp DEFAULT now() NULL,
    CONSTRAINT t_email_verification_pkey PRIMARY KEY (id),
    CONSTRAINT t_email_verification_token_key UNIQUE (token),
    CONSTRAINT t_email_verification_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.m_user(id_user) ON DELETE CASCADE
);
