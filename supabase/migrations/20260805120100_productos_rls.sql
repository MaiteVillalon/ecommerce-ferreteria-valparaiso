-- Asegura acceso a productos/categorias: el catálogo público solo puede ver
-- productos activos y nunca la columna `costo` (precio de compra, dato
-- interno). El panel admin sigue viendo todo a través de la vista
-- productos_admin, que corre con los privilegios del dueño de la vista
-- (mismo patrón que public.pedido_es_insertable) y filtra por is_admin.

alter table productos enable row level security;
alter table categorias enable row level security;

drop policy if exists "productos: select publico" on productos;
create policy "productos: select publico"
  on productos for select
  to anon, authenticated
  using (activo = true);

drop policy if exists "productos: todo admin" on productos;
create policy "productos: todo admin"
  on productos for all
  using (exists (select 1 from clientes c where c.id = auth.uid() and c.is_admin))
  with check (exists (select 1 from clientes c where c.id = auth.uid() and c.is_admin));

drop policy if exists "categorias: select publico" on categorias;
create policy "categorias: select publico"
  on categorias for select
  to anon, authenticated
  using (true);

drop policy if exists "categorias: todo admin" on categorias;
create policy "categorias: todo admin"
  on categorias for all
  using (exists (select 1 from clientes c where c.id = auth.uid() and c.is_admin))
  with check (exists (select 1 from clientes c where c.id = auth.uid() and c.is_admin));

-- Columna `costo` fuera del alcance de anon/authenticated incluso si
-- consultan la REST API directamente con la anon key.
revoke select on productos from anon, authenticated;
grant select (id, sku, nombre, precio, categoria_id, categoria_nombre, activo, imagen_url, created_at)
  on productos to anon, authenticated;

-- Vista para el panel admin: incluye `costo`. Corre con los privilegios del
-- dueño de la vista (no hereda el revoke de columnas de arriba), pero solo
-- devuelve filas si quien consulta es admin.
create or replace view productos_admin as
select p.*
from productos p
where exists (select 1 from clientes c where c.id = auth.uid() and c.is_admin);

grant select on productos_admin to authenticated;
