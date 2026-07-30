create table if not exists consultas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  telefono text,
  asunto text,
  mensaje text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

-- Solo el service role puede insertar/leer (la edge function usa service role key)
alter table consultas enable row level security;

create policy "service role only"
  on consultas
  using (false)
  with check (false);
