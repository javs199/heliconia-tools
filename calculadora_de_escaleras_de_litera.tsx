import React, { useState, useEffect } from 'react';

// Ajustes preestablecidos basados en nuestras conversaciones anteriores
const PRESETS = [
  { name: "Nuevo Ajuste (75.93\" x 58\" - 7 Esc.)", height: 75.93, depth: 58, width: 29, steps: 7, unit: "in" },
  { name: "Ajuste Anterior (77.93\" x 63\" - 10 Esc.)", height: 77.93, depth: 63, width: 29, steps: 10, unit: "in" },
  { name: "Ajuste Altura 10 Esc. (73.3\" x 63\")", height: 73.3, depth: 63, width: 29, steps: 10, unit: "in" },
  { name: "Ajuste Altura 11 Esc. (73.3\" x 63\")", height: 73.3, depth: 63, width: 29, steps: 11, unit: "in" },
  { name: "Medidas Oficiales 10 Esc. (75.3\" x 63\")", height: 75.3, depth: 63, width: 29, steps: 10, unit: "in" },
  { name: "Medidas Oficiales 11 Esc. (75.3\" x 63\")", height: 75.3, depth: 63, width: 29, steps: 11, unit: "in" },
  { name: "Foto Original (cm)", height: 188, depth: 160, width: 73.6, steps: 10, unit: "cm" }
];

export default function App() {
  // Estado inicial de la aplicación configurado con tus nuevas medidas oficiales
  const [unit, setUnit] = useState("in"); // "in" o "cm"
  const [height, setHeight] = useState(75.93);
  const [depth, setDepth] = useState(58.0);
  const [width, setWidth] = useState(29.0);
  const [steps, setSteps] = useState(7);
  
  // Grosor del material para un cálculo más real
  const [thickness, setThickness] = useState(2.0); // Ajustado a 2" por el nuevo diseño de material
  const [showDimensions, setShowDimensions] = useState(true);
  const [interactiveStep, setInteractiveStep] = useState(null);

  // Conversiones fluidas al cambiar de unidad
  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return;
    if (newUnit === "cm") {
      setHeight(Number((height * 2.54).toFixed(2)));
      setDepth(Number((depth * 2.54).toFixed(2)));
      setWidth(Number((width * 2.54).toFixed(2)));
      setThickness(Number((thickness * 2.54).toFixed(2)));
    } else {
      setHeight(Number((height / 2.54).toFixed(2)));
      setDepth(Number((depth / 2.54).toFixed(2)));
      setWidth(Number((width / 2.54).toFixed(2)));
      setThickness(Number((thickness / 2.54).toFixed(2)));
    }
    setUnit(newUnit);
  };

  // Cargar un ajuste preestablecido
  const loadPreset = (preset) => {
    if (preset.unit === unit) {
      setHeight(preset.height);
      setDepth(preset.depth);
      setWidth(preset.width);
      setSteps(preset.steps);
    } else {
      // Convertir unidades si el preset está en otra escala
      if (unit === "cm") {
        setHeight(Number((preset.height * 2.54).toFixed(2)));
        setDepth(Number((preset.depth * 2.54).toFixed(2)));
        setWidth(Number((preset.width * 2.54).toFixed(2)));
      } else {
        setHeight(Number((preset.height / 2.54).toFixed(2)));
        setDepth(Number((preset.depth / 2.54).toFixed(2)));
        setWidth(Number((preset.width / 2.54).toFixed(2)));
      }
      setSteps(preset.steps);
    }
  };

  // Cálculos trigonométricos básicos
  const angleRad = Math.atan(height / depth);
  const angleDeg = Number((angleRad * (180 / Math.PI)).toFixed(1));
  const stringerLength = Number(Math.sqrt(height * height + depth * depth).toFixed(2));
  
  // Medidas individuales del escalón
  const riser = Number((height / steps).toFixed(2));
  const tread = Number((depth / steps).toFixed(2));

  // Fórmula de comodidad adaptada (Ley de Blondel en centímetros)
  // 2 * Contrahuella + Huella = 60 a 64 cm ideal (23.6" a 25.2")
  const riserInCm = unit === "cm" ? riser : riser * 2.54;
  const treadInCm = unit === "cm" ? tread : tread * 2.54;
  const blondelValue = 2 * riserInCm + treadInCm;

  // Clasificación de confort y ergonomía para escaleras inclinadas
  let comfortStatus = {
    label: "Óptimo (Residencial)",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    description: "Muy cómoda. Sigue los estándares de una escalera de hogar estándar."
  };

  if (angleDeg > 38 && angleDeg <= 45) {
    comfortStatus = {
      label: "Compacta / Ahorro de Espacio",
      color: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      description: "Cómoda y eficiente. Ideal para lofts, mezanines de adultos y accesos secundarios."
    };
  } else if (angleDeg > 45 && angleDeg <= 52) {
    comfortStatus = {
      label: "Tipo Barco / Litera (Segura)",
      color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      description: "Ángulo empinado para optimizar espacio. Se recomienda usar pasamanos o barandales firmes."
    };
  } else if (angleDeg > 52) {
    comfortStatus = {
      label: "Muy Empinada (Estilo Escalerilla)",
      color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      description: "Requiere subir y bajar siempre de frente a los escalones sujetándose firmemente. Ideal para literas de uso esporádico o adultos."
    };
  } else if (angleDeg < 30) {
    comfortStatus = {
      label: "Rampa muy tendida",
      color: "bg-sky-500/20 text-sky-300 border-sky-500/30",
      description: "Ocupa un espacio horizontal muy amplio."
    };
  }

  // Alerta de huella estrecha
  const isTreadTooNarrow = treadInCm < 17; // menos de 17cm es estrecho
  // Alerta de contrahuella muy alta
  const isRiserTooHigh = riserInCm > 22; // más de 22cm es alto para una escalera normal

  // Coordenadas para renderizar el SVG a escala
  const svgWidth = 480;
  const svgHeight = 360;
  const padding = 50;

  // Encontrar la escala adecuada para que el dibujo siempre quepa en el lienzo
  const maxDrawW = svgWidth - padding * 2;
  const maxDrawH = svgHeight - padding * 2;
  const scale = Math.min(maxDrawW / depth, maxDrawH / height);

  const drawW = depth * scale;
  const drawH = height * scale;

  // El origen (0,0) del triángulo (pared-suelo) estará abajo a la izquierda
  const originX = padding;
  const originY = svgHeight - padding;

  // Puntos del triángulo de la escalera
  const wallTopX = originX;
  const wallTopY = originY - drawH;
  const floorEndX = originX + drawW;
  const floorEndY = originY;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Cabecera de la Aplicación */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                Calculadora de Escaleras para Literas
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Diseño geométrico interactivo y optimización de espacios</p>
          </div>

          {/* Selector de Unidades */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => handleUnitChange("in")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                unit === "in" ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Pulgadas (in)
            </button>
            <button
              onClick={() => handleUnitChange("cm")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                unit === "cm" ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Centímetros (cm)
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Panel de Entradas de Datos - Col 4 */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Tarjeta de Ajustes Preestablecidos */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Historial de Ajustes Realizados
            </h3>
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => loadPreset(preset)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition group flex items-center justify-between"
                >
                  <span className="text-xs text-slate-300 font-medium group-hover:text-cyan-400 transition truncate">
                    {preset.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {preset.steps} Esc
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Formulario de Dimensiones */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Configurar Dimensiones
              </h3>

              {/* Slider / Entrada - ALTO TOTAL */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Alto Total ({unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={height}
                    onChange={(e) => setHeight(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-20 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-2 py-1 text-right text-xs font-mono text-cyan-400 outline-none"
                  />
                </div>
                <input
                  type="range"
                  min={unit === "in" ? "30" : "80"}
                  max={unit === "in" ? "120" : "300"}
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider / Entrada - PROFUNDIDAD TOTAL */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    Profundidad Total ({unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={depth}
                    onChange={(e) => setDepth(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-20 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-2 py-1 text-right text-xs font-mono text-cyan-400 outline-none"
                  />
                </div>
                <input
                  type="range"
                  min={unit === "in" ? "20" : "50"}
                  max={unit === "in" ? "100" : "250"}
                  step="0.1"
                  value={depth}
                  onChange={(e) => setDepth(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider / Entrada - ANCHO TOTAL */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                    Ancho de la Escalera ({unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={width}
                    onChange={(e) => setWidth(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-20 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-2 py-1 text-right text-xs font-mono text-cyan-400 outline-none"
                  />
                </div>
                <input
                  type="range"
                  min={unit === "in" ? "12" : "30"}
                  max={unit === "in" ? "50" : "120"}
                  step="0.5"
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider / Entrada - CANTIDAD DE ESCALONES */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Número de Escalones
                  </label>
                  <span className="text-sm font-bold font-mono text-cyan-400 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-0.5">
                    {steps}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSteps(Math.max(3, steps - 1))}
                    className="w-10 h-8 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 transition font-bold text-slate-300"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="3"
                    max="18"
                    step="1"
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value))}
                    className="flex-1 accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <button
                    onClick={() => setSteps(Math.min(20, steps + 1))}
                    className="w-10 h-8 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 transition font-bold text-slate-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Entrada opcional - Grosor del peldaño */}
              <div className="pt-4 border-t border-slate-800/60">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400">Espesor del material del peldaño</span>
                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                    <input
                      type="number"
                      step="0.05"
                      value={thickness}
                      onChange={(e) => setThickness(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                      className="w-14 bg-transparent border-none text-right font-mono text-xs text-slate-300 outline-none px-1"
                    />
                    <span className="text-[10px] text-slate-500 pr-2 font-mono">{unit}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
              Usa los controles deslizantes para refinar tus dimensiones en tiempo real.
            </div>
          </div>
        </section>

        {/* Panel Central Visual - Col 8 */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* Tarjeta del Visualizador 2D Plano Escala */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-200">Plano Técnico Lateral (Escala Real)</h2>
                <p className="text-xs text-slate-400 mt-0.5">Se actualiza según los cortes de tus zancas</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDimensions(!showDimensions)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    showDimensions 
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" 
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300"
                  }`}
                >
                  {showDimensions ? "Ocultar Cotas" : "Mostrar Cotas"}
                </button>
              </div>
            </div>

            {/* Lienzo SVG del plano de la escalera */}
            <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-4 flex items-center justify-center overflow-hidden relative min-h-[360px]">
              <svg 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto max-w-lg drop-shadow-xl"
              >
                {/* Cuadrícula o Grid de Fondo decorativa */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width={svgWidth} height={svgHeight} fill="url(#grid)" rx="8" />

                {/* Líneas de Guía de Estructura (Suelo y Pared) */}
                <line x1="20" y1={originY} x2={svgWidth - 20} y2={originY} stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
                <line x1={originX} y1="20" x2={originX} y2={svgHeight - 20} stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />

                {/* Ángulo indicador en el suelo */}
                <path
                  d={`M ${floorEndX - 30} ${floorEndY} A 30 30 0 0 0 ${floorEndX - 30 * Math.cos(angleRad)} ${floorEndY - 30 * Math.sin(angleRad)}`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
                <text 
                  x={floorEndX - 42} 
                  y={floorEndY - 12} 
                  fill="#fca5a5" 
                  fontSize="10" 
                  fontWeight="bold"
                  className="font-mono"
                >
                  {angleDeg}°
                </text>

                {/* Zanca principal (El listón de madera lateral que sostiene todo) */}
                <path
                  d={`M ${wallTopX} ${wallTopY} L ${floorEndX} ${floorEndY}`}
                  stroke="#475569"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className="opacity-40"
                />

                {/* Renderizar los Escalones dinámicamente */}
                {Array.from({ length: steps }).map((_, i) => {
                  const stepStartX = originX + (i * (drawW / steps));
                  const stepStartY = originY - (i * (drawH / steps));
                  
                  const stepEndX = originX + ((i + 1) * (drawW / steps));
                  const stepEndY = originY - ((i + 1) * (drawH / steps));

                  const isHovered = interactiveStep === i;

                  return (
                    <g 
                      key={i}
                      onMouseEnter={() => setInteractiveStep(i)}
                      onMouseLeave={() => setInteractiveStep(null)}
                      className="cursor-pointer transition-all duration-150"
                    >
                      {/* Línea del peldaño (Paso horizontal) */}
                      <line
                        x1={stepStartX}
                        y1={stepStartY}
                        x2={stepEndX}
                        y2={stepStartY}
                        stroke={isHovered ? "#22d3ee" : "#38bdf8"}
                        strokeWidth={isHovered ? "5" : "3"}
                      />
                      {/* Línea de la contrahuella (Paso vertical) */}
                      <line
                        x1={stepEndX}
                        y1={stepStartY}
                        x2={stepEndX}
                        y2={stepEndY}
                        stroke={isHovered ? "#22d3ee" : "#38bdf8"}
                        strokeWidth={isHovered ? "5" : "3"}
                        strokeDasharray={isHovered ? "" : "1,2"}
                      />

                      {/* Dibujo volumétrico del peldaño de madera (Espesor) */}
                      <rect
                        x={stepStartX}
                        y={stepStartY}
                        width={stepEndX - stepStartX}
                        height={thickness * scale}
                        fill="#0ea5e9"
                        opacity={isHovered ? "0.9" : "0.5"}
                      />
                    </g>
                  );
                })}

                {/* Marcadores de Dimensión / Cotas (ShowDimensions) */}
                {showDimensions && (
                  <>
                    {/* Cota Altura Total */}
                    <g stroke="#10b981" strokeWidth="1.5">
                      <line x1={originX - 15} y1={originY} x2={originX - 15} y2={wallTopY} />
                      <line x1={originX - 20} y1={originY} x2={originX - 10} y2={originY} />
                      <line x1={originX - 20} y1={wallTopY} x2={originX - 10} y2={wallTopY} />
                    </g>
                    <text
                      x={originX - 24}
                      y={originY - drawH / 2}
                      fill="#34d399"
                      fontSize="10"
                      fontWeight="bold"
                      transform={`rotate(-90, ${originX - 24}, ${originY - drawH / 2})`}
                      textAnchor="middle"
                      className="font-mono"
                    >
                      H: {height} {unit}
                    </text>

                    {/* Cota Profundidad Total */}
                    <g stroke="#f97316" strokeWidth="1.5">
                      <line x1={originX} y1={originY + 15} x2={floorEndX} y2={originY + 15} />
                      <line x1={originX} y1={originY + 10} x2={originX} y2={originY + 20} />
                      <line x1={floorEndX} y1={originY + 10} x2={floorEndX} y2={originY + 20} />
                    </g>
                    <text
                      x={originX + drawW / 2}
                      y={originY + 28}
                      fill="#fb923c"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="font-mono"
                    >
                      D: {depth} {unit}
                    </text>

                    {/* Cota Un Escalón (Detalle) */}
                    {steps > 0 && (
                      <g>
                        {/* Huella */}
                        <path
                          d={`M ${floorEndX - (drawW / steps)} ${originY - 10} L ${floorEndX} ${originY - 10}`}
                          stroke="#22d3ee"
                          strokeWidth="1"
                        />
                        <text
                          x={floorEndX - (drawW / steps) / 2}
                          y={originY - 14}
                          fill="#67e8f9"
                          fontSize="8"
                          textAnchor="middle"
                          className="font-mono"
                        >
                          Huella: {tread}
                        </text>

                        {/* Contrahuella */}
                        <path
                          d={`M ${floorEndX + 10} ${originY} L ${floorEndX + 10} ${originY - (drawH / steps)}`}
                          stroke="#22d3ee"
                          strokeWidth="1"
                        />
                        <text
                          x={floorEndX + 14}
                          y={originY - (drawH / steps) / 2}
                          fill="#67e8f9"
                          fontSize="8"
                          textAnchor="start"
                          className="font-mono"
                        >
                          Alza: {riser}
                        </text>
                      </g>
                    )}
                  </>
                )}
              </svg>

              {/* Leyenda interactiva de selección de escalón */}
              <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 font-mono">
                {interactiveStep !== null ? (
                  <span>Escalón #{interactiveStep + 1}: Seleccionado</span>
                ) : (
                  <span>Pasa el cursor sobre los escalones</span>
                )}
              </div>
            </div>

            {/* Ficha de Resultados Clave de Carpintería */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Ángulo de Corte</span>
                <span className="text-xl font-extrabold text-white font-mono my-1">{angleDeg}°</span>
                <span className="text-[10px] text-slate-400">Pared y Suelo</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Largo Mín. Zanca</span>
                <span className="text-xl font-extrabold text-cyan-400 font-mono my-1">
                  {stringerLength} <span className="text-xs">{unit}</span>
                </span>
                <span className="text-[10px] text-slate-400">Largo hipotenusa</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-500">Paso / Contrahuella</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono my-1">
                  {riser} <span className="text-xs">{unit}</span>
                </span>
                <span className="text-[10px] text-slate-400">Alto del escalón</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-orange-500">Huella / Pisada</span>
                <span className="text-xl font-extrabold text-orange-400 font-mono my-1">
                  {tread} <span className="text-xs">{unit}</span>
                </span>
                <span className="text-[10px] text-slate-400">Profundidad del escalón</span>
              </div>

            </div>
          </div>

          {/* Panel de Ergonomía y Advertencias de Seguridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Evaluación Ergonómica */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Evaluación de Comodidad
                </h3>
                
                {/* Badge de Estatus */}
                <div className={`px-3 py-2 rounded-xl border font-semibold text-xs ${comfortStatus.color} mb-3`}>
                  {comfortStatus.label}
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  {comfortStatus.description}
                </p>
                
                {/* Ley de Blondel */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Fórmula de paso (Blondel):</span>
                    <span className="font-mono text-slate-200">
                      2H + P = {blondelValue.toFixed(1)} cm
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        blondelValue >= 60 && blondelValue <= 64 
                          ? "bg-emerald-500" 
                          : blondelValue >= 55 && blondelValue < 60
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, (blondelValue / 75) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">El rango óptimo residencial estándar es de 60 a 64 cm.</p>
                </div>
              </div>
            </div>

            {/* Advertencias y Sugerencias de Construcción */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Tips de Construcción
              </h3>
              
              <ul className="text-xs text-slate-300 space-y-2.5">
                {isRiserTooHigh && (
                  <li className="flex items-start gap-2 text-amber-400">
                    <span className="mt-0.5 text-base">⚠️</span>
                    <span>
                      <strong>Paso muy alto ({riser} {unit}):</strong> Levantar el pie {riser} pulgadas requiere mayor esfuerzo físico. Asegura pasamanos robustos en ambos lados de la escalera.
                    </span>
                  </li>
                )}

                {isTreadTooNarrow ? (
                  <li className="flex items-start gap-2 text-amber-400">
                    <span className="mt-0.5 text-base">⚠️</span>
                    <span>
                      <strong>Huella estrecha ({tread} {unit}):</strong> El pie no entrará completo de frente. Usa un diseño de <strong>peldaños abiertos</strong>.
                    </span>
                  </li>
                ) : (
                  <li className="flex items-start gap-2 text-emerald-400">
                    <span className="mt-0.5 text-base">✓</span>
                    <span>
                      <strong>Huella cómoda ({tread} {unit}):</strong> El espacio de pisada es amplio y seguro para apoyar el talón con comodidad.
                    </span>
                  </li>
                )}

                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>
                    Al trazar los soportes del tubo de acero, recuerda que el primer soporte debe soldarse a **{Number((riser - thickness).toFixed(2))} {unit}** del suelo para compensar las **{thickness} {unit}** del espesor de los peldaños.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>
                    <strong>Ángulo de Corte:</strong> Corta el extremo de las zancas metálicas a **{angleDeg}°** para el suelo y el ángulo complementario de **{Number((90 - angleDeg).toFixed(1))}°** para asentar en la pared.
                  </span>
                </li>
              </ul>
            </div>

          </div>
        </section>
      </main>

      {/* Pie de página informativo */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        Calculadora geométrica optimizada para el diseño seguro de literas y accesos de alta inclinación.
      </footer>
    </div>
  );
}