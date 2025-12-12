-- 0000_enable_extensions.sql
create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_trgm;

-- gen_random_uuid() provided by pgcrypto
