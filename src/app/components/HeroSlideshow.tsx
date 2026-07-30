import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

// Cuando tengas las fotos reales, reemplaza estas URLs por las rutas locales:
// "/images/hero/foto-1.jpg", "/images/hero/foto-2.jpg", etc.
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=900&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1600&h=900&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1585676623595-e1781bf6f0e5?w=1600&h=900&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1600&h=900&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1600&h=900&fit=crop&auto=format",
];

const SLIDE_DURATION = 5000; // ms por foto

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

interface HeroSlideshowProps {
  onSearch: (e: React.FormEvent) => void;
  searchVal: string;
  setSearchVal: (v: string) => void;
}

export function HeroSlideshow({ onSearch, searchVal, setSearchVal }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const reduced = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (reduced) return;
    timerRef.current = setTimeout(() => {
      setCurrent((i) => (i + 1) % HERO_IMAGES.length);
    }, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [current, reduced]);

  return (
    <section
      className="relative overflow-hidden bg-[#1C1C1C] flex flex-col items-center justify-center"
      style={{ minHeight: "clamp(320px, 60vh, 60vh)" }}
    >
      {/* ── Slideshow de fondo ── */}
      {reduced ? (
        <img
          src={HERO_IMAGES[0]}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-65"
        />
      ) : (
        <AnimatePresence>
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <motion.img
              src={HERO_IMAGES[current]}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover opacity-65"
              initial={{ scale: 1 }}
              animate={{ scale: 1.07 }}
              transition={{ duration: SLIDE_DURATION / 1000 + 1.2, ease: "linear" }}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Degradado oscuro */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-[#1C1C1C]" />

      {/* ── Contenido ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 py-20 max-w-3xl mx-auto">

        {/* Eyebrow */}
        {reduced ? (
          <p className="text-[#2ECC71] text-xs font-black uppercase tracking-widest mb-4">
            Ferretería familiar desde siempre
          </p>
        ) : (
          <motion.p
            className="text-[#2ECC71] text-xs font-black uppercase tracking-widest mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Ferretería familiar desde siempre
          </motion.p>
        )}

        {/* Título */}
        {reduced ? (
          <h1
            className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-none mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Bienvenido a<br />Ferretería La Nonna
          </h1>
        ) : (
          <motion.h1
            className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-none mb-4"
            style={{ fontFamily: "var(--font-display)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
          >
            Bienvenido a<br />Ferretería La Nonna
          </motion.h1>
        )}

        {/* Subtítulo */}
        {reduced ? (
          <p className="text-gray-300 text-sm md:text-base mb-8 max-w-md">
            Herramientas, materiales y más. Pedido listo en tienda el mismo día.
          </p>
        ) : (
          <motion.p
            className="text-gray-300 text-sm md:text-base mb-8 max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
          >
            Herramientas, materiales y más. Pedido listo en tienda el mismo día.
          </motion.p>
        )}

        {/* Barra de búsqueda */}
        {reduced ? (
          <form onSubmit={onSearch} className="flex w-full max-w-xl shadow-2xl rounded-sm overflow-hidden">
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Buscar producto, marca o código SKU..."
              className="flex-1 bg-[#e2e2e2] text-[#1A1A1A] px-4 py-3.5 text-sm font-medium outline-none placeholder-gray-400"
            />
            <button type="submit" className="bg-[#2ECC71] hover:bg-[#27AE60] px-5 py-3.5 text-white transition-colors shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </form>
        ) : (
          <motion.form
            onSubmit={onSearch}
            className="flex w-full max-w-xl shadow-2xl rounded-sm overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.55 }}
          >
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Buscar producto, marca o código SKU..."
              className="flex-1 bg-[#e2e2e2] text-[#1A1A1A] px-4 py-3.5 text-sm font-medium outline-none placeholder-gray-400"
            />
            <button type="submit" className="bg-[#2ECC71] hover:bg-[#27AE60] px-5 py-3.5 text-white transition-colors shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </motion.form>
        )}
      </div>

      {/* Indicadores de slide */}
      {!reduced && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => { clearTimeout(timerRef.current); setCurrent(i); }}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-[#2ECC71]" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Foto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
