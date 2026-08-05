import type { Product, AddToCartFn } from "@/app/App";
import type { Pedido } from "@/lib/pedidos";

export function volverAPedir(pedido: Pedido, products: Product[], addToCart: AddToCartFn) {
  let agregados = 0;
  const noDisponibles: string[] = [];

  for (const item of pedido.pedido_items) {
    const producto = products.find((p) => p.id === item.producto_id);
    if (producto && producto.activo) {
      addToCart(producto, item.cantidad);
      agregados += 1;
    } else {
      noDisponibles.push(item.nombre_producto);
    }
  }

  return { agregados, noDisponibles };
}
