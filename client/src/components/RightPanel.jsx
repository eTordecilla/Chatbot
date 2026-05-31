import React from "react";
import { Globe, Quote, Heart, Cloud, Droplets, Wind } from "lucide-react";

const topics = ["Inicio de sesión", "Pedidos", "Inventario", "Facturación"];

const WMO_CODES = {
  0:  { label: "Cielo despejado",            icon: "☀️" },
  1:  { label: "Principalmente despejado",   icon: "🌤️" },
  2:  { label: "Parcialmente nublado",       icon: "🌤️" },
  3:  { label: "Nublado",                    icon: "☁️" },
  45: { label: "Niebla",                     icon: "🌫️" },
  48: { label: "Niebla",                     icon: "🌫️" },
  51: { label: "Llovizna ligera",            icon: "🌧️" },
  53: { label: "Llovizna moderada",          icon: "🌧️" },
  55: { label: "Llovizna densa",             icon: "🌧️" },
  61: { label: "Lluvia ligera",              icon: "🌧️" },
  63: { label: "Lluvia moderada",            icon: "🌧️" },
  65: { label: "Lluvia fuerte",              icon: "🌧️" },
  95: { label: "Tormenta eléctrica",         icon: "⛈️" },
  96: { label: "Tormenta eléctrica",         icon: "⛈️" },
  99: { label: "Tormenta eléctrica",         icon: "⛈️" },
};

function getWeatherInfo(code) {
  return WMO_CODES[code] ?? { label: "Desconocido", icon: "🌡️" };
}

const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function RightPanel({ knowledgeStatus }) {
  const [likedQuote, setLikedQuote] = React.useState(false);
  const [weather, setWeather] = React.useState(null);
  const [cityName, setCityName] = React.useState("Mi ubicación");
  const [weatherError, setWeatherError] = React.useState(false);

  React.useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    function fetchWeather(lat, lon) {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`,
        { signal }
      )
        .then((r) => r.json())
        .then((data) => setWeather(data))
        .catch((err) => { if (err.name !== "AbortError") setWeatherError(true); });
    }

    function fetchCity(lat, lon) {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es`,
        { signal }
      )
        .then((r) => r.json())
        .then((data) => {
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "Mi ubicación";
          setCityName(city);
        })
        .catch(() => {});
    }

    if (!navigator.geolocation) {
      fetchWeather(6.25, -75.56);
      return () => controller.abort();
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        fetchWeather(coords.latitude, coords.longitude);
        fetchCity(coords.latitude, coords.longitude);
      },
      () => {
        // Permiso denegado: usar Medellín como fallback
        fetchWeather(6.25, -75.56);
        setCityName("Medellín");
      }
    );

    return () => controller.abort();
  }, []);

  return (
    <aside className="w-67.5 shrink-0 flex flex-col gap-2.5 py-4 px-3.5 overflow-hidden bg-(--bg-panel) backdrop-blur-2xl border-l border-(--border) relative">
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
            className={`w-1.75 h-1.75 rounded-full ${knowledgeStatus?.exists ? "bg-green-500" : "bg-red-500"}`}
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
            Clima · {cityName}
          </span>
        </div>

        {weatherError ? (
          <p className="text-[11px] text-red-300">No se pudo cargar el clima.</p>
        ) : !weather ? (
          <p className="text-[11px] text-gray-400 animate-pulse">Cargando…</p>
        ) : (
          <>
            {/* Temperatura y condición actual */}
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <div className="text-[28px] font-bold text-white leading-none">
                  {Math.round(weather.current.temperature_2m)}°C
                </div>
                <div className="text-[11px] text-gray-200 mt-0.75">
                  {getWeatherInfo(weather.current.weather_code).label}
                </div>
              </div>
              <div className="text-[36px]">
                {getWeatherInfo(weather.current.weather_code).icon}
              </div>
            </div>

            {/* Humedad y viento */}
            <div className="flex gap-2 mb-2.5">
              <div className="flex-1 flex items-center gap-1 text-[11px] text-gray-300">
                <Droplets size={11} className="shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span>Humedad</span>
                  <strong>{weather.current.relative_humidity_2m}%</strong>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-1 text-[11px] text-gray-300">
                <Wind size={11} className="shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span>Viento</span>
                  <strong>{Math.round(weather.current.wind_speed_10m)} km/h</strong>
                </div>
              </div>
            </div>

            {/* Pronóstico 4 días */}
            <div className="border-t border-blue-800 pt-2 grid grid-cols-4 gap-1">
              {weather.daily.time.slice(0, 4).map((dateStr, i) => {
                const d = new Date(dateStr + "T00:00:00");
                const label = i === 0 ? "Hoy" : DAYS_ES[d.getDay()];
                const precip = weather.daily.precipitation_sum[i];
                return (
                  <div key={dateStr} className="flex flex-col items-center gap-0.5 text-[10px] text-gray-300">
                    <span className="font-semibold">{label}</span>
                    <span>{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                    <span className="text-gray-400">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
                    {precip > 0 && (
                      <span className="text-blue-300">{precip.toFixed(1)} mm</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </aside>
  );
}
