import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/hooks/useAuth";
import { actualizarCliente } from "@/lib/clientes";
import { listarMisPedidos, type Pedido } from "@/lib/pedidos";
import { EstadoBadge } from "@/app/components/EstadoBadge";
import { volverAPedir } from "@/app/lib/volverAPedir";
import type { Product, AddToCartFn } from "@/app/App";

const fmt = (n: number) => `$${n.toLocaleString("es-CL")}`;

export function MiCuentaPage({ products, addToCart }: { products: Product[]; addToCart: AddToCartFn }) {
  const { session, cliente, refreshCliente } = useAuth();

  const [form, setForm] = useState({ nombre: "", telefono: "" });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);

  useEffect(() => {
    if (cliente) setForm({ nombre: cliente.nombre, telefono: cliente.telefono ?? "" });
  }, [cliente]);

  useEffect(() => {
    if (!session) return;
    setLoadingPedidos(true);
    listarMisPedidos(session.user.id)
      .then(setPedidos)
      .catch((err) => console.error("No se pudieron cargar tus pedidos:", err))
      .finally(() => setLoadingPedidos(false));
  }, [session]);

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    setSaveError("");
    try {
      await actualizarCliente(session.user.id, { nombre: form.nombre, telefono: form.telefono });
      await refreshCliente();
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleVolverAPedir = (pedido: Pedido) => {
    const resultado = volverAPedir(pedido, products, addToCart);
    if (resultado.agregados > 0) {
      toast.success(`${resultado.agregados} producto(s) agregado(s) al carro.`);
    }
    if (resultado.noDisponibles.length > 0) {
      toast.error(`No se pudo agregar: ${resultado.noDisponibles.join(", ")}`);
    }
  };

  if (!session) return null;

  return (
    <div className="bg-[#F8F7F4] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-[#2ECC71] text-xs font-black uppercase tracking-widest mb-2">Mi cuenta</p>
        <h1
          className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-8"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Hola, {(cliente?.nombre || cliente?.email || "").split(" ")[0]}
        </h1>

        {/* Datos personales */}
        <section className="bg-white border border-gray-200 mb-10">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="font-black uppercase tracking-tight text-base" style={{ fontFamily: "var(--font-display)" }}>
              Datos personales
            </h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-xs font-bold text-[#2ECC71] hover:underline">
                Editar
              </button>
            )}
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Nombre</label>
              {editing ? (
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:border-[#2ECC71] outline-none"
                />
              ) : (
                <p className="text-sm font-semibold text-[#1C1C1C]">{cliente?.nombre || "—"}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Correo</label>
              <p className="text-sm text-gray-600">{cliente?.email}</p>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Teléfono</label>
              {editing ? (
                <input
                  value={form.telefono}
                  onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:border-[#2ECC71] outline-none"
                />
              ) : (
                <p className="text-sm text-gray-600">{cliente?.telefono || "—"}</p>
              )}
            </div>
          </div>
          {editing && (
            <div className="px-5 pb-5 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#2ECC71] hover:bg-[#27AE60] disabled:opacity-60 text-white px-5 py-2 font-black text-xs uppercase tracking-widest transition-colors"
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setSaveError("");
                  if (cliente) setForm({ nombre: cliente.nombre, telefono: cliente.telefono ?? "" });
                }}
                className="text-xs text-gray-400 hover:text-gray-700"
              >
                Cancelar
              </button>
              {saveError && <p className="text-xs text-red-500">{saveError}</p>}
            </div>
          )}
        </section>

        {/* Historial de pedidos */}
        <section>
          <h2 className="font-black uppercase tracking-tight text-lg mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Historial de pedidos
          </h2>

          {loadingPedidos ? (
            <p className="text-sm text-gray-400 py-10 text-center">Cargando pedidos…</p>
          ) : pedidos.length === 0 ? (
            <div className="bg-white border border-gray-200 py-16 text-center">
              <Package size={44} className="mx-auto mb-4 text-gray-300" />
              <p className="font-black uppercase tracking-tight text-lg mb-1" style={{ fontFamily: "var(--font-display)" }}>
                Aún no tienes pedidos
              </p>
              <p className="text-gray-500 text-sm mb-6">Explora el catálogo y arma tu primer pedido.</p>
              <Link
                to="/catalogo"
                className="inline-block bg-[#2ECC71] hover:bg-[#27AE60] text-white px-8 py-3 font-black uppercase tracking-widest text-sm transition-colors"
              >
                Ir al catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="bg-white border border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-sm text-[#1C1C1C]">{pedido.buy_order}</span>
                      <EstadoBadge estado={pedido.estado} />
                    </div>
                    <span className="text-xs text-gray-400">{new Date(pedido.fecha).toLocaleString("es-CL")}</span>
                  </div>
                  <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                    <p className="font-black text-lg text-[#2ECC71]" style={{ fontFamily: "var(--font-display)" }}>
                      {fmt(pedido.total)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVolverAPedir(pedido)}
                        className="text-xs font-bold border border-gray-300 hover:border-[#2ECC71] hover:text-[#2ECC71] px-3.5 py-2 transition-colors"
                      >
                        Volver a pedir
                      </button>
                      <Link
                        to={`/mi-cuenta/pedidos/${pedido.id}`}
                        className="text-xs font-bold bg-[#1C1C1C] hover:bg-[#333] text-white px-3.5 py-2 transition-colors"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
