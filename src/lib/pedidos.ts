import { supabase } from "./supabase";

export type EstadoPedido = "pendiente" | "en_preparacion" | "listo_para_retiro" | "completado";
export type TipoDocumento = "boleta" | "factura";

export interface PedidoItem {
  id: string;
  pedido_id: string;
  producto_id: string;
  nombre_producto: string;
  sku: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  buy_order: string;
  cliente_id: string | null;
  invitado_nombre: string | null;
  invitado_email: string | null;
  invitado_telefono: string | null;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  metodo_pago: string | null;
  tipo_documento: TipoDocumento;
  factura_rut: string | null;
  factura_razon_social: string | null;
  factura_giro: string | null;
  factura_direccion: string | null;
  factura_comuna: string | null;
  metodo_entrega: "retiro" | "despacho" | null;
  direccion_despacho: string | null;
  created_at: string;
  pedido_items: PedidoItem[];
  /** Solo presente cuando se consulta con listarTodosPedidos() (admin) */
  clientes?: { nombre: string; email: string; telefono: string | null } | null;
}

export interface NuevoPedidoItemInput {
  producto_id: string;
  nombre_producto: string;
  sku?: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface NuevoPedidoInput {
  cliente_id: string | null;
  invitado_nombre?: string;
  invitado_email?: string;
  invitado_telefono?: string;
  total: number;
  metodo_pago?: string;
  tipo_documento: TipoDocumento;
  factura_rut?: string;
  factura_razon_social?: string;
  factura_giro?: string;
  factura_direccion?: string;
  factura_comuna?: string;
  metodo_entrega?: "retiro" | "despacho";
  direccion_despacho?: string;
  items: NuevoPedidoItemInput[];
}

function generarBuyOrder(): string {
  return `LN-${Date.now().toString().slice(-6)}`;
}

const PEDIDO_CON_ITEMS = "*, pedido_items(*)";

export async function crearPedido(input: NuevoPedidoInput): Promise<Pedido> {
  const id = crypto.randomUUID();
  const buy_order = generarBuyOrder();
  const { items, ...pedidoFields } = input;

  const { error: pedidoError } = await supabase
    .from("pedidos")
    .insert({ id, ...pedidoFields, buy_order });
  if (pedidoError) throw new Error(pedidoError.message);

  const { error: itemsError } = await supabase
    .from("pedido_items")
    .insert(items.map((item) => ({ ...item, pedido_id: id })));
  if (itemsError) throw new Error(itemsError.message);

  // Un cliente logeado puede releer su propio pedido recién creado (RLS lo permite).
  // Un invitado (cliente_id null) no puede releerlo vía RLS, así que armamos la
  // respuesta con los mismos datos que ya enviamos, sin necesidad de otra consulta.
  if (pedidoFields.cliente_id) {
    const creado = await obtenerPedido(id);
    if (creado) return creado;
  }

  const fecha = new Date().toISOString();
  return {
    id,
    buy_order,
    cliente_id: pedidoFields.cliente_id ?? null,
    invitado_nombre: pedidoFields.invitado_nombre ?? null,
    invitado_email: pedidoFields.invitado_email ?? null,
    invitado_telefono: pedidoFields.invitado_telefono ?? null,
    fecha,
    estado: "pendiente",
    total: pedidoFields.total,
    metodo_pago: pedidoFields.metodo_pago ?? null,
    tipo_documento: pedidoFields.tipo_documento,
    factura_rut: pedidoFields.factura_rut ?? null,
    factura_razon_social: pedidoFields.factura_razon_social ?? null,
    factura_giro: pedidoFields.factura_giro ?? null,
    factura_direccion: pedidoFields.factura_direccion ?? null,
    factura_comuna: pedidoFields.factura_comuna ?? null,
    metodo_entrega: pedidoFields.metodo_entrega ?? null,
    direccion_despacho: pedidoFields.direccion_despacho ?? null,
    created_at: fecha,
    pedido_items: items.map((item, idx) => ({
      id: `local-${idx}`,
      pedido_id: id,
      producto_id: item.producto_id,
      nombre_producto: item.nombre_producto,
      sku: item.sku ?? null,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal,
    })),
  };
}

export async function obtenerPedido(id: string): Promise<Pedido | null> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(PEDIDO_CON_ITEMS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as unknown as Pedido | null;
}

export async function listarMisPedidos(clienteId: string): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(PEDIDO_CON_ITEMS)
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Pedido[];
}

export async function listarTodosPedidos(): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, pedido_items(*), clientes(nombre, email, telefono)")
    .order("fecha", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Pedido[];
}

export async function actualizarEstadoPedido(id: string, estado: EstadoPedido): Promise<void> {
  const { error } = await supabase.from("pedidos").update({ estado }).eq("id", id);
  if (error) throw new Error(error.message);
}
