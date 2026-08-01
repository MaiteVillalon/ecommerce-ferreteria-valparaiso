alter table pedidos
  add column if not exists metodo_entrega text not null default 'retiro'
    check (metodo_entrega in ('retiro', 'despacho')),
  add column if not exists direccion_despacho text;
