import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart, Search, MapPin, Clock, Phone, X, Check,
  ChevronDown, ChevronUp, Store, ArrowLeft, ChevronRight,
  Package, Menu, Filter, Zap, Wrench, Plug, Droplets, Leaf,
  ShieldCheck, Paintbrush, ScanBarcode
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { HeroSlideshow } from "@/app/components/HeroSlideshow";
import { WorldMapSparkle } from "@/app/components/WorldMapSparkle";
import storeFront from "@/imports/Captura_de_pantalla_2026-07-26_010939.png";
import logoImg from "@/imports/ferreteria-la-nonna-logo.png";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface Spec { key: string; value: string }
interface ProductVariants { type: "color" | "size"; options: string[] }
interface Product {
  id: number; sku: string; name: string; brand: string; category: string;
  price: number; originalPrice?: number; available: boolean; img: string;
  description: string; specs: Spec[]; badge?: string; isOffer?: boolean;
  variants?: ProductVariants;
}
interface CartItem extends Product { qty: number }
interface InvoiceData {
  rut: string;
  razonSocial: string;
  giro: string;
  direccion: string;
  comuna: string;
}
interface Order {
  id: string;
  num: string;
  date: string;
  customer: { name: string; email: string; phone: string; address: string };
  items: CartItem[];
  total: number;
  status: "pendiente" | "en preparación" | "listo" | "entregado";
  docType: "boleta" | "factura";
  invoiceData?: InvoiceData;
}
interface User { name: string; email: string; phone: string; }
interface ContactMessage {
  id: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
}
type Page = "home" | "catalog" | "product" | "cart" | "checkout" | "confirmation" | "nosotros" | "contacto" | "admin" | "auth";
type NavigateFn = (page: Page, product?: Product) => void;
type AddToCartFn = (product: Product, qty?: number) => void;

// ─── HELPERS ────────────────────────────────────────────────────────────────
const fmt = (n: number) => `$${n.toLocaleString("es-CL")}`;
const unsplash = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format`;

// ─── DATA ───────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "electric", name: "Herramientas Eléctricas", img: "photo-1518709414768-a88981a4515d" },
  { id: "manual", name: "Herramientas Manuales", img: "photo-1572981779307-38b8cabb2407" },
  { id: "fixings", name: "Fijaciones y Tornillería", img: "photo-1613945831677-383c19ad7721" },
  { id: "paint", name: "Pinturas", img: "photo-1585676737728-432f58d5fdba" },
  { id: "electrical", name: "Electricidad", img: "photo-1544724569-5f546fd6f2b5" },
  { id: "plumbing", name: "Gasfitería", img: "photo-1742134131017-44d377a611b1" },
  { id: "garden", name: "Jardín", img: "photo-1416879595882-3373a0480b5b" },
  { id: "safety", name: "Seguridad", img: "photo-1567954970774-58d6aa6c50dc" },
];

const PRODUCTS: Product[] = [
  {
    id: 1, sku: "BSH-GSB550", name: "Taladro Percutor Bosch GSB 550W",
    brand: "Bosch", category: "electric", price: 49990, available: true,
    img: "photo-1504148455328-c376907d081c",
    description: "Taladro percutor de 550W para mampostería, hormigón y madera. Incluye mandril 13mm, mango auxiliar y maletín de transporte. Ideal para faenas en construcción y remodelación.",
    specs: [
      { key: "Potencia", value: "550W" }, { key: "Velocidad máx.", value: "2.800 rpm" },
      { key: "Cap. hormigón", value: "13 mm" }, { key: "Cap. madera", value: "25 mm" },
      { key: "Peso", value: "1.7 kg" }, { key: "Voltaje", value: "220V / 50Hz" },
    ],
    badge: "Más vendido",
  },
  {
    id: 2, sku: "BSH-DC115-10", name: "Disco Corte Metal Bosch 115mm (Pack ×10)",
    brand: "Bosch", category: "electric", price: 8490, originalPrice: 10990, available: true,
    img: "photo-1685713011172-3ba27ff25e22",
    description: "Pack de 10 discos de corte para amoladora angular 4½\". Apto para acero y metales ferrosos. Corte limpio y preciso.",
    specs: [
      { key: "Diámetro", value: "115 mm" }, { key: "Espesor", value: "1.0 mm" },
      { key: "Velocidad máx.", value: "13.300 rpm" }, { key: "Árbol", value: "22.23 mm" },
      { key: "Material", value: "Óxido de aluminio" }, { key: "Uso", value: "Metales ferrosos" },
    ],
    badge: "Oferta", isOffer: true,
  },
  {
    id: 3, sku: "STL-AP8x1-100", name: "Tornillos Autoperforantes 8×1\" (Caja 100u)",
    brand: "Stanley", category: "fixings", price: 3290, available: true,
    img: "photo-1568393691622-c7ba131d63b4",
    description: "Caja de 100 tornillos autoperforantes punta de broca, cabeza hexagonal. Para fijación en estructura metálica liviana y plancha de zinc.",
    specs: [
      { key: "Medida", value: "8×1\" (4.2×25mm)" }, { key: "Cabeza", value: "Hexagonal" },
      { key: "Material", value: "Acero templado" }, { key: "Acabado", value: "Fosfatado negro" },
      { key: "Uso", value: "Estructura metálica liviana" },
    ],
  },
  {
    id: 4, sku: "MEL-CEM-25", name: "Cemento Melón Portland Gris 25 kg",
    brand: "Melón", category: "fixings", price: 7990, available: true,
    img: "photo-1581094794329-c8112a89af12",
    description: "Cemento portland puzolánico CPP 35 de uso general. Ideal para confección de hormigón, morteros, revoques y fundaciones.",
    specs: [
      { key: "Peso", value: "25 kg" }, { key: "Tipo", value: "Portland Puzolánico" },
      { key: "Resistencia", value: "CPP 35" }, { key: "Uso", value: "Obras generales" },
      { key: "Norma", value: "NCh 148" },
    ],
  },
  {
    id: 5, sku: "MKT-9553NB", name: "Amoladora Angular Makita 9553NB 900W",
    brand: "Makita", category: "electric", price: 59990, originalPrice: 69990, available: true,
    img: "photo-1564182998523-6923112e7d6b",
    description: "Amoladora angular 900W con disco 115mm. Motor potente con engranajes helicoidales. Protección contra sobrecarga.",
    specs: [
      { key: "Potencia", value: "900W" }, { key: "Disco", value: "115 mm" },
      { key: "Velocidad", value: "11.000 rpm" }, { key: "Peso", value: "1.9 kg" },
      { key: "Voltaje", value: "220V" },
    ],
    badge: "Oferta", isOffer: true,
  },
  {
    id: 6, sku: "SW-LAT4L", name: "Pintura Látex Sherwin-Williams 4L",
    brand: "Sherwin-Williams", category: "paint", price: 24990, available: true,
    img: "photo-1562259929-b4e1fd3aef09",
    description: "Pintura látex interior/exterior de alta cubrición. Secado rápido, lavable, resistente a manchas y hongos.",
    specs: [
      { key: "Contenido", value: "4 litros" }, { key: "Rendimiento", value: "10-12 m²/L" },
      { key: "Secado al tacto", value: "1 hora" }, { key: "Secado total", value: "4 horas" },
      { key: "Acabado", value: "Mate" }, { key: "Uso", value: "Interior y exterior" },
    ],
    variants: { type: "color", options: ["Blanco Ártico", "Crema", "Gris Paloma", "Beige Natural"] },
  },
  {
    id: 7, sku: "3M-GL-BOV", name: "Guante de Cuero 3M Tipo A",
    brand: "3M", category: "safety", price: 4590, available: true,
    img: "photo-1585771724684-38269d6639fd",
    description: "Guante cuero flor de vacuno reforzado en palma y dedos. Protección mecánica tipo A según EN 388. Para trabajos de construcción y soldadura.",
    specs: [
      { key: "Material", value: "Cuero flor vacuno" }, { key: "Protección", value: "Mecánica Tipo A" },
      { key: "Norma", value: "EN 388" }, { key: "Uso", value: "Construcción, soldadura" },
    ],
    variants: { type: "size", options: ["S", "M", "L", "XL"] },
  },
  {
    id: 8, sku: "DML-EXT10M", name: "Extensión Eléctrica 10m 3×1.5mm²",
    brand: "Dimelec", category: "electrical", price: 12990, available: true,
    img: "photo-1621905251189-08b45249ff78",
    description: "Extensión con 3 enchufes hembra. Conductor cobre 3×1.5mm² hasta 1.500W. Cable reforzado con protección UV.",
    specs: [
      { key: "Largo", value: "10 metros" }, { key: "Sección", value: "3×1.5 mm²" },
      { key: "Potencia máx.", value: "1.500W" }, { key: "Enchufes", value: "3 salidas hembra" },
      { key: "Norma", value: "IEC 60884" },
    ],
  },
  {
    id: 9, sku: "STL-STL14", name: "Llave Stilson Stanley 14\" Cromada",
    brand: "Stanley", category: "manual", price: 15490, available: true,
    img: "photo-1572981779307-38b8cabb2407",
    description: "Llave stilson 14\" con mandíbulas de acero cromado forjado. Para tubos hasta 1½\". Agarre antideslizante.",
    specs: [
      { key: "Tamaño", value: "14\" (355mm)" }, { key: "Apertura máx.", value: "38 mm" },
      { key: "Material", value: "Acero al carbono forjado" }, { key: "Acabado", value: "Cromado pulido" },
      { key: "Uso", value: "Tubos hasta 1½\"" },
    ],
  },
  {
    id: 10, sku: "MDC-VUL25-100", name: "Cable Vulcanita 2.5mm² Rollo 100m",
    brand: "Madeco", category: "electrical", price: 89990, available: true,
    img: "photo-1558618047-f2e04cd39a85",
    description: "Rollo 100m cable vulcanita unipolar 2.5mm² para instalaciones domiciliarias. Conductor cobre recocido.",
    specs: [
      { key: "Sección", value: "2.5 mm²" }, { key: "Largo", value: "100 metros" },
      { key: "Tensión", value: "450/750V" }, { key: "Conductor", value: "Cobre recocido" },
      { key: "Norma", value: "IEC 60227" },
    ],
    badge: "Stock limitado",
  },
  {
    id: 11, sku: "TGR-PVC4-3M", name: "Tubo PVC Sanitario 4\" × 3m",
    brand: "Tigre", category: "plumbing", price: 8990, available: true,
    img: "photo-1504328345606-18bbc8c9d7d1",
    description: "Tubo de PVC sanitario 4\" para alcantarillado domiciliario. Alta resistencia química y mecánica.",
    specs: [
      { key: "Diámetro", value: "4\" (110mm)" }, { key: "Largo", value: "3 metros" },
      { key: "Espesor", value: "3.2 mm" }, { key: "Presión", value: "0.4 MPa" },
      { key: "Norma", value: "NCh 399" },
    ],
  },
  {
    id: 12, sku: "3M-H700", name: "Casco Seguridad 3M H-700",
    brand: "3M", category: "safety", price: 8490, available: true,
    img: "photo-1582719508461-905c673771fd",
    description: "Casco de seguridad clase E con ajuste por ruleta. Resistente a alto voltaje eléctrico. Liviano y ventilado.",
    specs: [
      { key: "Clase", value: "E (eléctrico)" }, { key: "Ajuste", value: "Ruleta posterior" },
      { key: "Material", value: "HDPE" }, { key: "Peso", value: "350 g" },
      { key: "Norma", value: "ANSI Z89.1" },
    ],
    variants: { type: "color", options: ["Amarillo", "Blanco", "Naranja", "Azul"] },
  },
];

const BRAND_LOGOS: Record<string, React.ReactNode> = {
  Bosch: (
    <svg viewBox="0 0 90 36" width="54" height="22">
      <rect x="1" y="1" width="88" height="34" rx="17" fill="#E2001A"/>
      <text x="45" y="24" textAnchor="middle" fill="white" fontSize="17" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="0.5">Bosch</text>
    </svg>
  ),
  Makita: (
    <svg viewBox="0 0 90 28" width="54" height="18">
      <rect width="90" height="28" fill="#00AEEF"/>
      <text x="45" y="20" textAnchor="middle" fill="white" fontSize="15" fontFamily="Arial,sans-serif" fontWeight="bold">makita</text>
    </svg>
  ),
  Stanley: (
    <svg viewBox="0 0 90 28" width="54" height="18">
      <rect width="90" height="28" fill="#FFD200"/>
      <text x="45" y="20" textAnchor="middle" fill="#1A1A1A" fontSize="13" fontFamily="Arial,sans-serif" fontWeight="900" letterSpacing="1">STANLEY</text>
    </svg>
  ),
  "3M": (
    <svg viewBox="0 0 54 54" width="40" height="40">
      <rect width="54" height="54" rx="6" fill="#E2001A"/>
      <text x="27" y="38" textAnchor="middle" fill="white" fontSize="26" fontFamily="Arial,sans-serif" fontWeight="900">3M</text>
    </svg>
  ),
  "Sherwin-Williams": (
    <svg viewBox="0 0 90 36" width="54" height="22">
      <rect width="90" height="36" fill="#003087"/>
      <text x="45" y="15" textAnchor="middle" fill="white" fontSize="10" fontFamily="Arial,sans-serif" fontWeight="bold">SHERWIN</text>
      <text x="45" y="28" textAnchor="middle" fill="white" fontSize="10" fontFamily="Arial,sans-serif" fontWeight="bold">WILLIAMS</text>
    </svg>
  ),
  Melón: (
    <svg viewBox="0 0 80 36" width="48" height="22">
      <rect width="80" height="36" rx="4" fill="#E8762B"/>
      <text x="40" y="24" textAnchor="middle" fill="white" fontSize="16" fontFamily="Arial,sans-serif" fontWeight="bold">Melón</text>
    </svg>
  ),
  Hilti: (
    <svg viewBox="0 0 80 30" width="48" height="19">
      <rect width="80" height="30" fill="#E30512"/>
      <text x="40" y="22" textAnchor="middle" fill="white" fontSize="17" fontFamily="Arial,sans-serif" fontWeight="900" letterSpacing="2">HILTI</text>
    </svg>
  ),
  Sika: (
    <svg viewBox="0 0 70 36" width="44" height="22">
      <rect width="70" height="36" rx="18" fill="#C1002B"/>
      <text x="35" y="24" textAnchor="middle" fill="white" fontSize="17" fontFamily="Arial,sans-serif" fontWeight="bold" fontStyle="italic">Sika</text>
    </svg>
  ),
  Tigre: (
    <svg viewBox="0 0 80 36" width="48" height="22">
      <rect width="80" height="36" fill="#F97316"/>
      <text x="40" y="24" textAnchor="middle" fill="white" fontSize="16" fontFamily="Arial,sans-serif" fontWeight="bold">Tigre</text>
    </svg>
  ),
  Madeco: (
    <svg viewBox="0 0 80 36" width="48" height="22">
      <rect width="80" height="36" fill="#1E40AF"/>
      <text x="40" y="24" textAnchor="middle" fill="white" fontSize="15" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="0.5">MADECO</text>
    </svg>
  ),
};

const BRANDS = [
  { id: 1,  name: "Bosch" },
  { id: 2,  name: "Makita" },
  { id: 3,  name: "Stanley" },
  { id: 4,  name: "3M" },
  { id: 5,  name: "Sherwin-Williams" },
  { id: 6,  name: "Melón" },
  { id: 7,  name: "Hilti" },
  { id: 8,  name: "Sika" },
  { id: 9,  name: "Tigre" },
  { id: 10, name: "Madeco" },
];

// ─── BRAND FLIP GRID ──────────────────────────────────────────────────────────
const BRAND_ICONS: Record<string, React.ReactNode> = {
  Bosch: (
    <svg viewBox="0 0 32 32" width="28" height="28">
      <ellipse cx="16" cy="16" rx="15" ry="15" fill="#E2001A"/>
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="11" fontFamily="Arial,sans-serif" fontWeight="bold">Bosch</text>
    </svg>
  ),
  Makita: (
    <svg viewBox="0 0 32 32" width="28" height="28">
      <rect width="32" height="32" rx="6" fill="#00AEEF"/>
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="10" fontFamily="Arial,sans-serif" fontWeight="bold">makita</text>
    </svg>
  ),
  Stanley: (
    <svg viewBox="0 0 32 32" width="28" height="28">
      <rect width="32" height="32" rx="6" fill="#FFD200"/>
      <text x="16" y="21" textAnchor="middle" fill="#111" fontSize="8" fontFamily="Arial,sans-serif" fontWeight="900" letterSpacing="0.5">STANLEY</text>
    </svg>
  ),
  "3M": (
    <svg viewBox="0 0 32 32" width="28" height="28">
      <rect width="32" height="32" rx="6" fill="#E2001A"/>
      <text x="16" y="22" textAnchor="middle" fill="white" fontSize="16" fontFamily="Arial,sans-serif" fontWeight="900">3M</text>
    </svg>
  ),
  "Sherwin-Williams": (
    <svg viewBox="0 0 32 32" width="28" height="28">
      <rect width="32" height="32" rx="6" fill="#003087"/>
      <text x="16" y="14" textAnchor="middle" fill="white" fontSize="7" fontFamily="Arial,sans-serif" fontWeight="bold">SHERWIN</text>
      <text x="16" y="23" textAnchor="middle" fill="white" fontSize="7" fontFamily="Arial,sans-serif" fontWeight="bold">WILLIAMS</text>
    </svg>
  ),
  Melón: (
    <svg viewBox="0 0 32 32" width="28" height="28">
      <rect width="32" height="32" rx="6" fill="#E8762B"/>
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="10" fontFamily="Arial,sans-serif" fontWeight="bold">Melón</text>
    </svg>
  ),
  Hilti: (
    <svg viewBox="0 0 32 32" width="28" height="28">
      <rect width="32" height="32" rx="6" fill="#E30512"/>
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="11" fontFamily="Arial,sans-serif" fontWeight="900" letterSpacing="1">HILTI</text>
    </svg>
  ),
  Sika: (
    <svg viewBox="0 0 32 32" width="28" height="28">
      <rect width="32" height="32" rx="16" fill="#C1002B"/>
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="12" fontFamily="Arial,sans-serif" fontWeight="bold" fontStyle="italic">Sika</text>
    </svg>
  ),
  Tigre: (
    <svg viewBox="0 0 32 32" width="28" height="28">
      <rect width="32" height="32" rx="6" fill="#F97316"/>
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="10" fontFamily="Arial,sans-serif" fontWeight="bold">Tigre</text>
    </svg>
  ),
  Madeco: (
    <svg viewBox="0 0 32 32" width="28" height="28">
      <rect width="32" height="32" rx="6" fill="#1E40AF"/>
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="9" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="0.5">MADECO</text>
    </svg>
  ),
};

const FLIP_DELAYS = [0, -1.2, -2.4, -3.6, -0.8, -2.0, -3.2, -4.4, -1.6, -4.0];

function BrandFlipGrid() {
  return (
    <>
      <style>{`
        @keyframes brand-flip {
          0%,42%  { transform: rotateY(0deg); }
          50%,88% { transform: rotateY(180deg); }
          96%,100%{ transform: rotateY(360deg); }
        }
        .brand-flip-inner {
          position:relative; width:100%; height:100%;
          transform-style: preserve-3d;
          animation: brand-flip 6s ease-in-out infinite;
        }
        .brand-face {
          position:absolute; inset:0; backface-visibility:hidden;
          display:flex; align-items:center; justify-content:center; gap:9px;
        }
        .brand-face-blur { transform: rotateY(180deg); filter: blur(5px); opacity:0.45; }
        @media (prefers-reduced-motion: reduce) {
          .brand-flip-inner { animation:none; transform:rotateY(0deg); }
        }
      `}</style>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-6 gap-y-8">
        {BRANDS.map((brand, i) => (
          <div
            key={brand.id}
            className="flex items-center justify-center"
            style={{ perspective: "700px", height: "44px" }}
          >
            <div
              className="brand-flip-inner"
              style={{ animationDelay: `${FLIP_DELAYS[i]}s` }}
            >
              {/* cara nítida */}
              <div className="brand-face">
                {BRAND_ICONS[brand.name]}
                <span className="font-bold text-[15px] text-[#1C1C1C] whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>
                  {brand.name}
                </span>
              </div>
              {/* cara blur */}
              <div className="brand-face brand-face-blur">
                {BRAND_ICONS[brand.name]}
                <span className="font-bold text-[15px] text-[#1C1C1C] whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>
                  {brand.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── FLIP WORDS ──────────────────────────────────────────────────────────────
const HERO_WORDS = ["martillos", "tornillos", "pintura", "taladros", "cemento", "llaves", "cables"];

function FlipWords() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"enter" | "leave">("enter");

  useEffect(() => {
    const id = setInterval(() => {
      setPhase("leave");
      setTimeout(() => {
        setIndex((i) => (i + 1) % HERO_WORDS.length);
        setPhase("enter");
      }, 380);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="inline-block whitespace-nowrap text-[#2ECC71]"
      style={{
        animation: phase === "enter"
          ? "flip-word-in 0.55s cubic-bezier(.25,.8,.35,1) forwards"
          : "flip-word-out 0.4s cubic-bezier(.4,0,.7,.2) forwards",
      }}
    >
      {HERO_WORDS[index]}
      <style>{`
        @keyframes flip-word-in {
          0%   { opacity:0; filter:blur(9px); transform:translateY(14px); }
          100% { opacity:1; filter:blur(0);   transform:translateY(0); }
        }
        @keyframes flip-word-out {
          0%   { opacity:1; filter:blur(0);   transform:translateY(0); }
          100% { opacity:0; filter:blur(9px); transform:translateY(-14px); }
        }
      `}</style>
    </span>
  );
}

// ─── CATEGORY HOVER EFFECT ───────────────────────────────────────────────────
const CAT_META: Record<string, { icon: React.ReactNode; desc: string }> = {
  electric:   { icon: <Zap size={22} />,         desc: "Taladros, amoladoras, sierras y más" },
  manual:     { icon: <Wrench size={22} />,       desc: "Martillos, llaves, destornilladores" },
  fixings:    { icon: <ScanBarcode size={22} />,  desc: "Tornillos, pernos, anclajes y tarugos" },
  paint:      { icon: <Paintbrush size={22} />,   desc: "Pinturas, barnices, rodillos y brochas" },
  electrical: { icon: <Plug size={22} />,         desc: "Cables, enchufes, protecciones y llaves" },
  plumbing:   { icon: <Droplets size={22} />,     desc: "Cañerías, llaves de paso y accesorios" },
  garden:     { icon: <Leaf size={22} />,         desc: "Mangueras, herramientas y riego" },
  safety:     { icon: <ShieldCheck size={22} />,  desc: "EPP, cascos, guantes y señalética" },
};

function CategoryHoverEffect({ navigate }: { navigate: NavigateFn }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2.5">
      {CATEGORIES.map((cat) => (
        <div
          key={cat.id}
          className="relative group"
          onMouseEnter={() => setHovered(cat.id)}
          onMouseLeave={() => setHovered(null)}
        >
          <button
            onClick={() => navigate("catalog")}
            className="relative w-full overflow-hidden bg-gray-800 aspect-square"
          >
            <img
              src={unsplash(cat.img, 600, 600)}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            {/* spotlight verde */}
            <AnimatePresence>
              {hovered === cat.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(46,204,113,0.35) 0%, transparent 65%)" }}
                />
              )}
            </AnimatePresence>
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-left">
              <span
                className="text-white font-black uppercase tracking-tight leading-none text-sm md:text-base"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {cat.name}
              </span>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── PRODUCT CARD ────────────────────────────────────────────────────────────
function ProductCard({
  product: p, navigate, addToCart, dark = false,
}: {
  product: Product; navigate: NavigateFn; addToCart: AddToCartFn; dark?: boolean;
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div
      onClick={() => navigate("product", p)}
      className={`group cursor-pointer border flex flex-col transition-colors rounded-sm overflow-hidden ${
        dark
          ? "bg-[#2A2A2A] border-[#383838] hover:border-[#2ECC71]"
          : "bg-white border-gray-200 hover:border-[#2ECC71]"
      }`}
    >
      <div className={`relative overflow-hidden aspect-[4/3] ${dark ? "bg-[#1A1A1A]" : "bg-gray-100"}`}>
        <img
          src={unsplash(p.img, 600, 450)}
          alt={p.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {p.badge && (
          <div
            className={`absolute top-2 left-2 text-xs font-black px-2 py-0.5 uppercase tracking-wide rounded-sm ${
              p.isOffer ? "bg-[#2ECC71] text-white" : "bg-[#1C1C1C] text-white"
            }`}
          >
            {p.badge}
          </div>
        )}
        {!p.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-black text-sm uppercase tracking-widest">No disponible</span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <p
          className={`text-xs mb-1 ${dark ? "text-gray-500" : "text-gray-400"}`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {p.sku}
        </p>
        <p className={`text-sm font-semibold leading-snug mb-3 flex-1 ${dark ? "text-white" : "text-[#1A1A1A]"}`}>
          {p.name}
        </p>
        <div className="flex items-end justify-between">
          <div>
            <p
              className="text-lg font-black text-[#2ECC71]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {fmt(p.price)}
            </p>
            {p.originalPrice && (
              <p className="text-xs text-gray-400 line-through">{fmt(p.originalPrice)}</p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!p.available}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-all rounded-sm ${
              added
                ? "bg-green-600 text-white"
                : !p.available
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#2ECC71] hover:bg-[#27AE60] text-white"
            }`}
          >
            {added ? <><Check size={11} /> Agregado</> : "+ Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HEADER ──────────────────────────────────────────────────────────────────
const NAV_ITEMS: { label: string; page: Page }[] = [
  { label: "Inicio",    page: "home" },
  { label: "Catálogo",  page: "catalog" },
  { label: "Nosotros",  page: "nosotros" },
  { label: "Contacto",  page: "contacto" },
];

function Header({ navigate, cartCount, currentUser, onLogout }: { navigate: NavigateFn; cartCount: number; currentUser: User | null; onLogout: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [highlightStyle, setHighlightStyle] = useState<{ width: number; x: number } | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  function handleMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
    if (!navRef.current) return;
    const linkRect = e.currentTarget.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    setHighlightStyle({ width: linkRect.width, x: linkRect.left - navRect.left });
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1C1C1C] border-b-[3px] border-[#2ECC71] px-4 py-0">
      <div className="relative max-w-7xl mx-auto flex items-center h-12">

        {/* brand — izquierda, fuera de la pill */}
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 shrink-0"
        >
          <img src={logoImg} alt="Logo Ferretería La Nona" className="h-8 w-auto object-contain mix-blend-screen" style={{ filter: "invert(1)" }} />
          <span className="font-semibold tracking-widest text-sm leading-none text-white uppercase" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}>Ferretería La Nona</span>
        </button>

        {/* pill — centrada absolutamente */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#2a2a2a] rounded-full px-1.5 py-1">

          {/* desktop nav links */}
          <div
            ref={navRef}
            className="relative hidden md:flex items-center gap-1"
            onMouseLeave={() => setHighlightStyle(null)}
          >
            <div
              className="absolute top-0 left-0 h-full bg-[#3a3a3a] rounded-full pointer-events-none transition-all duration-200"
              style={
                highlightStyle
                  ? { width: highlightStyle.width, transform: `translateX(${highlightStyle.x}px)`, opacity: 1 }
                  : { width: 0, opacity: 0 }
              }
            />
            {NAV_ITEMS.map(({ label, page }) => (
              <button
                key={page}
                onClick={() => navigate(page)}
                onMouseEnter={handleMouseEnter}
                className="relative z-10 px-4 py-1.5 text-[13px] font-medium text-gray-300 hover:text-white rounded-full whitespace-nowrap transition-colors duration-150"
              >
                {label}
              </button>
            ))}
          </div>

          {/* user indicator */}
          {currentUser ? (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-300">
              <div className="w-5 h-5 rounded-full bg-[#2ECC71] flex items-center justify-center text-white font-black text-[9px]">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[80px] truncate">{currentUser.name.split(" ")[0]}</span>
              <button onClick={onLogout} className="text-gray-500 hover:text-white text-[10px] transition-colors">(salir)</button>
            </div>
          ) : null}

          {/* cart CTA */}
          <button
            onClick={() => navigate("cart")}
            className="relative flex items-center gap-1.5 bg-[#2ECC71] hover:bg-[#27AE60] text-white text-[13px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap transition-colors"
          >
            <ShoppingCart size={14} />
            <span className="hidden sm:inline">Carro</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#E63946] text-white text-[10px] font-black rounded-full flex items-center justify-center px-0.5">
                {cartCount}
              </span>
            )}
          </button>

          {/* mobile burger */}
          <button
            className="md:hidden p-2 text-[#1C1C1C]"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* mobile dropdown */}
      {mobileOpen && (
        <div className="pointer-events-auto absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-4 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, page }) => (
            <button
              key={page}
              onClick={() => { navigate(page); setMobileOpen(false); }}
              className="text-left px-3 py-2.5 text-sm font-semibold text-[#1C1C1C] hover:bg-[#f5f5f5] rounded-xl transition-colors"
            >
              {label}
            </button>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2">
            <a href="tel:+56322214589" className="block px-3 py-2 text-xs text-gray-400 font-medium">
              +56 32 221 4589
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── TAPE RULE ANIMATION ─────────────────────────────────────────────────────
const TAPE_TICKS = Array.from({ length: 80 }, (_, i) => ({ major: i % 5 === 0, n: i }));

function TapeRule() {
  const allTicks = [
    ...TAPE_TICKS.map((t) => ({ ...t, uid: `a-${t.n}` })),
    ...TAPE_TICKS.map((t) => ({ ...t, uid: `b-${t.n}` })),
  ];
  return (
    <>
    <style>{`
      @keyframes tape-scroll {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .tape-inner { animation: none !important; }
      }
    `}</style>
    
    </>
  );
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
function HomePage({ navigate, addToCart, products }: { navigate: NavigateFn; addToCart: AddToCartFn; products: Product[] }) {
  const [searchVal, setSearchVal] = useState("");
  const offers = products.filter((p) => p.isOffer);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("catalog");
  };

  return (
    <div>
      {/* Hero */}
      <HeroSlideshow onSearch={handleSearch} searchVal={searchVal} setSearchVal={setSearchVal} />

      {/* Category Hover Effect */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-2">
          <h2
            className="text-2xl md:text-3xl font-semibold uppercase"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}
          >
            Categorías
          </h2>
          <button
            onClick={() => navigate("catalog")}
            className="text-sm font-bold text-[#2ECC71] hover:underline flex items-center gap-1"
          >
            Ver todo <ChevronRight size={14} />
          </button>
        </div>
        <CategoryHoverEffect navigate={navigate} />
      </section>

      {/* Offers */}
      {offers.length > 0 && (
        <section className="bg-[#1C1C1C] py-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              
              <h2
                className="text-2xl font-semibold text-white uppercase"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}
              >
                Precios especiales
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {offers.map((p) => (
                <ProductCard key={p.id} product={p} navigate={navigate} addToCart={addToCart} dark />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brands */}
      <section className="border-y border-gray-200 py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-10 text-center">
            Marcas que trabajamos
          </p>
          <BrandFlipGrid />
        </div>
      </section>

      {/* Location & Hours */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2
              className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Dónde Retiramos
            </h2>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#2ECC71] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Av. Obispo Valdés Subercaseaux 533, Placilla, Valparaíso</p>
                  <p className="text-sm text-gray-500">Placilla, Valparaíso · Estacionamiento disponible</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-[#2ECC71] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-sm mb-1">Horario de retiro</p>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <div className="flex gap-4">
                      <span className="w-24 font-semibold">Lun – Vie</span>
                      <span>08:00 – 18:30</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="w-24 font-semibold">Sábado</span>
                      <span>09:00 – 14:00</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="w-24 font-semibold text-red-500">Domingo</span>
                      <span className="text-red-500">Cerrado</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-[#2ECC71] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-sm">+56 32 221 4589</p>
                  <p className="text-sm text-gray-500">WhatsApp: +56 9 8765 4321</p>
                </div>
              </div>
            </div>

            
          </div>

          <div className="relative overflow-hidden bg-gray-900" style={{ height: "380px" }}>
            <ImageWithFallback
              src={storeFront}
              alt="Local Ferretería La Nona — Av. Obispo Valdés Subercaseaux 533, Placilla, Valparaíso"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#2ECC71] shrink-0" />
                <div>
                  <p className="font-black text-white text-sm leading-tight">Av. Obispo Valdés Subercaseaux 533</p>
                  <p className="text-xs text-gray-300">Placilla, Valparaíso</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── CATALOG PAGE ─────────────────────────────────────────────────────────────
function CatalogPage({ navigate, addToCart, products }: { navigate: NavigateFn; addToCart: AddToCartFn; products: Product[] }) {
  const [catFilter, setCatFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [inStock, setInStock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");

  const allBrands = [...new Set(products.map((p) => p.brand))].sort();

  const filtered = products.filter((p) => {
    if (catFilter && p.category !== catFilter) return false;
    if (brandFilter && p.brand !== brandFilter) return false;
    if (p.price > maxPrice) return false;
    if (inStock && !p.available) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setCatFilter("");
    setBrandFilter("");
    setMaxPrice(200000);
    setInStock(false);
  };

  const FilterPanel = () => (
    <div className="space-y-6 text-sm">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Categoría</p>
        <div className="space-y-0.5">
          {[{ id: "", name: "Todas las categorías" }, ...CATEGORIES].map((c) => (
            <button
              key={c.id}
              onClick={() => setCatFilter(c.id)}
              className={`w-full text-left py-1.5 px-2 transition-colors ${
                catFilter === c.id
                  ? "bg-[#2ECC71] text-white font-bold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Marca</p>
        <div className="space-y-0.5">
          {[{ brand: "" }, ...allBrands.map((b) => ({ brand: b }))].map(({ brand }) => (
            <button
              key={brand}
              onClick={() => setBrandFilter(brand)}
              className={`w-full text-left py-1.5 px-2 transition-colors ${
                brandFilter === brand
                  ? "bg-[#2ECC71] text-white font-bold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {brand || "Todas las marcas"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Precio máximo</p>
        <input
          type="range"
          min={3000}
          max={200000}
          step={1000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#2ECC71]"
        />
        <p className="font-black text-[#2ECC71] mt-1" style={{ fontFamily: "var(--font-display)" }}>
          {fmt(maxPrice)}
        </p>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          className="accent-[#2ECC71] w-4 h-4"
        />
        <span className="font-medium text-gray-700">Solo disponibles</span>
      </label>

      {(catFilter || brandFilter || maxPrice < 200000 || inStock) && (
        <button
          onClick={clearFilters}
          className="text-xs text-[#2ECC71] font-bold hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
        <button onClick={() => navigate("home")} className="hover:text-[#2ECC71] transition-colors">
          Inicio
        </button>
        <ChevronRight size={11} />
        <span className="font-semibold text-gray-900">Catálogo</span>
      </div>

      <div className="flex gap-6">
        <aside className="hidden md:block w-52 shrink-0">
          <p
            className="text-lg font-black uppercase tracking-tight mb-4 pb-2 border-b-2 border-[#2ECC71]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Filtros
          </p>
          <FilterPanel />
        </aside>

        <div className="flex-1 min-w-0">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="md:hidden flex items-center justify-between w-full mb-4 border border-gray-300 px-3 py-2.5 text-sm font-bold bg-white"
          >
            <span className="flex items-center gap-2">
              <Filter size={14} /> Filtros
            </span>
            {filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {filtersOpen && (
            <div className="md:hidden border border-gray-200 p-4 mb-4 bg-white">
              <FilterPanel />
            </div>
          )}

          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, marca o código SKU…"
              className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-sm bg-white outline-none focus:border-[#2ECC71] transition-colors"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">{filtered.length}</span>{" "}
              producto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} addToCart={addToCart} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Package size={44} className="mx-auto mb-4 opacity-25" />
              <p className="font-bold text-gray-600 mb-1">No hay productos con esos filtros</p>
              <p className="text-sm mb-4">Intenta con otros parámetros</p>
              <button
                onClick={clearFilters}
                className="text-[#2ECC71] text-sm font-black hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT PAGE ─────────────────────────────────────────────────────────────
function ProductPage({
  product: p, navigate, addToCart, products,
}: {
  product: Product; navigate: NavigateFn; addToCart: AddToCartFn; products: Product[];
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(p.variants?.options[0] ?? "");

  const related = products.filter((r) => r.category === p.category && r.id !== p.id).slice(0, 3);

  const handleAdd = () => {
    addToCart(p, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const stockStatus = p.available
    ? { label: "Disponible en tienda", color: "text-green-700", dot: "bg-green-500" }
    : { label: "No disponible", color: "text-red-600", dot: "bg-red-500" };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate("catalog")}
        className="flex items-center gap-1 text-sm text-gra rounded-[2px]y-500 hover:text-[#2ECC71] mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Volver al catálogo
      </button>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-14">
        {/* Image */}
        <div className="bg-gray-100 aspect-square overflow-hidden">
          <img
            src={unsplash(p.img, 900, 900)}
            alt={p.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div>
          {p.badge && (
            <span
              className={`inline-block text-xs font-black px-2 py-0.5 uppercase tracking-widest mb-3 ${
                p.isOffer ? "bg-[#2ECC71] text-white" : "bg-[#1C1C1C] text-white"
              }`}
            >
              {p.badge}
            </span>
          )}

          <p className="text-xs text-gray-400 mb-0.5 font-semibold uppercase tracking-widest">
            {p.brand}
          </p>
          <p
            className="text-xs mb-2"
            style={{ fontFamily: "var(--font-mono)", color: "#8a8a8a" }}
          >
            SKU: {p.sku}
          </p>

          <h1
            className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {p.name}
          </h1>

          <div className="mb-4">
            <p
              className="text-4xl font-black text-[#2ECC71] leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {fmt(p.price)}
            </p>
            {p.originalPrice && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-400 line-through">{fmt(p.originalPrice)}</p>
                <span className="bg-[#2ECC71] text-white text-xs font-black px-1.5 py-0.5">
                  -{Math.round((1 - p.price / p.originalPrice) * 100)}%
                </span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">Precio en pesos chilenos. IVA incluido.</p>
          </div>

          {/* Stock indicator */}
          <div className={`flex items-center gap-2 text-sm font-bold mb-5 ${stockStatus.color}`}>
            <div className={`w-2 h-2 rounded-full ${stockStatus.dot}`} />
            {stockStatus.label}
          </div>

          {/* Variants */}
          {p.variants && (
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                {p.variants.type === "color" ? "Color" : "Talla"}:{" "}
                <span className="text-gray-900 normal-case tracking-normal">{selectedVariant}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {p.variants.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedVariant(opt)}
                    className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
                      selectedVariant === opt
                        ? "bg-[#1C1C1C] text-white border-[#1C1C1C]"
                        : "border-gray-300 text-gray-700 hover:border-[#2ECC71] hover:text-[#2ECC71]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Add */}
          <div className="flex items-stretch gap-3 mb-4">
            <div className="flex items-center border-2 border-gray-300">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-11 h-12 flex items-center justify-center hover:bg-gray-100 font-black text-lg transition-colors"
              >
                −
              </button>
              <span
                className="w-12 text-center font-black text-base"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-11 h-12 flex items-center justify-center hover:bg-gray-100 font-black text-lg transition-colors"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={!p.available}
              className={`flex-1 py-3 font-black text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                added
                  ? "bg-green-600 text-white"
                  : !p.available
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#2ECC71] hover:bg-[#27AE60] text-white"
              }`}
            >
              {added ? (
                <><Check size={15} /> Agregado al carro</>
              ) : (
                "Agregar al carro"
              )}
            </button>
          </div>

          {/* Pickup notice */}
          <div className="flex items-start gap-2.5 bg-gray-50 border border-gray-200 px-3.5 py-3 text-xs text-gray-600">
            <Store size={13} className="text-[#2ECC71] mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-gray-800">Solo retiro en tienda</p>
              <p>Av. Obispo Valdés Subercaseaux 533, Placilla, Valparaíso · Lun–Vie 8:00–18:30 · Sáb 9:00–14:00</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 pt-5 border-t border-gray-200">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Descripción</p>
            <p className="text-sm text-gray-700 leading-relaxed">{p.description}</p>
          </div>
        </div>
      </div>

      {/* Specs table */}
      <div className="mb-14">
        <h2
          className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Especificaciones Técnicas
        </h2>
        <div className="border border-gray-200 overflow-hidden max-w-2xl">
          {p.specs.map((s, i) => (
            <div key={s.key} className={`grid grid-cols-2 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
              <div className="px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200">{s.key}</div>
              <div className="px-4 py-2.5 text-gray-900 font-medium">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2
            className="text-xl md:text-2xl font-black uppercase tracking-tight mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Productos Relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} navigate={navigate} addToCart={addToCart} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BOLT PASSWORD INPUT ─────────────────────────────────────────────────────
function BoltPasswordInput({
  value, onChange, placeholder, hasError,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; hasError?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const BoltIcon = () => (
    <svg viewBox="0 0 24 24" width="17" height="17">
      <path d="M12 2.5 20 7v10l-8 4.5-8-4.5V7z" fill="#1C1C1C" stroke="#1C1C1C" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .bolt-cell { perspective: 200px; width: 20px; height: 26px; flex-shrink: 0; }
        .bolt-inner {
          position: relative; width: 100%; height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(.4,1.6,.4,1);
          transition-delay: calc(var(--bi, 0) * 0.06s);
        }
        .bolt-inner.show { transform: rotateX(180deg); }
        .bolt-face {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          backface-visibility: hidden;
        }
        .bolt-back { transform: rotateX(180deg); font-family: var(--font-mono); font-size: 14px; font-weight: 500; color: #1C1C1C; }
        .wrench-icon { transition: transform 0.35s cubic-bezier(.4,1.6,.4,1); }
        .wrench-active .wrench-icon { transform: rotate(-55deg); }
      `}</style>
      <div
        onClick={() => inputRef.current?.focus()}
        className={`relative flex items-center rounded-sm bg-[#ECEAE4] border transition-colors cursor-text ${
          hasError ? "border-red-400" : "border-gray-200 focus-within:border-[#2ECC71]"
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text"
        />
        <div className="flex-1 flex items-center gap-[3px] px-3 py-2 min-h-[44px] overflow-hidden">
          {value.length === 0 ? (
            <span className="text-gray-400 text-sm">{placeholder ?? "••••••••"}</span>
          ) : (
            value.split("").map((ch, i) => (
              <div key={i} className="bolt-cell" style={{ "--bi": i } as React.CSSProperties}>
                <div className={`bolt-inner${revealed ? " show" : ""}`}>
                  <div className="bolt-face"><BoltIcon /></div>
                  <div className="bolt-face bolt-back">{ch}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setRevealed((v) => !v); }}
          className={`relative z-20 w-10 h-10 flex items-center justify-center rounded-sm text-[#1C1C1C] hover:bg-[#E0DDD7] transition-colors shrink-0 ${revealed ? "wrench-active" : ""}`}
          title={revealed ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          <svg className="wrench-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>
          </svg>
        </button>
      </div>
    </>
  );
}

// ─── LOCK SUBMIT BUTTON ───────────────────────────────────────────────────────
function LockButton({ label }: { label: string }) {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    if (unlocked) { const t = setTimeout(() => setUnlocked(false), 900); return () => clearTimeout(t); }
  }, [unlocked]);

  return (
    <button
      type="submit"
      onClick={() => setUnlocked(true)}
      className="w-full bg-[#1C1C1C] hover:bg-[#333] text-white py-3 font-bold text-sm rounded-sm transition-colors flex items-center justify-center gap-2"
    >
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="11" width="16" height="9" rx="2"/>
        <path
          style={{
            transformOrigin: "8px 6px",
            transition: "transform 0.3s cubic-bezier(.4,1.6,.4,1)",
            transform: unlocked ? "translateY(-3px) rotate(-20deg)" : "none",
          }}
          d="M8 11V7a4 4 0 0 1 8 0v4"
        />
      </svg>
      {label}
    </button>
  );
}

// ─── AUTH PAGE ───────────────────────────────────────────────────────────────
function AuthPage({
  navigate, onAuth, onGuest,
}: {
  navigate: NavigateFn;
  onAuth: (user: User) => void;
  onGuest: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registered, setRegistered] = useState<User[]>([]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const setVal = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const fieldCls = (err?: string) =>
    `w-full border ${err ? "border-red-400" : "border-gray-200"} rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#2ECC71] transition-colors bg-[#ECEAE4]`;

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = "Ingresa tu correo";
    if (!form.password)     errs.password = "Ingresa tu contraseña";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const found = registered.find((u) => u.email === form.email);
    if (!found) { setErrors({ email: "No existe una cuenta con ese correo" }); return; }
    onAuth(found);
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim())  errs.name    = "Ingresa tu nombre";
    if (!form.email.trim()) errs.email   = "Ingresa tu correo";
    if (!form.phone.trim()) errs.phone   = "Ingresa tu teléfono";
    if (!form.password)     errs.password = "Ingresa una contraseña";
    if (form.password !== form.confirm) errs.confirm = "Las contraseñas no coinciden";
    if (registered.find((u) => u.email === form.email)) errs.email = "Ya existe una cuenta con ese correo";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const user: User = { name: form.name, email: form.email, phone: form.phone };
    setRegistered((prev) => [...prev, user]);
    onAuth(user);
  }

  return (
    <div
      className="min-h-[85vh] flex items-center justify-center px-4 py-12"
      style={{
        background: `
          linear-gradient(rgba(244,242,238,0.85), rgba(244,242,238,0.85)),
          repeating-linear-gradient(0deg, rgba(28,28,28,0.06) 0 1px, transparent 1px 34px),
          repeating-linear-gradient(90deg, rgba(28,28,28,0.06) 0 1px, transparent 1px 34px)
        `,
      }}
    >
      <div className="w-full max-w-sm">

        {/* card */}
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)] px-8 py-9">

          {/* brand */}
          <div className="flex flex-col items-center mb-7">
            <img src={logoImg} alt="Logo" className="h-14 w-auto object-contain mb-3" />
            <p className="font-semibold text-xs uppercase tracking-[0.2em] text-[#2ECC71]">Acceso clientes</p>
          </div>

          {/* tabs */}
          <div className="flex border-b border-gray-100 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setErrors({}); }}
                className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors ${
                  mode === m ? "border-[#2ECC71] text-[#1C1C1C]" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            ))}
          </div>

          {/* login */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">Correo</label>
                <input value={form.email} onChange={set("email")} placeholder="tucorreo@mail.com" className={fieldCls(errors.email)} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">Contraseña</label>
                <BoltPasswordInput value={form.password} onChange={setVal("password")} placeholder="tu contraseña" hasError={!!errors.password} />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                <p className="text-[11px] text-gray-400 mt-1.5">Toca la llave para ver tu contraseña</p>
              </div>
              <LockButton label="Iniciar sesión y continuar" />
            </form>
          )}

          {/* register */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">Nombre completo</label>
                <input value={form.name} onChange={set("name")} placeholder="Juan Pérez" className={fieldCls(errors.name)} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">Correo</label>
                <input value={form.email} onChange={set("email")} placeholder="tucorreo@mail.com" className={fieldCls(errors.email)} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">Teléfono</label>
                <input value={form.phone} onChange={set("phone")} placeholder="+56 9 1234 5678" className={fieldCls(errors.phone)} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">Contraseña</label>
                <BoltPasswordInput value={form.password} onChange={setVal("password")} placeholder="elige una contraseña" hasError={!!errors.password} />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">Confirmar contraseña</label>
                <BoltPasswordInput value={form.confirm} onChange={setVal("confirm")} placeholder="repite la contraseña" hasError={!!errors.confirm} />
                {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
              </div>
              <div className="pt-1">
                <LockButton label="Crear cuenta y continuar" />
              </div>
            </form>
          )}

          {/* divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300">o</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* guest */}
          <button
            onClick={onGuest}
            className="w-full border border-gray-200 hover:border-gray-300 text-[#1C1C1C] py-2.5 font-semibold text-sm rounded-sm transition-colors flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <Package size={14} />
            Continuar sin registrarme
          </button>
          <p className="text-center text-[11px] text-gray-400 mt-3">
            Sin cuenta no podrás ver el historial de tus pedidos.
          </p>
        </div>

        {/* back link */}
        <button onClick={() => navigate("cart")} className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mt-5 w-full transition-colors">
          <ArrowLeft size={13} /> Volver al carro
        </button>
      </div>
    </div>
  );
}

// ─── CART PAGE ───────────────────────────────────────────────────────────────
function CartPage({
  cart, updateQty, cartTotal, navigate,
}: {
  cart: CartItem[]; updateQty: (id: number, qty: number) => void;
  cartTotal: number; navigate: NavigateFn;
}) {
  if (cart.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <ShoppingCart size={52} className="mx-auto mb-5 text-gray-300" />
        <h2
          className="text-2xl font-black uppercase tracking-tight mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Tu carro está vacío
        </h2>
        <p className="text-gray-500 text-sm mb-7">Agrega productos desde el catálogo para continuar</p>
        <button
          onClick={() => navigate("catalog")}
          className="bg-[#2ECC71] hover:bg-[#27AE60] text-white px-8 py-3 font-black uppercase tracking-widest text-sm transition-colors"
        >
          Ir al catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1
        className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Carro de Compras
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-3 border border-gray-200 bg-white p-3">
              <div className="w-20 h-20 bg-gray-100 shrink-0 overflow-hidden">
                <img
                  src={unsplash(item.img, 160, 160)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-xs text-gray-400 mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {item.sku}
                </p>
                <p className="text-sm font-semibold leading-snug">{item.name}</p>

                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center border border-gray-300">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold text-sm transition-colors"
                    >
                      −
                    </button>
                    <span
                      className="w-8 text-center text-sm font-black"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold text-sm transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p
                      className="font-black text-[#2ECC71]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {fmt(item.price * item.qty)}
                    </p>
                    {item.qty > 1 && (
                      <p className="text-xs text-gray-400">{fmt(item.price)} c/u</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => updateQty(item.id, 0)}
                className="text-gray-300 hover:text-red-500 self-start transition-colors shrink-0 p-0.5"
              >
                <X size={15} />
              </button>
            </div>
          ))}

          <button
            onClick={() => navigate("catalog")}
            className="flex items-center gap-1 text-sm font-bold text-[#2ECC71] hover:underline mt-1"
          >
            <ArrowLeft size={13} /> Seguir comprando
          </button>
        </div>

        {/* Summary */}
        <div>
          <div className="border border-gray-200 bg-white sticky top-20">
            <div className="p-4 border-b border-gray-200">
              <h3
                className="font-black uppercase tracking-tight text-lg"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Resumen del pedido
              </h3>
            </div>

            <div className="p-4 space-y-2 text-sm border-b border-gray-200">
              {cart.map((i) => (
                <div key={i.id} className="flex justify-between gap-2">
                  <span className="text-gray-600 leading-snug">
                    {i.name} <span className="text-gray-400">×{i.qty}</span>
                  </span>
                  <span className="font-semibold shrink-0 ml-2">{fmt(i.price * i.qty)}</span>
                </div>
              ))}
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-black text-sm uppercase tracking-wide">Total</span>
                <span
                  className="font-black text-2xl text-[#2ECC71]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {fmt(cartTotal)}
                </span>
              </div>
            </div>

            <div className="bg-[#1C1C1C] p-4 text-xs text-gray-300">
              <div className="flex items-center gap-2 mb-1.5">
                <Store size={12} className="text-[#2ECC71] shrink-0" />
                <span className="font-black text-[#2ECC71] uppercase tracking-widest text-[11px]">
                  Solo retiro en tienda
                </span>
              </div>
              <p>Av. Obispo Valdés Subercaseaux 533, Placilla, Valparaíso</p>
              <p className="text-gray-500">Lun–Vie 08:00–18:30 · Sáb 09:00–14:00</p>
            </div>

            <div className="p-4">
              <button
                onClick={() => navigate("checkout")}
                className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white py-4 font-black uppercase tracking-widest text-sm transition-colors"
              >pagar →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKOUT PAGE ───────────────────────────────────────────────────────────
function CheckoutPage({
  cart, cartTotal, navigate, setOrderNum, onOrderPlaced, prefill,
}: {
  cart: CartItem[]; cartTotal: number; navigate: NavigateFn;
  setOrderNum: (n: string) => void;
  onOrderPlaced: (order: Order) => void;
  prefill?: User;
}) {
  const [form, setForm] = useState({
    name: prefill?.name ?? "", email: prefill?.email ?? "", phone: prefill?.phone ?? "",
    rut: "", timeSlot: "", payment: "webpay", docType: "boleta",
  });
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    rut: "", razonSocial: "", giro: "", direccion: "", comuna: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateRut = (rut: string): boolean => {
    const clean = rut.replace(/[\.\-]/g, "").toUpperCase();
    if (clean.length < 2) return false;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);
    if (!/^\d+$/.test(body)) return false;
    let sum = 0, mul = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i]) * mul;
      mul = mul === 7 ? 2 : mul + 1;
    }
    const expected = 11 - (sum % 11);
    const expectedDv = expected === 11 ? "0" : expected === 10 ? "K" : String(expected);
    return dv === expectedDv;
  };

  const slots = [
    "08:00–09:00", "09:00–10:00", "10:00–11:00", "11:00–12:00",
    "14:00–15:00", "15:00–16:00", "16:00–17:00", "17:00–18:30",
  ];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Ingresa tu nombre completo";
    if (!form.email.includes("@")) e.email = "Email inválido";
    if (form.phone.replace(/\D/g, "").length < 9) e.phone = "Teléfono inválido";
    if (!form.rut.trim()) e.rut = "Ingresa tu RUT";
    if (form.docType === "factura") {
      if (!invoiceData.rut.trim()) e.invoiceRut = "Ingresa el RUT de la empresa";
      else if (!validateRut(invoiceData.rut)) e.invoiceRut = "RUT inválido, verifica el dígito verificador";
      if (!invoiceData.razonSocial.trim()) e.razonSocial = "Ingresa la razón social";
      if (!invoiceData.giro.trim()) e.giro = "Ingresa el giro comercial";
      if (!invoiceData.direccion.trim()) e.direccion = "Ingresa la dirección";
      if (!invoiceData.comuna.trim()) e.comuna = "Ingresa la comuna";
    }
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const num = `LN-${Date.now().toString().slice(-6)}`;
    setOrderNum(num);
    onOrderPlaced({
      id: Date.now().toString(),
      num,
      date: new Date().toLocaleString("es-CL"),
      customer: { name: form.name, email: form.email, phone: form.phone, address: form.timeSlot },
      items: cart,
      total: cartTotal,
      status: "pendiente",
      docType: form.docType as "boleta" | "factura",
      ...(form.docType === "factura" && { invoiceData }),
    });
    navigate("confirmation");
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const inputCls = (err?: string) =>
    `w-full border ${err ? "border-red-400" : "border-gray-300"} rounded-sm px-3 py-2.5 text-sm focus:border-[#2ECC71] outline-none transition-colors bg-white`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("cart")} className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1
          className="text-2xl md:text-3xl font-black uppercase tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Finalizar Pedido
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Personal data */}
          <div className="border border-gray-200 bg-white">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h2
                className="font-black uppercase tracking-tight text-base"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Datos del cliente
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Nombre completo", key: "name", placeholder: "Juan Pérez González", type: "text" },
                { label: "RUT", key: "rut", placeholder: "12.345.678-9", type: "text" },
                { label: "Email", key: "email", placeholder: "juan@correo.cl", type: "email" },
                { label: "Teléfono", key: "phone", placeholder: "+56 9 1234 5678", type: "tel" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={set(key)}
                    placeholder={placeholder}
                    className={inputCls(errors[key])}
                  />
                  {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Pickup time */}
          

          {/* Payment */}
          <div className="border border-gray-200 bg-white">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h2
                className="font-black uppercase tracking-tight text-base"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Método de pago
              </h2>
            </div>
            <div className="p-5 space-y-2.5">
              {[
                {
                  id: "webpay",
                  label: "Webpay Plus",
                  sub: "Tarjeta de débito, crédito y prepago",
                },
                {
                  id: "transfer",
                  label: "Transferencia bancaria",
                  sub: "Banco Estado · Cta. cte. 00-123456-7 · RUT 76.543.210-8",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${
                    form.payment === opt.id
                      ? "border-[#2ECC71] bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={form.payment === opt.id}
                    onChange={() => setForm((f) => ({ ...f, payment: opt.id }))}
                    className="mt-0.5 accent-[#2ECC71]"
                  />
                  <div>
                    <p className="font-bold text-sm text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Document type */}
          <div className="border border-gray-200 bg-white">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h2
                className="font-black uppercase tracking-tight text-base"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Documento tributario
              </h2>
            </div>
            <div className="p-5 space-y-2.5">
              {[
                {
                  id: "boleta",
                  label: "Boleta",
                  sub: "Documento para uso personal o consumidor final",
                },
                {
                  id: "factura",
                  label: "Factura",
                  sub: "Documento para empresas o uso tributario (requiere RUT empresa)",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${
                    form.docType === opt.id
                      ? "border-[#2ECC71] bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="docType"
                    value={opt.id}
                    checked={form.docType === opt.id}
                    onChange={() => setForm((f) => ({ ...f, docType: opt.id }))}
                    className="mt-0.5 accent-[#2ECC71]"
                  />
                  <div>
                    <p className="font-bold text-sm text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>
                  </div>
                </label>
              ))}

              {/* Factura fields with smooth transition */}
              <AnimatePresence>
                {form.docType === "factura" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 space-y-3 border-t border-gray-200 mt-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide pt-1">Datos de facturación</p>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">RUT empresa *</label>
                        <input
                          type="text"
                          placeholder="12.345.678-9"
                          value={invoiceData.rut}
                          onChange={(e) => setInvoiceData((d) => ({ ...d, rut: e.target.value }))}
                          className={inputCls(errors.invoiceRut)}
                        />
                        {errors.invoiceRut && <p className="text-red-500 text-xs mt-1">{errors.invoiceRut}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Razón social *</label>
                        <input
                          type="text"
                          placeholder="Empresa S.A."
                          value={invoiceData.razonSocial}
                          onChange={(e) => setInvoiceData((d) => ({ ...d, razonSocial: e.target.value }))}
                          className={inputCls(errors.razonSocial)}
                        />
                        {errors.razonSocial && <p className="text-red-500 text-xs mt-1">{errors.razonSocial}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Giro comercial *</label>
                        <input
                          type="text"
                          placeholder="Construcción y ferretería"
                          value={invoiceData.giro}
                          onChange={(e) => setInvoiceData((d) => ({ ...d, giro: e.target.value }))}
                          className={inputCls(errors.giro)}
                        />
                        {errors.giro && <p className="text-red-500 text-xs mt-1">{errors.giro}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Dirección *</label>
                        <input
                          type="text"
                          placeholder="Av. Argentina 123"
                          value={invoiceData.direccion}
                          onChange={(e) => setInvoiceData((d) => ({ ...d, direccion: e.target.value }))}
                          className={inputCls(errors.direccion)}
                        />
                        {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Comuna *</label>
                        <input
                          type="text"
                          placeholder="Valparaíso"
                          value={invoiceData.comuna}
                          onChange={(e) => setInvoiceData((d) => ({ ...d, comuna: e.target.value }))}
                          className={inputCls(errors.comuna)}
                        />
                        {errors.comuna && <p className="text-red-500 text-xs mt-1">{errors.comuna}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="border border-gray-200 bg-white sticky top-20">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3
                className="font-black uppercase tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Tu pedido
              </h3>
            </div>

            <div className="p-4 space-y-2.5 text-sm border-b border-gray-200">
              {cart.map((i) => (
                <div key={i.id} className="flex justify-between gap-2">
                  <span className="text-gray-600 leading-snug">
                    {i.name}
                    <span className="text-gray-400"> ×{i.qty}</span>
                  </span>
                  <span className="font-semibold shrink-0">{fmt(i.price * i.qty)}</span>
                </div>
              ))}
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-black text-sm uppercase">Total</span>
                <span
                  className="font-black text-xl text-[#2ECC71]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {fmt(cartTotal)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 flex items-start gap-2">
              <Store size={12} className="text-[#2ECC71] mt-0.5 shrink-0" />
              <span>Sin despacho a domicilio. Solo retiro en Av. Obispo Valdés Subercaseaux 533.</span>
            </div>

            <div className="p-4">
              <button
                type="submit"
                className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white py-4 font-black uppercase tracking-widest text-sm transition-colors"
              >
                Confirmar pedido →
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── CONFIRMATION PAGE ────────────────────────────────────────────────────────
function ConfirmationPage({ orderNum, order, navigate }: { orderNum: string; order: Order | null; navigate: NavigateFn }) {
  const pickupCode = orderNum.replace("LN-", "");

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-14">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-500 flex items-center justify-center mx-auto mb-4 rounded-full">
          <Check size={32} className="text-white" />
        </div>
        <h1
          className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ¡Pedido Confirmado!
        </h1>
        <p className="text-gray-500 text-sm">Revisa tu email. Te enviamos la confirmación.</p>
      </div>

      {/* Main card */}
      <div className="border-2 border-[#1C1C1C] bg-white mb-5">
        <div className="p-5 grid grid-cols-2 gap-4 border-b border-gray-200">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">N° de pedido</p>
            <p className="font-black text-lg text-[#1C1C1C]" style={{ fontFamily: "var(--font-display)" }}>
              {orderNum}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Código de retiro</p>
            <p className="font-black text-4xl text-[#2ECC71] leading-none" style={{ fontFamily: "var(--font-mono)" }}>
              {pickupCode}
            </p>
          </div>
        </div>
        {order && (
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Documento tributario</p>
            <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-sm ${order.docType === "factura" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
              {order.docType === "factura" ? "Factura" : "Boleta"}
            </span>
          </div>
        )}

        {/* Items del pedido */}
        {order && order.items.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="px-5 pt-4 pb-1">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Productos pedidos</p>
            </div>
            <div className="px-5 pb-4 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded bg-[#2ECC71]/10 text-[#2ECC71] text-[10px] font-black flex items-center justify-center shrink-0">
                      {item.qty}
                    </span>
                    <span className="text-sm text-[#1C1C1C] truncate">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-[#1C1C1C] shrink-0">{fmt(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">Total</span>
              <span className="font-black text-lg text-[#2ECC71]" style={{ fontFamily: "var(--font-display)" }}>
                {fmt(order.total)}
              </span>
            </div>
          </div>
        )}

        <div className="bg-[#1C1C1C] p-5 space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-[#2ECC71] mb-3">Información de retiro</p>

          <div className="flex items-start gap-3">
            <MapPin size={15} className="text-[#2ECC71] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Av. Obispo Valdés Subercaseaux 533, Placilla, Valparaíso</p>
              <p className="text-xs text-gray-400 mt-0.5">Mesón de atención · Acceso principal</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock size={15} className="text-[#2ECC71] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Lun–Vie: 08:00–18:30 · Sáb: 09:00–14:00</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Tu pedido estará listo en <strong className="text-white">2 horas hábiles</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Package size={15} className="text-[#2ECC71] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Documentos para retirar</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Cédula de identidad + número de pedido{" "}
                <strong className="text-[#2ECC71]">{orderNum}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 no-print">
        <button
          onClick={() => navigate("home")}
          className="flex-1 border-2 border-[#1C1C1C] py-3.5 font-black text-sm uppercase tracking-widest hover:bg-[#1C1C1C] hover:text-white transition-colors"
        >
          Volver al inicio
        </button>
        <button
          onClick={handleDownloadPdf}
          className="flex-1 border-2 border-[#1C1C1C] py-3.5 font-black text-sm uppercase tracking-widest hover:bg-[#1C1C1C] hover:text-white transition-colors"
        >
          Descargar ticket PDF
        </button>
        <button
          onClick={() => navigate("catalog")}
          className="flex-1 bg-[#2ECC71] hover:bg-[#27AE60] text-white py-3.5 font-black text-sm uppercase tracking-widest transition-colors"
        >
          Seguir comprando
        </button>
      </div>
    </div>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer({ navigate }: { navigate: NavigateFn }) {
  return (
    <footer className="bg-[#1C1C1C] text-gray-400 pt-10 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs mb-8">
          <div>
            <p
              className="font-black text-white text-sm uppercase tracking-tight mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ferretería La Nona
            </p>
            <p>Av. Obispo Valdés Subercaseaux 533</p>
            <p>Valparaíso, Chile</p>
          </div>
          <div>
            <p className="font-bold text-white uppercase tracking-wide text-[10px] mb-3">Contacto</p>
            <p>+56 32 221 4589</p>
            <p>ventas@ferreterilanona.cl</p>
          </div>
          <div>
            <p className="font-bold text-white uppercase tracking-wide text-[10px] mb-3">Horarios</p>
            <p>Lun–Vie: 08:00–18:30</p>
            <p>Sábado: 09:00–14:00</p>
            <p className="text-red-500">Domingo: Cerrado</p>
          </div>
          <div>
            <p className="font-bold text-white uppercase tracking-wide text-[10px] mb-3">Tienda online</p>
            <button onClick={() => navigate("catalog")} className="block hover:text-white transition-colors mb-1">
              Ver catálogo
            </button>
            <button onClick={() => navigate("nosotros")} className="block hover:text-white transition-colors mb-1">
              Nosotros
            </button>
            <p>Retiro en tienda</p>
            <p>Sin despacho a domicilio</p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© 2024 Ferretería La Nona · Todos los derechos reservados</p>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">RUT 76.543.210-8 · Valparaíso, Chile</p>
            <button
              onClick={() => navigate("admin")}
              className="text-gray-700 hover:text-gray-500 transition-colors text-[10px] uppercase tracking-widest"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── NOSOTROS PAGE ───────────────────────────────────────────────────────────
function NosotrosPage({ navigate }: { navigate: NavigateFn }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[#F8F7F4] min-h-screen">

      {/* ── Encabezado ── */}
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-10 text-center">
        <p className="text-[#2ECC71] text-xs font-black uppercase tracking-widest mb-3">
          Quiénes somos
        </p>
        <h1
          className="text-4xl md:text-6xl font-black text-[#1C1C1C] uppercase tracking-tight leading-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Nuestra historia
        </h1>
      </div>

      {/* ── Contenido principal: texto + foto ── */}
      <section
        ref={sectionRef}
        className="max-w-5xl mx-auto px-4 pb-20"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">

          {/* Foto — arriba en mobile, derecha en desktop */}
          <div className="w-full md:order-2 md:w-2/5 shrink-0">
            <div
              className="relative w-full overflow-hidden rounded-2xl bg-[#E8E6E1] border border-[#DDD9D0]"
              style={{ aspectRatio: "4/5" }}
            >
              {imgError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#AAAAAA]">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span className="text-xs font-medium uppercase tracking-widest">Foto de la familia</span>
                </div>
              ) : (
                <img
                  src="/images/nosotros/familia.jpg"
                  alt="Familia Palma Díaz — Ferretería La Nonna"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              )}
              {/* Borde verde izquierdo */}
              <div className="absolute top-0 left-0 w-1 h-full bg-[#2ECC71] rounded-l-2xl" />
            </div>
          </div>

          {/* Texto — orden normal en ambos breakpoints */}
          <div className="md:order-1 md:w-3/5 flex flex-col gap-6 pt-2">
            <p className="text-[#1C1C1C] text-base md:text-lg leading-relaxed">
              Ferretería La Nonna es un proyecto de familia, hecho por porteños de toda la vida.
              Son Jacqueline Díaz y Humberto Palma, junto a sus tres hijos.
            </p>
            <p className="text-[#555550] text-sm md:text-base leading-relaxed">
              Antes de abrir el local, Humberto se dedicó casi 20 años al rubro de la ferretería
              y venta de productos del área — un camino largo que les dio la experiencia y el
              cariño por este oficio antes de animarse a tener su propio espacio.
            </p>
            <p className="text-[#555550] text-sm md:text-base leading-relaxed">
              Desde 2010 viven en Placilla de Peñuelas, y fue ahí donde nació la idea de
              abrir Ferretería La Nonna. Partieron con un local pequeño en la Galería Celeste,
              y con el tiempo — gracias a la confianza de sus clientes — se cambiaron
              dentro de la misma galería a un espacio mucho más grande, donde están hoy.
            </p>
            <p className="text-[#1C1C1C] text-sm md:text-base leading-relaxed border-l-2 border-[#2ECC71] pl-4 italic">
              Detrás de cada venta hay una familia que conoce el rubro de primera mano, y que
              trabaja todos los días para que encuentres justo lo que necesitas.
            </p>
          </div>

        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-[#E0DDD8] bg-white py-14 px-4 text-center">
        <p
          className="text-2xl md:text-3xl font-black text-[#1C1C1C] uppercase tracking-tight mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ¿Tienes un proyecto en mente?
        </p>
        <p className="text-[#777772] text-sm mb-8 max-w-sm mx-auto leading-relaxed">
          Revisa el catálogo, arma tu pedido y retíralo en tienda. Si tienes dudas, escríbenos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("catalog")}
            className="bg-[#2ECC71] hover:bg-[#27AE60] text-white px-8 py-3.5 font-black uppercase tracking-widest text-sm transition-colors rounded-sm"
          >
            Ver catálogo
          </button>
          <button
            onClick={() => navigate("contacto")}
            className="border border-gray-300 hover:border-[#2ECC71] text-[#555550] hover:text-[#1C1C1C] px-8 py-3.5 font-black uppercase tracking-widest text-sm transition-colors rounded-sm"
          >
            Contáctanos
          </button>
        </div>
      </section>

    </div>
  );
}

// ─── CONTACTO PAGE ───────────────────────────────────────────────────────────
const EDGE_FUNCTION_URL = "https://vtrubkecklulilohkgix.supabase.co/functions/v1/consultas";

function ContactoPage({ onSend }: { onSend: (msg: ContactMessage) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Requerido";
    if (!form.email.includes("@")) e.email = "Email inválido";
    if (!form.message.trim()) e.message = "Requerido";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setServerError("");
    if (Object.keys(errs).length > 0) return;

    setSending(true);
    try {
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: form.name,
          email: form.email,
          telefono: form.phone,
          asunto: form.subject,
          mensaje: form.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Error al enviar. Intenta de nuevo.");
        setSending(false);
        return;
      }

      onSend({
        id: Date.now().toString(),
        date: new Date().toLocaleString("es-CL"),
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
        read: false,
      });
      setSent(true);
    } catch {
      setServerError("No se pudo conectar. Verifica tu conexión e intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const inputCls = (err?: string) =>
    `w-full rounded-[10px] px-3.5 py-3 text-sm outline-none transition-colors border ${err ? "border-red-400" : "border-[#262626]"} bg-[#1B1B1B] text-[#F2F2F0] placeholder-[#6E6E68] focus:border-[#2ECC71]`;

  return (
    <div className="bg-[#0A0A0A] min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ── Dos columnas en desktop, apiladas en mobile ── */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">

          {/* ── Columna izquierda (~40%) ── */}
          <div className="w-full md:w-2/5 shrink-0 flex flex-col gap-6 md:pt-4">

            {/* Ícono */}
            <div className="w-10 h-10 rounded-xl bg-[#2ECC71]/10 border border-[#2ECC71]/25 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>

            {/* Título + subtítulo */}
            <div>
              <h1
                className="font-black uppercase tracking-tight text-4xl text-white leading-none mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Contáctanos
              </h1>
              <p className="text-[#9B9B95] text-sm leading-relaxed max-w-xs">
                ¿Tienes dudas sobre algún producto, tu pedido o el retiro en tienda? Escríbenos y te respondemos a la brevedad.
              </p>
            </div>

            {/* Datos de contacto */}
            <div className="flex flex-col gap-2.5">
              <a href="mailto:ferreteria.lanonna@gmail.com" className="flex items-center gap-2.5 text-sm text-[#9B9B95] hover:text-[#2ECC71] transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                ferreteria.lanonna@gmail.com
              </a>
              <a href="tel:+56322214589" className="flex items-center gap-2.5 text-sm text-[#9B9B95] hover:text-[#2ECC71] transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.93-.93a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +56 32 221 4589
              </a>
            </div>

            {/* Mapa reducido */}
            <div className="w-full max-w-sm">
              <WorldMapSparkle />
            </div>
          </div>

          {/* ── Columna derecha (~60%): tarjeta formulario ── */}
          <div className="w-full md:w-3/5">
            <div
              className="relative rounded-3xl border border-[#262626] bg-[#141414] px-6 md:px-10 py-10 overflow-hidden"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg,rgba(255,255,255,0.035) 0 1px,transparent 1px 32px),repeating-linear-gradient(90deg,rgba(255,255,255,0.035) 0 1px,transparent 1px 32px)",
              }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 70% at 50% 30%, transparent 40%, #141414 90%)" }} />

              {sent ? (
                <div className="relative z-10 text-center py-10">
                  <div className="w-14 h-14 bg-[#2ECC71] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={28} className="text-[#0A0A0A]" />
                  </div>
                  <p className="font-black text-white uppercase tracking-tight text-xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    ¡Mensaje enviado!
                  </p>
                  <p className="text-[#9B9B95] text-sm">Te responderemos a la brevedad al correo indicado.</p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                    className="mt-6 text-xs font-bold text-[#2ECC71] hover:underline uppercase tracking-widest"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: "Nombre completo", key: "name", placeholder: "Juan Pérez", type: "text" },
                    { label: "Correo electrónico", key: "email", placeholder: "juan@ejemplo.com", type: "email" },
                    { label: "Teléfono", key: "phone", placeholder: "+56 9 1234 5678", type: "tel" },
                    { label: "Motivo de tu consulta", key: "subject", placeholder: "Estado de pedido, disponibilidad…", type: "text" },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key} className="flex flex-col gap-2">
                      <label className="text-[13px] font-medium text-[#F2F2F0]">{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={(form as any)[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className={inputCls(errors[key])}
                      />
                      {errors[key] && <p className="text-red-400 text-xs">{errors[key]}</p>}
                    </div>
                  ))}

                  <div className="sm:col-span-2 flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-[#F2F2F0]">Mensaje</label>
                    <textarea
                      placeholder="Cuéntanos en qué te podemos ayudar..."
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      rows={4}
                      className={`${inputCls(errors.message)} resize-y`}
                    />
                    {errors.message && <p className="text-red-400 text-xs">{errors.message}</p>}
                  </div>

                  {serverError && (
                    <p className="sm:col-span-2 text-red-400 text-sm text-center">{serverError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="sm:col-span-2 mt-1 bg-[#2ECC71] hover:bg-[#27AE60] disabled:opacity-60 text-[#08240F] font-bold text-sm rounded-[10px] py-3.5 transition-colors active:scale-[0.98]"
                  >
                    {sending ? "Enviando..." : "Enviar mensaje"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ──────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<Order["status"], string> = {
  pendiente:        "bg-red-100 text-red-700",
  "en preparación": "bg-yellow-100 text-yellow-700",
  listo:            "bg-[#dcfce7] text-green-800",
  entregado:        "bg-gray-100 text-gray-500",
};

const STATUS_CARD: Record<Order["status"], { border: string; header: string }> = {
  pendiente:        { border: "border-red-400",      header: "border-red-200 bg-red-50" },
  "en preparación": { border: "border-yellow-400",   header: "border-yellow-200 bg-yellow-50" },
  listo:            { border: "border-[#2ECC71]",    header: "border-[#2ECC71]/30 bg-[#f0fdf4]" },
  entregado:        { border: "border-gray-200",     header: "border-gray-100" },
};

function OrderCard({ order, updateStatus }: { order: Order; updateStatus: (id: string, s: Order["status"]) => void }) {
  const cardStyle = STATUS_CARD[order.status];
  return (
    <div className={`bg-white rounded-sm border overflow-hidden ${cardStyle.border}`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b ${cardStyle.header}`}>
        <div className="flex items-center gap-2.5">
          <span className="font-black text-sm text-[#1C1C1C]">{order.num}</span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
            {order.status}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock size={11} />{order.date}
        </div>
      </div>
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="px-5 py-3.5 space-y-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Cliente</p>
            <p className="font-semibold text-sm text-[#1C1C1C]">{order.customer.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{order.customer.email} · {order.customer.phone}</p>
            <p className="text-xs text-gray-400 mt-0.5">Retiro: {order.customer.address}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Código de retiro</p>
              <p className="font-black text-xl text-[#2ECC71]" style={{ fontFamily: "var(--font-mono)" }}>
                {order.num.replace("LN-", "")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Documento</p>
              <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-sm ${order.docType === "factura" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                {order.docType === "factura" ? "Factura" : "Boleta"}
              </span>
            </div>
          </div>

          {order.docType === "factura" && order.invoiceData && (
            <div className="border border-blue-200 bg-blue-50 rounded-sm p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Datos de facturación</p>
              <div className="space-y-0.5 text-xs text-gray-700">
                <p><span className="font-semibold">RUT:</span> {order.invoiceData.rut}</p>
                <p><span className="font-semibold">Razón social:</span> {order.invoiceData.razonSocial}</p>
                <p><span className="font-semibold">Giro:</span> {order.invoiceData.giro}</p>
                <p><span className="font-semibold">Dirección:</span> {order.invoiceData.direccion}, {order.invoiceData.comuna}</p>
              </div>
            </div>
          )}
        </div>
        <div className="px-5 py-3.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Productos</p>
          <div className="space-y-0.5">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700 truncate max-w-[200px]">{item.name} <span className="text-gray-400">×{item.qty}</span></span>
                <span className="font-semibold text-[#1C1C1C] shrink-0 ml-2">{fmt(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="text-sm font-black">Total</span>
            <span className="text-sm font-black text-[#2ECC71]">{fmt(order.total)}</span>
          </div>
        </div>
      </div>
      <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-gray-400 mr-1">Estado:</span>
        {(["pendiente", "en preparación", "listo", "entregado"] as Order["status"][]).map((s) => (
          <button key={s} onClick={() => updateStatus(order.id, s)}
            className={`text-xs px-3 py-1 rounded-sm font-semibold transition-colors ${
              order.status === s ? "bg-[#1C1C1C] text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400"
            }`}
          >{s}</button>
        ))}
      </div>
    </div>
  );
}

function AdminPage({
  orders, setOrders, products, setProducts, navigate, contactMessages, setContactMessages,
}: {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  navigate: NavigateFn;
  contactMessages: ContactMessage[];
  setContactMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
}) {
  const [tab, setTab] = useState<"pedidos" | "historial" | "productos" | "mensajes">("pedidos");
  const unreadCount = contactMessages.filter((m) => !m.read).length;
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBuf, setEditBuf] = useState<Partial<Product>>({});
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "stock-asc" | "stock-desc">("default");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", sku: "", brand: "", category: "", price: "", originalPrice: "",
    description: "", img: "", badge: "", available: true,
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  const CATEGORY_OPTIONS = [
    { id: "electric", name: "Herramientas Eléctricas" },
    { id: "manual", name: "Herramientas Manuales" },
    { id: "fixings", name: "Fijaciones y Tornillería" },
    { id: "paint", name: "Pinturas" },
    { id: "electrical", name: "Electricidad" },
    { id: "plumbing", name: "Gasfitería" },
    { id: "garden", name: "Jardín" },
    { id: "safety", name: "Seguridad" },
  ];

  function validateNewProduct() {
    const e: Record<string, string> = {};
    if (!newProduct.name.trim()) e.name = "Requerido";
    if (!newProduct.sku.trim()) e.sku = "Requerido";
    if (!newProduct.brand.trim()) e.brand = "Requerido";
    if (!newProduct.category) e.category = "Requerido";
    if (!newProduct.price || isNaN(Number(newProduct.price)) || Number(newProduct.price) <= 0) e.price = "Precio inválido";
    if (!newProduct.description.trim()) e.description = "Requerido";
    return e;
  }

  function handleAddProduct() {
    const errs = validateNewProduct();
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const id = Math.max(...products.map((p) => p.id)) + 1;
    setProducts((prev) => [...prev, {
      id,
      name: newProduct.name.trim(),
      sku: newProduct.sku.trim(),
      brand: newProduct.brand.trim(),
      category: newProduct.category,
      price: Number(newProduct.price),
      originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined,
      description: newProduct.description.trim(),
      img: newProduct.img.trim() || "photo-1504307651254-35680f356dfd",
      badge: newProduct.badge.trim() || undefined,
      available: newProduct.available,
      specs: [],
    }]);
    setNewProduct({ name: "", sku: "", brand: "", category: "", price: "", originalPrice: "", description: "", img: "", badge: "", available: true });
    setAddErrors({});
    setShowAddForm(false);
  }
  const [seenCount, setSeenCount] = useState(orders.length);
  const [bellOpen, setBellOpen] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);

  const newCount = orders.length - seenCount;

  useEffect(() => {
    if (bellOpen) setSeenCount(orders.length);
  }, [bellOpen, orders.length]);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditBuf({ name: p.name, price: p.price, badge: p.badge });
  }
  function saveEdit(id: number) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...editBuf } : p)));
    setEditingId(null);
  }
  function updateStatus(orderId: string, status: Order["status"]) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  // active = non-entregado; history = entregado
  const activeOrders = orders.filter((o) => o.status !== "entregado");
  const historyOrders = orders.filter((o) => o.status === "entregado");
  const readyOrders = activeOrders.filter((o) => o.status === "listo");
  const inProgressOrders = activeOrders.filter((o) => o.status !== "listo");

  function filterOrders(list: Order[]) {
    const q = search.toLowerCase();
    return !q ? list : list.filter((o) =>
      o.num.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q)
    );
  }

  const TAB_LABELS: { key: typeof tab; label: string; count?: number; alert?: boolean }[] = [
    { key: "pedidos",   label: "Pedidos",   count: activeOrders.length },
    { key: "historial", label: "Historial", count: historyOrders.length },
    { key: "productos", label: "Productos", count: products.length },
    { key: "mensajes",  label: "Mensajes",  count: contactMessages.length, alert: unreadCount > 0 },
  ];

  return (
    <div className="min-h-screen bg-[#F4F2EE]" style={{ fontFamily: "var(--font-body)" }}>

      {/* top bar */}
      <div className="bg-[#1C1C1C] text-white px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Logo" className="h-7 w-auto object-contain mix-blend-screen" style={{ filter: "invert(1)" }} />
          <div>
            <p className="font-bold text-sm leading-none">Panel de Administración</p>
            <p className="text-gray-400 text-xs mt-0.5">Ferretería La Nona</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* bell */}
          <div className="relative">
            <button
              onClick={() => setBellOpen((v) => !v)}
              className="relative p-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {newCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#2ECC71] text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 animate-pulse">
                  {newCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {bellOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-sm shadow-xl border border-gray-100 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Notificaciones</span>
                    <button onClick={() => setBellOpen(false)}><X size={13} className="text-gray-400" /></button>
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">Sin notificaciones</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                      {orders.slice(0, 8).map((o) => (
                        <button
                          key={o.id}
                          onClick={() => { setBellOpen(false); setTab("pedidos"); }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-bold text-[#1C1C1C]">{o.num}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                          </div>
                          <p className="text-xs text-gray-400">{o.customer.name} · {fmt(o.total)}</p>
                          <p className="text-[10px] text-gray-300 mt-0.5">{o.date}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* mail */}
          <div className="relative">
            <button
              onClick={() => { setMailOpen((v) => !v); setBellOpen(false); }}
              className="relative p-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {mailOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-sm shadow-xl border border-gray-100 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Mensajes</span>
                    <button onClick={() => setMailOpen(false)}><X size={13} className="text-gray-400" /></button>
                  </div>
                  {contactMessages.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">Sin mensajes</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                      {contactMessages.slice(0, 8).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setMailOpen(false);
                            setTab("mensajes");
                            setContactMessages((prev) => prev.map((x) => ({ ...x, read: true })));
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-bold text-[#1C1C1C]">{m.name}</span>
                            {!m.read && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{m.subject || m.message}</p>
                          <p className="text-[10px] text-gray-300 mt-0.5">{m.date}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => navigate("home")} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={13} /> Volver al sitio
          </button>
        </div>
      </div>

      {/* tabs */}
      <div className="border-b border-gray-200 bg-white px-6 flex gap-0">
        {TAB_LABELS.map(({ key, label, count, alert }) => (
          <button key={key}
            onClick={() => {
              setTab(key);
              setSearch("");
              setEditingId(null);
              if (key === "mensajes") {
                setContactMessages((prev) => prev.map((m) => ({ ...m, read: true })));
              }
            }}
            className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              tab === key ? "border-[#2ECC71] text-[#1C1C1C]" : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {label}
            {count !== undefined && (
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                alert && tab !== key ? "bg-red-500 text-white" : tab === key ? "bg-[#2ECC71] text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {alert && tab !== key ? unreadCount : count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* search */}
        <div className="relative mb-6 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setEditingId(null); }}
            placeholder={tab === "productos" ? "Buscar por nombre, SKU o marca…" : "Buscar por N° pedido o cliente…"}
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-sm bg-white outline-none focus:border-[#2ECC71] transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>

        {/* ── PEDIDOS ACTIVOS ── */}
        {tab === "pedidos" && (
          <div className="space-y-6">

            {/* listos para retirar */}
            {readyOrders.length > 0 && !search && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#1C1C1C]">
                    Listos para retirar
                    <span className="ml-2 text-[#2ECC71]">({readyOrders.length})</span>
                  </h3>
                </div>
                <div className="space-y-3">
                  {readyOrders.map((o) => <OrderCard key={o.id} order={o} updateStatus={updateStatus} />)}
                </div>
              </div>
            )}

            {/* en curso */}
            <div>
              {readyOrders.length > 0 && !search && (
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">En curso</h3>
              )}
              {activeOrders.length === 0 && (
                <div className="bg-white rounded-sm border border-gray-200 p-12 text-center text-gray-400">
                  <Package size={32} className="mx-auto mb-3 opacity-25" />
                  <p className="font-semibold text-sm">Sin pedidos activos</p>
                </div>
              )}
              <div className="space-y-3">
                {filterOrders(search ? activeOrders : inProgressOrders).map((o) => (
                  <OrderCard key={o.id} order={o} updateStatus={updateStatus} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORIAL ── */}
        {tab === "historial" && (
          <div>
            {historyOrders.length === 0 ? (
              <div className="bg-white rounded-sm border border-gray-200 p-12 text-center text-gray-400">
                <Clock size={32} className="mx-auto mb-3 opacity-25" />
                <p className="font-semibold text-sm">Sin pedidos entregados aún</p>
                <p className="text-xs mt-1">Los pedidos marcados como "entregado" aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filterOrders(historyOrders).map((o) => (
                  <OrderCard key={o.id} order={o} updateStatus={updateStatus} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTOS ── */}
        {tab === "productos" && (
          <div className="space-y-4">

            {/* Botón agregar / formulario */}
            {!showAddForm ? (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-[#2ECC71] hover:bg-[#27AE60] text-white font-black text-xs uppercase tracking-widest px-4 py-2.5 transition-colors"
                >
                  + Agregar producto
                </button>
              </div>
            ) : (
              <div className="bg-white border border-[#2ECC71] rounded-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black uppercase tracking-tight text-base" style={{ fontFamily: "var(--font-display)" }}>
                    Nuevo producto
                  </h3>
                  <button onClick={() => { setShowAddForm(false); setAddErrors({}); }} className="text-gray-400 hover:text-gray-700 transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Nombre del producto *", key: "name", placeholder: "Taladro Percutor Bosch 550W" },
                    { label: "SKU *", key: "sku", placeholder: "BSH-GSB550" },
                    { label: "Marca *", key: "brand", placeholder: "Bosch" },
                    { label: "Precio CLP *", key: "price", placeholder: "49990", type: "number" },
                    { label: "Precio original (opcional)", key: "originalPrice", placeholder: "59990", type: "number" },
                    { label: "Badge (opcional)", key: "badge", placeholder: "Oferta, Más vendido..." },
                    { label: "ID imagen Unsplash (opcional)", key: "img", placeholder: "photo-1504307651254-35680f356dfd" },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">{label}</label>
                      <input
                        type={type ?? "text"}
                        placeholder={placeholder}
                        value={(newProduct as any)[key]}
                        onChange={(e) => setNewProduct((p) => ({ ...p, [key]: e.target.value }))}
                        className={`w-full border ${addErrors[key] ? "border-red-400" : "border-gray-300"} rounded-sm px-3 py-2 text-sm focus:border-[#2ECC71] outline-none`}
                      />
                      {addErrors[key] && <p className="text-red-500 text-xs mt-0.5">{addErrors[key]}</p>}
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Categoría *</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                      className={`w-full border ${addErrors.category ? "border-red-400" : "border-gray-300"} rounded-sm px-3 py-2 text-sm focus:border-[#2ECC71] outline-none bg-white`}
                    >
                      <option value="">Seleccionar categoría</option>
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {addErrors.category && <p className="text-red-500 text-xs mt-0.5">{addErrors.category}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Descripción *</label>
                    <textarea
                      placeholder="Descripción del producto..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className={`w-full border ${addErrors.description ? "border-red-400" : "border-gray-300"} rounded-sm px-3 py-2 text-sm focus:border-[#2ECC71] outline-none resize-none`}
                    />
                    {addErrors.description && <p className="text-red-500 text-xs mt-0.5">{addErrors.description}</p>}
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Disponibilidad inicial:</label>
                    <button
                      type="button"
                      onClick={() => setNewProduct((p) => ({ ...p, available: !p.available }))}
                      className={`text-xs font-black uppercase tracking-wide px-3 py-1.5 rounded-sm transition-colors ${newProduct.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                    >
                      {newProduct.available ? "Disponible" : "No disponible"}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleAddProduct}
                    className="bg-[#2ECC71] hover:bg-[#27AE60] text-white font-black text-xs uppercase tracking-widest px-5 py-2.5 transition-colors"
                  >
                    Guardar producto
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setAddErrors({}); }}
                    className="border border-gray-300 text-gray-500 font-semibold text-xs px-4 py-2.5 hover:border-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

          <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Producto</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">SKU</th>
                  <th className="text-left px-4 py-3">
                    <button
                      onClick={() => setSortBy(sortBy === "price-asc" ? "price-desc" : "price-asc")}
                      className="flex items-center gap-1 hover:text-[#1C1C1C] transition-colors"
                    >
                      Precio
                      <span className="flex flex-col leading-none opacity-60">
                        <span className={sortBy === "price-asc" ? "text-[#2ECC71]" : ""}>▲</span>
                        <span className={sortBy === "price-desc" ? "text-[#2ECC71]" : ""}>▼</span>
                      </span>
                    </button>
                  </th>
                  <th className="text-left px-4 py-3">
                      Disponibilidad
                  </th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Badge</th>
                  <th className="px-4 py-3 text-right">
                    {sortBy !== "default" && (
                      <button onClick={() => setSortBy("default")} className="text-[10px] text-gray-400 hover:text-gray-600 normal-case font-normal">
                        Limpiar orden
                      </button>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.filter((p) => {
                  const q = search.toLowerCase();
                  return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
                }).sort((a, b) => {
                  if (sortBy === "price-asc")  return a.price - b.price;
                  if (sortBy === "price-desc") return b.price - a.price;
                  if (sortBy === "stock-asc")  return Number(b.available) - Number(a.available);
                  if (sortBy === "stock-desc") return Number(a.available) - Number(b.available);
                  return 0;
                }).map((p) => {
                  const isEditing = editingId === p.id;
                  return (
                    <tr key={p.id} className={`transition-colors ${isEditing ? "bg-[#f0fdf4]" : "hover:bg-gray-50"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={unsplash(p.img, 80, 80)} alt={p.name} className="w-10 h-10 rounded-sm object-cover shrink-0" />
                          {isEditing
                            ? <input value={editBuf.name ?? ""} onChange={(e) => setEditBuf((b) => ({ ...b, name: e.target.value }))} className="border border-[#2ECC71] rounded-sm px-2 py-1 text-sm w-full max-w-[200px] outline-none" />
                            : <span className="font-medium text-[#1C1C1C] leading-snug">{p.name}</span>
                          }
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-gray-400 font-mono text-xs">{p.sku}</span>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing
                          ? <input type="number" value={editBuf.price ?? ""} onChange={(e) => setEditBuf((b) => ({ ...b, price: Number(e.target.value) }))} className="border border-[#2ECC71] rounded-sm px-2 py-1 text-sm w-24 outline-none" />
                          : <span className="font-semibold text-[#1C1C1C]">{fmt(p.price)}</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, available: !x.available } : x))}
                          className={`text-xs font-black uppercase tracking-wide px-3 py-1.5 rounded-sm transition-colors ${p.available ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                        >
                          {p.available ? "Disponible" : "No disponible"}
                        </button>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {isEditing
                          ? <input value={editBuf.badge ?? ""} onChange={(e) => setEditBuf((b) => ({ ...b, badge: e.target.value }))} placeholder="ej: Oferta" className="border border-[#2ECC71] rounded-sm px-2 py-1 text-sm w-24 outline-none" />
                          : <span className="text-xs text-gray-400">{p.badge ?? "—"}</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => saveEdit(p.id)} className="flex items-center gap-1 text-xs font-bold bg-[#2ECC71] text-white px-3 py-1.5 rounded-sm hover:bg-[#27AE60] transition-colors">
                              <Check size={12} /> Guardar
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:text-gray-700 px-2">Cancelar</button>
                          </div>
                        ) : (
                          <div className="flex gap-3 justify-end">
                            <button onClick={() => startEdit(p)} className="text-xs font-semibold text-[#2ECC71] hover:underline">Editar</button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar "${p.name}"?`)) {
                                  setProducts((prev) => prev.filter((x) => x.id !== p.id));
                                }
                              }}
                              className="text-xs font-semibold text-red-400 hover:text-red-600 hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        )}

        {/* ── MENSAJES ── */}
        {tab === "mensajes" && (
          <div className="space-y-3">
            {contactMessages.length === 0 ? (
              <div className="bg-white rounded-sm border border-gray-200 p-12 text-center text-gray-400">
                <Package size={32} className="mx-auto mb-3 opacity-25" />
                <p className="font-semibold text-sm">Sin mensajes aún</p>
                <p className="text-xs mt-1">Los mensajes del formulario de contacto aparecerán aquí.</p>
              </div>
            ) : (
              contactMessages
                .filter((m) => {
                  const q = search.toLowerCase();
                  return !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q);
                })
                .map((m) => (
                  <div key={m.id} className={`bg-white border rounded-sm overflow-hidden ${!m.read ? "border-[#2ECC71]" : "border-gray-200"}`}>
                    <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b ${!m.read ? "bg-[#f0fdf4] border-[#2ECC71]/30" : "bg-gray-50 border-gray-100"}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-sm text-[#1C1C1C]">{m.name}</span>
                        {!m.read && (
                          <span className="text-[10px] font-black uppercase bg-[#2ECC71] text-white px-2 py-0.5 rounded-full">Nuevo</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{m.date}</span>
                        <button
                          onClick={() => setContactMessages((prev) => prev.filter((x) => x.id !== m.id))}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="px-5 py-4 grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Contacto</p>
                        <p className="text-gray-700">{m.email}</p>
                        {m.phone && <p className="text-gray-400 text-xs mt-0.5">{m.phone}</p>}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Motivo</p>
                        <p className="text-gray-700">{m.subject}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Mensaje</p>
                        <p className="text-gray-700 leading-relaxed">{m.message}</p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNum, setOrderNum] = useState("");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const navigate: NavigateFn = (to, product) => {
    // gate checkout behind auth
    if (to === "checkout" && !currentUser && !isGuest) {
      setPage("auth");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
      return;
    }
    setPage(to);
    if (product) setSelectedProduct(product);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const addToCart: AddToCartFn = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...product, qty }];
    });
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) setCart((prev) => prev.filter((i) => i.id !== id));
    else setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const cartCount = cart.reduce((a, b) => a + b.qty, 0);
  const cartTotal = cart.reduce((a, b) => a + b.price * b.qty, 0);

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <Header
        navigate={navigate} cartCount={cartCount}
        currentUser={currentUser}
        onLogout={() => { setCurrentUser(null); setIsGuest(false); }}
      />

      <main className="flex-1">
        {page === "home" && (
          <HomePage navigate={navigate} addToCart={addToCart} products={products} />
        )}
        {page === "catalog" && (
          <CatalogPage navigate={navigate} addToCart={addToCart} products={products} />
        )}
        {page === "product" && selectedProduct && (
          <ProductPage product={selectedProduct} navigate={navigate} addToCart={addToCart} products={products} />
        )}
        {page === "cart" && (
          <CartPage cart={cart} updateQty={updateQty} cartTotal={cartTotal} navigate={navigate} />
        )}
        {page === "checkout" && (
          <CheckoutPage
            cart={cart} cartTotal={cartTotal} navigate={navigate}
            setOrderNum={setOrderNum}
            onOrderPlaced={(o) => { setOrders((prev) => [o, ...prev]); setLastOrder(o); setCart([]); }}
            prefill={currentUser ?? undefined}
          />
        )}
        {page === "confirmation" && (
          <ConfirmationPage orderNum={orderNum} order={lastOrder} navigate={navigate} />
        )}
        {page === "nosotros" && (
          <NosotrosPage navigate={navigate} />
        )}
        {page === "contacto" && (
          <ContactoPage onSend={(msg) => setContactMessages((prev) => [msg, ...prev])} />
        )}
        {page === "auth" && (
          <AuthPage
            navigate={navigate}
            onAuth={(user) => { setCurrentUser(user); setIsGuest(false); setPage("checkout"); setTimeout(() => window.scrollTo({ top: 0 }), 0); }}
            onGuest={() => { setIsGuest(true); setCurrentUser(null); setPage("checkout"); setTimeout(() => window.scrollTo({ top: 0 }), 0); }}
          />
        )}
        {page === "admin" && (
          <AdminPage
            orders={orders} setOrders={setOrders}
            products={products} setProducts={setProducts}
            navigate={navigate}
            contactMessages={contactMessages}
            setContactMessages={setContactMessages}
          />
        )}
      </main>

      {page !== "admin" && <Footer navigate={navigate} />}
    </div>
  );
}
