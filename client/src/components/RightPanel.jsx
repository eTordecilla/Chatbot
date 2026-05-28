import React from "react";
import { Globe, Quote, Heart, Cloud } from "lucide-react";

const topics = ["Inicio de sesión", "Pedidos", "Inventario", "Facturación"];

export default function RightPanel({ knowledgeStatus }) {
  const [likedQuote, setLikedQuote] = React.useState(false);

  return (
    <aside className="w-67.5 shrink-0 flex flex-col gap-2.5 py-4 px-3.5 overflow-y-auto bg-(--bg-panel) backdrop-blur-2xl border-l border-(--border) relative">
      {/* Blob decorativo */}
      <div
        className="absolute w-50 h-50 rounded-full pointer-events-none -top-15 -right-15"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Base de Conocimiento */}
      <section className="bg-(--bg-card) backdrop-blur-md border border-(--border) rounded-2xl py-3 px-3.5">
        <div className="flex items-center gap-1.75 mb-2.5">
          <Globe size={15} color="var(--accent)" />
          <span className="text-[13px] font-semibold text-(--text-primary) flex-1">
            Base de Conocimiento
          </span>
          <div
            className="w-1.75 h-1.75 rounded-full"
            style={{
              background: knowledgeStatus?.exists ? "#22c55e" : "#ef4444",
            }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <span
              key={t}
              className="text-[11px] py-1 px-2.5 rounded-[20px] bg-(--bg-hover) border border-(--border-accent) text-(--accent) cursor-pointer"
            >
              {t}
            </span>
          ))}
        </div>
        {knowledgeStatus && (
          <div className="text-[11px] text-(--text-muted) mt-2">
            {knowledgeStatus.exists
              ? `📂 ${knowledgeStatus.sizeKB} KB · ${knowledgeStatus.lines} líneas`
              : "⚠️ Archivo no encontrado"}
          </div>
        )}
      </section>

      {/* Frase del día */}
      <section className="bg-(--bg-card) backdrop-blur-md border border-(--border) rounded-2xl py-3 px-3.5">
        <div className="flex items-center gap-1.75 mb-2.5">
          <Quote size={15} color="var(--accent2)" />
          <span className="text-[13px] font-semibold text-(--text-primary) flex-1">
            Frase del día
          </span>
        </div>
        <p className="text-[13px] text-(--text-secondary) leading-[1.6] italic mb-2">
          "La excelencia no es un acto, sino un hábito."
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-(--text-muted)">— Aristóteles</span>
          <button
            className="flex p-0.5 cursor-pointer"
            style={{ color: likedQuote ? "#ef4444" : "var(--text-muted)" }}
            onClick={() => setLikedQuote((v) => !v)}
          >
            <Heart size={14} fill={likedQuote ? "#ef4444" : "none"} />
          </button>
        </div>
      </section>

      {/* Clima */}
      <section
        className="backdrop-blur-md border border-blue-900 rounded-2xl py-3 px-3.5"
        style={{ backgroundColor: "#0a2d82" }}
      >
        <div className="flex items-center gap-1.75 mb-2.5">
          <Cloud size={15} color="#ffffff" />
          <span className="text-[13px] font-semibold text-white flex-1">
            Clima · Medellín, CO
          </span>
        </div>
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <div className="text-[28px] font-bold text-white leading-none">
              24°C
            </div>
            <div className="text-[11px] text-gray-200 mt-0.75">
              Parcialmente nublado
            </div>
          </div>
          <div className="text-[36px]">☁️</div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-0.5 text-[11px] text-gray-300">
            <span>Humedad</span>
            <strong>68%</strong>
          </div>
          <div className="flex-1 flex flex-col gap-0.5 text-[11px] text-gray-300">
            <span>Viento</span>
            <strong>14 km/h</strong>
          </div>
          <div className="flex-1 flex flex-col gap-0.5 text-[11px] text-gray-300">
            <span>Sensación</span>
            <strong>22°C</strong>
          </div>
        </div>
      </section>
    </aside>
  );
}
