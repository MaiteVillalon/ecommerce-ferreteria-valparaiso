-- Perfil de cliente, 1:1 con auth.users
create table if not exists clientes (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  email text not null,
  telefono text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table clientes enable row level security;

create policy "clientes: select propio"
  on clientes for select
  using (id = auth.uid());

create policy "clientes: update propio"
  on clientes for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- crea automáticamente el perfil de cliente al registrarse en auth.users
create or replace function public.handle_new_cliente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.clientes (id, nombre, email, telefono)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    new.email,
    new.raw_user_meta_data->>'telefono'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_cliente();

-- Pedidos: cliente_id null = compra como invitado
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  buy_order text not null unique,
  cliente_id uuid references clientes(id) on delete set null,
  invitado_nombre text,
  invitado_email text,
  invitado_telefono text,
  fecha timestamptz not null default now(),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'pagado', 'listo_para_retiro', 'completado', 'cancelado')),
  total numeric not null check (total >= 0),
  metodo_pago text,
  tipo_documento text not null check (tipo_documento in ('boleta', 'factura')),
  factura_rut text,
  factura_razon_social text,
  factura_giro text,
  factura_direccion text,
  factura_comuna text,
  created_at timestamptz not null default now()
);

alter table pedidos enable row level security;

create policy "pedidos: select propio o admin"
  on pedidos for select
  using (
    cliente_id = auth.uid()
    or exists (select 1 from clientes c where c.id = auth.uid() and c.is_admin)
  );

create policy "pedidos: insert propio o invitado"
  on pedidos for insert
  with check (
    cliente_id = auth.uid() or cliente_id is null
  );

create policy "pedidos: update solo admin"
  on pedidos for update
  using (exists (select 1 from clientes c where c.id = auth.uid() and c.is_admin))
  with check (exists (select 1 from clientes c where c.id = auth.uid() and c.is_admin));

-- Líneas de producto de cada pedido (snapshot al momento de la compra)
create table if not exists pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  producto_id integer not null,
  nombre_producto text not null,
  sku text,
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric not null check (precio_unitario >= 0),
  subtotal numeric not null check (subtotal >= 0)
);

alter table pedido_items enable row level security;

create policy "pedido_items: select por pedido visible"
  on pedido_items for select
  using (
    exists (
      select 1 from pedidos p
      where p.id = pedido_items.pedido_id
        and (
          p.cliente_id = auth.uid()
          or exists (select 1 from clientes c where c.id = auth.uid() and c.is_admin)
        )
    )
  );

-- función security definer: evita que la política de insert de pedido_items
-- dependa de la política de select de pedidos (que un invitado anónimo no
-- puede satisfacer sobre su propio pedido recién creado, ya que cliente_id
-- es null y no hay auth.uid() con el que compararlo)
create or replace function public.pedido_es_insertable(p_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from pedidos p
    where p.id = p_id
      and (p.cliente_id = auth.uid() or p.cliente_id is null)
  );
$$;

create policy "pedido_items: insert junto al pedido propio o invitado"
  on pedido_items for insert
  with check (public.pedido_es_insertable(pedido_id));

-- Para promover un usuario existente a administrador (ejecutar manualmente
-- en el SQL editor de Supabase después de que la cuenta se haya registrado):
--   update clientes set is_admin = true where email = 'correo-del-admin@ejemplo.com';
