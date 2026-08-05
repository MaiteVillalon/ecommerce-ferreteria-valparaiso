-- pedido_items.producto_id era integer, pensado para los ids numéricos del
-- catálogo mock. El catálogo real en `productos` usa uuid. Esta columna es un
-- snapshot histórico sin FK real (ya se guardan nombre_producto/sku aparte),
-- así que se cambia a text para aceptar cualquier id sin conversión frágil.
alter table pedido_items alter column producto_id type text using producto_id::text;
