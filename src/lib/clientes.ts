import { supabase } from "./supabase";

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export async function obtenerCliente(id: string): Promise<Cliente | null> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Cliente | null;
}

export async function actualizarCliente(
  id: string,
  cambios: { nombre?: string; telefono?: string | null },
): Promise<Cliente> {
  const { data, error } = await supabase
    .from("clientes")
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "No se pudo actualizar el perfil");
  return data as Cliente;
}
