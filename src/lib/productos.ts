import { supabase } from "./supabase";

export interface Categoria {
  id: string;
  nombre: string;
  created_at: string;
}

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  precio: number;
  categoria_id: string;
  categoria_nombre: string;
  activo: boolean;
  imagen_url: string | null;
  created_at: string;
}

export interface ProductoAdmin extends Producto {
  costo: number;
}

const PRODUCTO_PUBLICO_COLUMNAS =
  "id, sku, nombre, precio, categoria_id, categoria_nombre, activo, imagen_url, created_at";

export async function listarCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase.from("categorias").select("*").order("nombre");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listarProductosPublicos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select(PRODUCTO_PUBLICO_COLUMNAS)
    .eq("activo", true)
    .order("nombre");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Producto[];
}

export interface ListarProductosAdminInput {
  search?: string;
  categoriaId?: string;
  page?: number;
  pageSize?: number;
}

export interface ListarProductosAdminResult {
  productos: ProductoAdmin[];
  total: number;
}

export async function listarProductosAdmin({
  search = "",
  categoriaId = "",
  page = 0,
  pageSize = 50,
}: ListarProductosAdminInput): Promise<ListarProductosAdminResult> {
  let query = supabase
    .from("productos_admin")
    .select("*", { count: "exact" })
    .order("nombre");

  if (search.trim()) {
    const q = search.trim();
    query = query.or(`nombre.ilike.%${q}%,sku.ilike.%${q}%`);
  }
  if (categoriaId) {
    query = query.eq("categoria_id", categoriaId);
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { productos: (data ?? []) as unknown as ProductoAdmin[], total: count ?? 0 };
}

export interface NuevoProductoInput {
  sku: string;
  nombre: string;
  precio: number;
  costo: number;
  categoria_id: string;
  categoria_nombre: string;
  imagen_url?: string | null;
  activo?: boolean;
}

export async function crearProducto(input: NuevoProductoInput): Promise<void> {
  const { error } = await supabase.from("productos").insert({
    ...input,
    imagen_url: input.imagen_url || null,
    activo: input.activo ?? true,
  });
  if (error) throw new Error(error.message);
}

export async function actualizarProducto(
  id: string,
  cambios: Partial<NuevoProductoInput>,
): Promise<void> {
  const { error } = await supabase.from("productos").update(cambios).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function toggleActivoProducto(id: string, activo: boolean): Promise<void> {
  const { error } = await supabase.from("productos").update({ activo }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function eliminarProducto(id: string): Promise<void> {
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Agrupación por medida ──────────────────────────────────────────────────
// El SKU no es confiable para agrupar variantes de un mismo producto (misma
// familia puede tener SKUs con prefijos de subcategoría distintos). Se agrupa
// por categoria + nombre base, quitando el sufijo de medida del nombre.

const UNIDAD_MEDIDA_RE = /^(MM|CM|M|KM|KG|GR?|LT|ML?|MTS|PLG|IN)$/i;
const TOKEN_NUMERICO_RE = /^[\d.\/]+"?$/;

function extraerMedida(nombre: string): { base: string; medida: string | null } {
  const tokens = nombre.trim().split(/\s+/);
  const medidaTokens: string[] = [];
  let i = tokens.length - 1;

  while (i >= 0) {
    const t = tokens[i];
    if (TOKEN_NUMERICO_RE.test(t) || /^[xX]$/.test(t) || UNIDAD_MEDIDA_RE.test(t)) {
      medidaTokens.unshift(t);
      i -= 1;
    } else {
      break;
    }
  }

  const tieneNumero = medidaTokens.some((t) => TOKEN_NUMERICO_RE.test(t));
  if (!tieneNumero || i < 0) {
    return { base: nombre.trim(), medida: null };
  }

  return { base: tokens.slice(0, i + 1).join(" "), medida: medidaTokens.join(" ") };
}

export interface VarianteProducto {
  producto: Producto;
  medida: string | null;
}

export interface GrupoProducto {
  clave: string;
  nombreBase: string;
  categoria_id: string;
  imagen_url: string | null;
  variantes: VarianteProducto[];
}

export function agruparPorMedida(productos: Producto[]): GrupoProducto[] {
  const grupos = new Map<string, GrupoProducto>();

  for (const producto of productos) {
    const { base, medida } = extraerMedida(producto.nombre);
    const clave = `${producto.categoria_id}::${base.toUpperCase()}`;

    let grupo = grupos.get(clave);
    if (!grupo) {
      grupo = {
        clave,
        nombreBase: base,
        categoria_id: producto.categoria_id,
        imagen_url: null,
        variantes: [],
      };
      grupos.set(clave, grupo);
    }
    if (!grupo.imagen_url && producto.imagen_url) grupo.imagen_url = producto.imagen_url;
    grupo.variantes.push({ producto, medida });
  }

  return [...grupos.values()];
}
