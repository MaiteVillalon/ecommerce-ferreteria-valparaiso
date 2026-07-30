import type { EstadoPedido } from "@/lib/pedidos";

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  listo_para_retiro: "Listo para retirar",
  completado: "Completado",
  cancelado: "Cancelado",
};

const ESTADO_COLOR: Record<EstadoPedido, string> = {
  pendiente: "bg-red-100 text-red-700",
  pagado: "bg-yellow-100 text-yellow-700",
  listo_para_retiro: "bg-[#dcfce7] text-green-800",
  completado: "bg-blue-100 text-blue-700",
  cancelado: "bg-gray-100 text-gray-500",
};

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${ESTADO_COLOR[estado]}`}>
      {ESTADO_LABEL[estado]}
    </span>
  );
}
