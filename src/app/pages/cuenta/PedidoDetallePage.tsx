import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Clock, MapPin, Package } from "lucide-react";
import { toast } from "sonner";
import { obtenerPedido, type Pedido } from "@/lib/pedidos";
import { EstadoBadge } from "@/app/components/EstadoBadge";
import { volverAPedir } from "@/app/lib/volverAPedir";
import type { Product, AddToCartFn } from "@/app/App";

const fmt = (n: number) => `$${n.toLocaleString("es-CL")}`;

export function PedidoDetallePage({ products, addToCart }: { products: Product[]; addToCart: AddToCartFn }) {
  const { id } = useParams();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    obtenerPedido(id)
      .then((p) => {
        if (!p) setNotFound(true);
        setPedido(p);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVolverAPedir = () => {
    if (!pedido) return;
    const resultado = volverAPedir(pedido, products, addToCart);
    if (resultado.agregados > 0) toast.success(`${resultado.agregados} producto(s) agregado(s) al carro.`);
    if (resultado.noDisponibles.length > 0) toast.error(`No se pudo agregar: ${resultado.noDisponibles.join(", ")}`);
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-24 text-center text-gray-400 text-sm">Cargando pedido…</div>;
  }

  if (notFound || !pedido) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-black uppercase tracking-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Pedido no encontrado
        </h2>
        <p className="text-gray-500 text-sm mb-6">No encontramos ese pedido en tu cuenta.</p>
        <Link to="/mi-cuenta" className="text-[#2ECC71] font-bold text-sm hover:underline">
          Volver a mi cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/mi-cuenta" className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#2ECC71] mb-6 transition-colors">
        <ArrowLeft size={14} /> Volver a mi cuenta
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">Pedido</p>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            {pedido.buy_order}
          </h1>
        </div>
        <EstadoBadge estado={pedido.estado} />
      </div>

      <div className="border-2 border-[#1C1C1C] bg-white mb-6">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            {new Date(pedido.fecha).toLocaleString("es-CL")}
          </p>
          <span
            className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-sm ${
              pedido.tipo_documento === "factura" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
            }`}
          >
            {pedido.tipo_documento === "factura" ? "Factura" : "Boleta"}
          </span>
        </div>

        <div className="px-5 py-4 border-b border-gray-200">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Productos</p>
          <div className="space-y-2">
            {pedido.pedido_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="text-[#1C1C1C] truncate">{item.nombre_producto}</p>
                  <p className="text-xs text-gray-400">{item.cantidad} × {fmt(item.precio_unitario)}</p>
                </div>
                <span className="font-bold text-[#1C1C1C] shrink-0">{fmt(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm font-black uppercase">Total</span>
            <span className="font-black text-xl text-[#2ECC71]" style={{ fontFamily: "var(--font-display)" }}>
              {fmt(pedido.total)}
            </span>
          </div>
        </div>

        {pedido.tipo_documento === "factura" && (
          <div className="px-5 py-4 border-b border-gray-200 bg-blue-50">
            <p className="text-xs font-black uppercase tracking-widest text-blue-500 mb-2">Datos de facturación</p>
            <div className="space-y-0.5 text-sm text-gray-700">
              <p><span className="font-semibold">RUT:</span> {pedido.factura_rut}</p>
              <p><span className="font-semibold">Razón social:</span> {pedido.factura_razon_social}</p>
              <p><span className="font-semibold">Giro:</span> {pedido.factura_giro}</p>
              <p><span className="font-semibold">Dirección:</span> {pedido.factura_direccion}, {pedido.factura_comuna}</p>
            </div>
          </div>
        )}

        <div className="bg-[#1C1C1C] p-5 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-[#2ECC71]">Retiro en tienda</p>
          <div className="flex items-start gap-3">
            <MapPin size={15} className="text-[#2ECC71] mt-0.5 shrink-0" />
            <p className="text-sm text-white">Av. Obispo Valdés Subercaseaux 533, Placilla, Valparaíso</p>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={15} className="text-[#2ECC71] mt-0.5 shrink-0" />
            <p className="text-sm text-white">Lun–Vie: 08:00–18:30 · Sáb: 09:00–14:00</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleVolverAPedir}
        className="flex items-center gap-2 bg-[#2ECC71] hover:bg-[#27AE60] text-white px-6 py-3 font-black uppercase tracking-widest text-sm transition-colors"
      >
        <Package size={15} /> Volver a pedir
      </button>
    </div>
  );
}
