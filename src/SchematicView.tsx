import { useMemo, useRef, useState } from 'react'
import {
  Download,
  FileImage,
  Maximize2,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  Sparkles,
  Tag,
} from 'lucide-react'
import type { Project } from './model'
import type { LibraryRecords } from './library'
import {
  buildSchematicLayout,
  SCHEMATIC_COLORS,
  type SchematicComponent,
} from './schematicEngine'

export interface SchematicViewProps {
  project: Project
  libraryRecords?: LibraryRecords
  onClose?: () => void
}

export default function SchematicView({ project, libraryRecords = {} }: SchematicViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [showNetLabels, setShowNetLabels] = useState(true)
  const panStartRef = useRef({ x: 0, y: 0 })
  const currentPanRef = useRef({ x: 0, y: 0 })

  // Custom dragged positions for components in schematic
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null)
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, compX: 0, compY: 0 })

  // Dynamic layout calculation based on active project components & wires
  const layout = useMemo(() => {
    return buildSchematicLayout(project, libraryRecords, customPositions)
  }, [project, libraryRecords, customPositions])

  const zoomIn = () => setScale(s => Math.min(3.5, s * 1.2))
  const zoomOut = () => setScale(s => Math.max(0.3, s / 1.2))
  const resetZoom = () => {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }
  const resetLayout = () => {
    setCustomPositions({})
    setScale(1)
    setPan({ x: 0, y: 0 })
  }

  // Pan controls
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || draggingCompId) return
    setIsPanning(true)
    panStartRef.current = { x: e.clientX, y: e.clientY }
    currentPanRef.current = { ...pan }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingCompId) {
      const dx = (e.clientX - dragStartRef.current.mouseX) / scale
      const dy = (e.clientY - dragStartRef.current.mouseY) / scale
      const newX = Math.round((dragStartRef.current.compX + dx) / 10) * 10
      const newY = Math.round((dragStartRef.current.compY + dy) / 10) * 10
      setCustomPositions(prev => ({
        ...prev,
        [draggingCompId]: { x: newX, y: newY },
      }))
      return
    }

    if (!isPanning) return
    const dx = e.clientX - panStartRef.current.x
    const dy = e.clientY - panStartRef.current.y
    setPan({
      x: currentPanRef.current.x + dx,
      y: currentPanRef.current.y + dy,
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingCompId) {
      setDraggingCompId(null)
    }
    if (isPanning) {
      setIsPanning(false)
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {}
    }
  }

  const handleComponentPointerDown = (e: React.PointerEvent, comp: SchematicComponent) => {
    e.stopPropagation()
    if (e.button !== 0) return
    setDraggingCompId(comp.id)
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      compX: comp.x,
      compY: comp.y,
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.12 : 0.88
    setScale(s => Math.max(0.3, Math.min(3.5, s * factor)))
  }

  const downloadSVG = () => {
    if (!svgRef.current) return
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svgRef.current)
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name || 'circuito'}-esquematico.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPNG = () => {
    if (!svgRef.current) return
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svgRef.current)
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1700
      canvas.height = 1252
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const a = document.createElement('a')
        a.href = canvas.toDataURL('image/png')
        a.download = `${project.name || 'circuito'}-esquematico.png`
        a.click()
      }
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const printSchematic = () => {
    window.print()
  }

  const dateStr = new Date().toLocaleDateString('pt-BR')
  const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const red = SCHEMATIC_COLORS.sheetBorder
  const green = SCHEMATIC_COLORS.wireStroke

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#eef2f5',
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Schematic Action Toolbar */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 20,
          zIndex: 10,
          display: 'flex',
          gap: 6,
          background: '#ffffff',
          padding: '4px 10px',
          borderRadius: 6,
          boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          border: '1px solid #dcdfe4',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#1e293b',
            marginRight: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Sparkles size={14} color="#0082c3" />
          Vista Esquemática
        </span>

        {layout.totalParts > 0 && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              background: '#f1f5f9',
              color: '#475569',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid #e2e8f0',
            }}
          >
            {layout.totalParts} comp · {layout.nets.length} conexões
          </span>
        )}

        <div style={{ width: 1, height: 18, background: '#e2e8f0', margin: '0 4px' }} />

        <button
          onClick={zoomIn}
          title="Aproximar (Zoom In)"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex' }}
        >
          <Plus size={16} color="#475569" />
        </button>
        <button
          onClick={zoomOut}
          title="Afastar (Zoom Out)"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex' }}
        >
          <Minus size={16} color="#475569" />
        </button>
        <button
          onClick={resetZoom}
          title="Ajustar ao tamanho original (100%)"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex' }}
        >
          <Maximize2 size={15} color="#475569" />
        </button>
        <button
          onClick={resetLayout}
          title="Auto-organizar layout / Restaurar posições"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex' }}
        >
          <RotateCcw size={14} color="#475569" />
        </button>
        <button
          onClick={() => setShowNetLabels(prev => !prev)}
          title="Alternar identificadores de redes / etiquetas"
          style={{
            background: showNetLabels ? '#e0f2fe' : 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
          }}
        >
          <Tag size={14} color={showNetLabels ? '#0284c7' : '#475569'} />
        </button>

        <div style={{ width: 1, height: 18, background: '#e2e8f0', margin: '0 4px' }} />

        <button
          onClick={downloadSVG}
          title="Baixar em formato vetorial SVG"
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: 12,
            fontWeight: 600,
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Download size={13} />
          SVG
        </button>
        <button
          onClick={downloadPNG}
          title="Baixar imagem em PNG alta resolução"
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: 12,
            fontWeight: 600,
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <FileImage size={13} />
          PNG
        </button>
        <button
          onClick={printSchematic}
          title="Imprimir folha esquemática"
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: 12,
            fontWeight: 600,
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Printer size={13} />
          Imprimir
        </button>
      </div>

      {/* Interactive Sheet Viewport */}
      <div
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: draggingCompId ? 'grabbing' : isPanning ? 'grabbing' : 'grab',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isPanning || draggingCompId ? 'none' : 'transform 0.1s ease-out',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            background: '#ffffff',
            borderRadius: 2,
          }}
        >
          <svg
            ref={svgRef}
            width="850"
            height="626"
            viewBox="0 0 850 626"
            style={{ display: 'block', background: '#ffffff' }}
          >
            {/* ================= 1. SHEET BORDER & GRID ZONES ================= */}
            <rect x="40" y="30" width="725" height="556" fill="none" stroke={red} strokeWidth="1" />
            <rect x="50" y="40" width="705" height="536" fill="none" stroke={red} strokeWidth="0.5" opacity="0.4" />

            {/* Column zone ticks & numbers (1 to 6) */}
            {[1, 2, 3, 4, 5].map(i => {
              const x = 40 + i * (725 / 6)
              return (
                <g key={`col-tick-${i}`}>
                  <line x1={x} y1="30" x2={x} y2="40" stroke={red} strokeWidth="1" />
                  {i <= 4 && <line x1={x} y1="576" x2={x} y2="586" stroke={red} strokeWidth="1" />}
                </g>
              )
            })}
            {[1, 2, 3, 4, 5, 6].map(i => {
              const x = 40 + (i - 0.5) * (725 / 6)
              return (
                <g key={`col-num-${i}`}>
                  <text x={x} y="38" textAnchor="middle" fill={red} fontSize="9" fontFamily="sans-serif">
                    {i}
                  </text>
                  {i <= 4 && (
                    <text x={x} y="583" textAnchor="middle" fill={red} fontSize="9" fontFamily="sans-serif">
                      {i}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Row zone ticks & letters (A to E) */}
            {[1, 2, 3, 4].map(j => {
              const y = 30 + j * (556 / 5)
              return (
                <g key={`row-tick-${j}`}>
                  <line x1="40" y1={y} x2="50" y2={y} stroke={red} strokeWidth="1" />
                  <line x1="755" y1={y} x2="765" y2={y} stroke={red} strokeWidth="1" />
                </g>
              )
            })}
            {['A', 'B', 'C', 'D', 'E'].map((letter, j) => {
              const y = 30 + (j + 0.5) * (556 / 5) + 3
              return (
                <g key={`row-let-${letter}`}>
                  <text x="45" y={y} textAnchor="middle" fill={red} fontSize="9" fontFamily="sans-serif">
                    {letter}
                  </text>
                  <text x="760" y={y} textAnchor="middle" fill={red} fontSize="9" fontFamily="sans-serif">
                    {letter}
                  </text>
                </g>
              )
            })}

            {/* ================= 2. TITLE BLOCK (BOTTOM-RIGHT) ================= */}
            <g transform="translate(502, 544)">
              <rect x="0" y="0" width="263" height="42" fill="#ffffff" stroke={red} strokeWidth="1" />
              <line x1="0" y1="21" x2="263" y2="21" stroke={red} strokeWidth="0.8" />
              <text x="8" y="14" fill={red} fontSize="9" fontFamily="sans-serif">
                Title: <tspan dx="10" fontWeight="600">{project.name || 'Circuito CircuitLab'}</tspan>
              </text>
              <text x="8" y="34" fill={red} fontSize="8.5" fontFamily="sans-serif">
                Date: <tspan dx="6">{dateStr}, {timeStr}</tspan>
              </text>
              <text x="175" y="34" fill={red} fontSize="8.5" fontFamily="sans-serif">
                Sheet: <tspan dx="4">1/1</tspan>
              </text>
              <text x="215" y="14" fill={red} fontSize="8" fontFamily="sans-serif" opacity="0.8">
                {layout.totalParts} comp
              </text>
            </g>

            {/* ================= 3. FOOTER BRAND (BOTTOM-LEFT) ================= */}
            <text x="56" y="574" fill={red} fontSize="9" fontFamily="sans-serif" fontWeight="600">
              CircuitLab Studio · EDA Schematic Engine
            </text>

            {/* ================= 4. EMPTY STATE MESSAGE ================= */}
            {layout.components.length === 0 && (
              <g transform="translate(425, 270)">
                <circle cx="0" cy="-25" r="28" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <path d="M -8 -25 H 8 M 0 -33 V -17" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <text x="0" y="24" textAnchor="middle" fill="#334155" fontSize="14" fontWeight="600" fontFamily="sans-serif">
                  Nenhum componente esquemático detectado
                </text>
                <text x="0" y="44" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="sans-serif">
                  Adicione componentes como resistores, LEDs, fontes ou portas lógicas para visualizar o esquema elétrico.
                </text>
              </g>
            )}

            {/* ================= 5. DYNAMIC SCHEMATIC WIRES (GREEN #2bb282) ================= */}
            <g stroke={green} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {layout.nets.map(net =>
                net.wirePaths.map((d, pathIdx) => (
                  <path key={`${net.id}-path-${pathIdx}`} d={d} />
                )),
              )}
            </g>

            {/* ================= 6. JUNCTION DOTS (●) ================= */}
            <g fill={green}>
              {layout.nets.flatMap(net =>
                net.junctions.map((j, jIdx) => (
                  <circle key={`${net.id}-junc-${jIdx}`} cx={j.x} cy={j.y} r="2.2" />
                )),
              )}
            </g>

            {/* ================= 7. BUS / NET LABELS (OPTIONAL) ================= */}
            {showNetLabels && (
              <g>
                {layout.nets
                  .filter(net => net.name && net.terminals.length >= 2)
                  .map(net => {
                    // Place label near the last terminal or average position
                    const term = net.terminals[net.terminals.length - 1]
                    const lx = term.x + (term.dir === 'right' ? 8 : term.dir === 'left' ? -38 : 0)
                    const ly = term.y + (term.dir === 'top' ? -12 : term.dir === 'bottom' ? 12 : -4)

                    return (
                      <g key={`net-tag-${net.id}`} transform={`translate(${lx}, ${ly})`}>
                        <polygon
                          points="0,0 4,-3.8 28,-3.8 28,3.8 4,3.8"
                          fill="#ffffff"
                          stroke={net.isPower || net.isGround ? red : '#94a3b8'}
                          strokeWidth="0.8"
                        />
                        <text
                          x="16"
                          y="2"
                          textAnchor="middle"
                          fill={net.isPower || net.isGround ? red : '#475569'}
                          fontSize="5.5"
                          fontFamily="monospace"
                          fontWeight={net.isPower || net.isGround ? '700' : '500'}
                        >
                          {net.name}
                        </text>
                      </g>
                    )
                  })}
              </g>
            )}

            {/* ================= 8. DYNAMIC SCHEMATIC COMPONENTS ================= */}
            {layout.components.map(comp => (
              <g
                key={comp.id}
                transform={`translate(${comp.x}, ${comp.y})`}
                onPointerDown={e => handleComponentPointerDown(e, comp)}
                style={{ cursor: 'move' }}
              >
                {/* Visual Symbol Renderer based on symbolType */}
                <ComponentSymbol comp={comp} red={red} />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}

/** Render individual EDA schematic symbol according to standard IEEE/IEC specifications. */
function ComponentSymbol({ comp, red }: { comp: SchematicComponent; red: string }) {
  const { symbolType, designator, valueText, subText, terminals } = comp

  switch (symbolType) {
    case 'resistor':
    case 'photoresistor':
      return (
        <g>
          {/* Stubs */}
          <line x1="-25" y1="0" x2="-14" y2="0" stroke={red} strokeWidth="1" />
          <line x1="14" y1="0" x2="25" y2="0" stroke={red} strokeWidth="1" />
          {/* IEC Rectangle Body */}
          <rect x="-14" y="-6" width="28" height="12" fill="#ffffff" stroke={red} strokeWidth="1" />
          {/* Photoresistor light arrows */}
          {symbolType === 'photoresistor' && (
            <g stroke={red} strokeWidth="0.8">
              <line x1="-12" y1="-14" x2="-6" y2="-8" />
              <polygon points="-6,-8 -9,-9 -8,-11" fill={red} />
              <line x1="-6" y1="-16" x2="0" y2="-10" />
              <polygon points="0,-10 -3,-11 -2,-13" fill={red} />
            </g>
          )}
          {/* Designator & Value */}
          <text x="0" y="-9" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
          {valueText && (
            <text x="0" y="16" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="sans-serif">
              {valueText}
            </text>
          )}
        </g>
      )

    case 'potentiometer':
      return (
        <g>
          <line x1="-26" y1="8" x2="-14" y2="8" stroke={red} strokeWidth="1" />
          <line x1="14" y1="8" x2="26" y2="8" stroke={red} strokeWidth="1" />
          <rect x="-14" y="2" width="28" height="12" fill="#ffffff" stroke={red} strokeWidth="1" />
          {/* Wiper arrow */}
          <line x1="0" y1="-18" x2="0" y2="0" stroke={red} strokeWidth="1" />
          <polygon points="0,0 -3,-5 3,-5" fill={red} />
          <text x="0" y="-21" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
          {valueText && (
            <text x="0" y="23" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="sans-serif">
              {valueText}
            </text>
          )}
        </g>
      )

    case 'capacitor':
    case 'polarized_capacitor': {
      const isPolarized = symbolType === 'polarized_capacitor'
      return (
        <g>
          <line x1="-22" y1="0" x2="-5" y2="0" stroke={red} strokeWidth="1" />
          <line x1="5" y1="0" x2="22" y2="0" stroke={red} strokeWidth="1" />
          {/* Plate 1 (Anode / Flat) */}
          <line x1="-5" y1="-10" x2="-5" y2="10" stroke={red} strokeWidth="1.5" />
          {/* Plate 2 (Cathode: flat for ceramic, curved for electrolytic) */}
          {isPolarized ? (
            <path d="M 5 -10 A 12 12 0 0 1 5 10" fill="none" stroke={red} strokeWidth="1.5" />
          ) : (
            <line x1="5" y1="-10" x2="5" y2="10" stroke={red} strokeWidth="1.5" />
          )}
          {isPolarized && (
            <text x="-9" y="-6" textAnchor="middle" fill={red} fontSize="8" fontWeight="bold">
              +
            </text>
          )}
          <text x="0" y="-13" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
          {valueText && (
            <text x="0" y="19" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="sans-serif">
              {valueText}
            </text>
          )}
        </g>
      )
    }

    case 'inductor':
      return (
        <g>
          <line x1="-26" y1="0" x2="-18" y2="0" stroke={red} strokeWidth="1" />
          <line x1="18" y1="0" x2="26" y2="0" stroke={red} strokeWidth="1" />
          {/* 3 Coils */}
          <path
            d="M -18 0 A 6 6 0 0 1 -6 0 A 6 6 0 0 1 6 0 A 6 6 0 0 1 18 0"
            fill="none"
            stroke={red}
            strokeWidth="1.2"
          />
          <text x="0" y="-10" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
          {valueText && (
            <text x="0" y="14" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="sans-serif">
              {valueText}
            </text>
          )}
        </g>
      )

    case 'diode':
    case 'zener_diode': {
      const isZener = symbolType === 'zener_diode'
      return (
        <g>
          <line x1="-22" y1="0" x2="-6" y2="0" stroke={red} strokeWidth="1" />
          <line x1="6" y1="0" x2="22" y2="0" stroke={red} strokeWidth="1" />
          {/* Diode Triangle */}
          <polygon points="-6,-6 6,0 -6,6" fill="#ffffff" stroke={red} strokeWidth="1" strokeLinejoin="round" />
          {/* Cathode Bar */}
          {isZener ? (
            <path d="M 4 -8 L 6 -6 V 6 L 8 8" fill="none" stroke={red} strokeWidth="1" />
          ) : (
            <line x1="6" y1="-7" x2="6" y2="7" stroke={red} strokeWidth="1.2" />
          )}
          <text x="0" y="-10" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
        </g>
      )
    }

    case 'led':
      return (
        <g>
          <line x1="-22" y1="0" x2="-6" y2="0" stroke={red} strokeWidth="1" />
          <line x1="6" y1="0" x2="22" y2="0" stroke={red} strokeWidth="1" />
          <polygon points="-6,-6 6,0 -6,6" fill="#ffffff" stroke={red} strokeWidth="1" strokeLinejoin="round" />
          <line x1="6" y1="-7" x2="6" y2="7" stroke={red} strokeWidth="1.2" />
          {/* Emission arrows */}
          <line x1="-1" y1="-7" x2="4" y2="-12" stroke={red} strokeWidth="0.8" />
          <polygon points="4,-12 2,-11 3,-9.5" fill={red} />
          <line x1="3" y1="-5" x2="8" y2="-10" stroke={red} strokeWidth="0.8" />
          <polygon points="8,-10 6,-9 7,-7.5" fill={red} />
          <text x="0" y="-12" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
          {valueText && (
            <text x="0" y="16" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="sans-serif">
              {valueText}
            </text>
          )}
        </g>
      )

    case 'supply':
      return (
        <g>
          {/* Main Power Supply Chassis */}
          <rect
            x="-40"
            y="-29"
            width="80"
            height="58"
            rx="4"
            fill="#ffffff"
            stroke={red}
            strokeWidth="1.2"
          />

          {/* Header Band */}
          <rect
            x="-40"
            y="-29"
            width="80"
            height="13"
            rx="3"
            fill="#fef2f2"
            stroke={red}
            strokeWidth="0.8"
          />
          <text
            x="0"
            y="-20"
            textAnchor="middle"
            fill={red}
            fontSize="6.5"
            fontWeight="bold"
            fontFamily="sans-serif"
            letterSpacing="0.5"
          >
            FONTE DE ENERGIA
          </text>

          {/* Designator above chassis */}
          <text
            x="0"
            y="-33"
            textAnchor="middle"
            fill={red}
            fontSize="9"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            {designator}
          </text>

          {/* Voltage Display (Left) */}
          <rect x="-34" y="-12" width="46" height="15" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
          <text x="-11" y="-1" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="bold" fontFamily="monospace">
            {valueText.split('·')[0]?.trim() || '5.0 V'}
          </text>

          {/* Current Display (Left) */}
          <rect x="-34" y="6" width="46" height="15" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
          <text x="-11" y="17" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">
            {valueText.split('·')[1]?.trim() || '5.0 A'}
          </text>

          {/* POSITIVE (+) Output Terminal / Binding Post */}
          <circle cx="24" cy="-14" r="6" fill="#ef4444" stroke={red} strokeWidth="0.8" />
          <text x="24" y="-11.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
            +
          </text>
          <line x1="30" y1="-14" x2="42" y2="-14" stroke={red} strokeWidth="1.2" />
          <text x="32" y="-19" textAnchor="middle" fill="#ef4444" fontSize="6" fontWeight="bold">
            +
          </text>

          {/* NEGATIVE (-) Output Terminal / Binding Post */}
          <circle cx="24" cy="14" r="6" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
          <line x1="21" y1="14" x2="27" y2="14" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="30" y1="14" x2="42" y2="14" stroke={red} strokeWidth="1.2" />
          <text x="32" y="24" textAnchor="middle" fill="#475569" fontSize="6.5" fontWeight="bold">
            -
          </text>
        </g>
      )

    case 'battery':
      return (
        <g>
          {/* Stubs */}
          <line x1="-24" y1="-8" x2="-10" y2="-8" stroke={red} strokeWidth="1" />
          <line x1="10" y1="8" x2="24" y2="8" stroke={red} strokeWidth="1" />
          {/* Positive Long Plate */}
          <line x1="-10" y1="-16" x2="-10" y2="0" stroke={red} strokeWidth="1.4" />
          {/* Negative Short Thick Plate */}
          <line x1="-4" y1="-12" x2="-4" y2="-4" stroke={red} strokeWidth="2.8" />
          {/* Second cell */}
          <line x1="4" y1="-4" x2="4" y2="12" stroke={red} strokeWidth="1.4" />
          <line x1="10" y1="0" x2="10" y2="8" stroke={red} strokeWidth="2.8" />
          {/* Sinais + e - */}
          <text x="-16" y="-11" fill={red} fontSize="7" fontWeight="bold">
            +
          </text>
          <text x="16" y="5" fill={red} fontSize="7" fontWeight="bold">
            -
          </text>
          <text x="0" y="-19" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
          {valueText && (
            <text x="0" y="24" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="sans-serif">
              {valueText}
            </text>
          )}
        </g>
      )

    case 'vcc':
      return (
        <g>
          <line x1="0" y1="15" x2="0" y2="0" stroke={red} strokeWidth="1" />
          <polygon points="0,0 -4,6 4,6" fill={red} />
          <text x="0" y="-5" textAnchor="middle" fill={red} fontSize="8" fontWeight="700" fontFamily="sans-serif">
            {valueText || 'VCC'}
          </text>
        </g>
      )

    case 'gnd':
      return (
        <g>
          <line x1="0" y1="-15" x2="0" y2="0" stroke={red} strokeWidth="1" />
          <line x1="-10" y1="0" x2="10" y2="0" stroke={red} strokeWidth="1.5" />
          <line x1="-6" y1="4" x2="6" y2="4" stroke={red} strokeWidth="1.2" />
          <line x1="-2" y1="8" x2="2" y2="8" stroke={red} strokeWidth="1" />
          <text x="0" y="18" textAnchor="middle" fill={red} fontSize="7" fontWeight="600" fontFamily="sans-serif">
            GND
          </text>
        </g>
      )

    case 'generator':
      return (
        <g>
          <rect x="-24" y="-18" width="48" height="36" fill="#ffffff" stroke={red} strokeWidth="1" />
          <line x1="24" y1="-8" x2="28" y2="-8" stroke={red} strokeWidth="1" />
          <line x1="24" y1="8" x2="28" y2="8" stroke={red} strokeWidth="1" />
          <text x="18" y="-5" fill={red} fontSize="6" fontWeight="bold">+</text>
          <text x="18" y="11" fill={red} fontSize="6" fontWeight="bold">-</text>
          {/* Big G */}
          <text x="-4" y="2" textAnchor="middle" fill={red} fontSize="14" fontWeight="600" fontFamily="sans-serif">
            G
          </text>
          {/* Sine wave */}
          <path d="M -12 10 Q -8 5 -4 10 Q 0 15 4 10" fill="none" stroke={red} strokeWidth="1" />
          <text x="0" y="-22" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
          {valueText && (
            <text x="0" y="26" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="sans-serif">
              {valueText}
            </text>
          )}
        </g>
      )

    case 'pushbutton':
      return (
        <g>
          <line x1="-22" y1="-8" x2="-8" y2="-8" stroke={red} strokeWidth="1" />
          <line x1="-22" y1="8" x2="-8" y2="8" stroke={red} strokeWidth="1" />
          <line x1="8" y1="-8" x2="22" y2="-8" stroke={red} strokeWidth="1" />
          <line x1="8" y1="8" x2="22" y2="8" stroke={red} strokeWidth="1" />
          <circle cx="-8" cy="-8" r="1.5" fill="#ffffff" stroke={red} strokeWidth="1" />
          <circle cx="8" cy="-8" r="1.5" fill="#ffffff" stroke={red} strokeWidth="1" />
          {/* Switch bar & plunger */}
          <line x1="-10" y1="-12" x2="10" y2="-12" stroke={red} strokeWidth="1.2" />
          <line x1="0" y1="-12" x2="0" y2="-18" stroke={red} strokeWidth="1" />
          <line x1="-4" y1="-18" x2="4" y2="-18" stroke={red} strokeWidth="1.5" />
          <text x="0" y="-22" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
        </g>
      )

    case 'switch_spdt':
      return (
        <g>
          <line x1="-22" y1="0" x2="-8" y2="0" stroke={red} strokeWidth="1" />
          <line x1="8" y1="-8" x2="22" y2="-8" stroke={red} strokeWidth="1" />
          <line x1="8" y1="8" x2="22" y2="8" stroke={red} strokeWidth="1" />
          <circle cx="-8" cy="0" r="1.5" fill="#ffffff" stroke={red} strokeWidth="1" />
          <circle cx="8" cy="-8" r="1.5" fill="#ffffff" stroke={red} strokeWidth="1" />
          <circle cx="8" cy="8" r="1.5" fill="#ffffff" stroke={red} strokeWidth="1" />
          {/* Lever */}
          <line x1="-8" y1="0" x2="6" y2="-7" stroke={red} strokeWidth="1.2" />
          <text x="0" y="-16" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
        </g>
      )

    case 'gate_and':
    case 'gate_nand':
      return (
        <g>
          {/* Inputs */}
          <line x1="-26" y1="-7" x2="-14" y2="-7" stroke={red} strokeWidth="1" />
          <line x1="-26" y1="7" x2="-14" y2="7" stroke={red} strokeWidth="1" />
          {/* AND Body */}
          <path d="M -14 -12 H 0 A 12 12 0 0 1 0 12 H -14 Z" fill="#ffffff" stroke={red} strokeWidth="1" />
          {symbolType === 'gate_nand' ? (
            <>
              <circle cx="14" cy="0" r="2" fill="#ffffff" stroke={red} strokeWidth="1" />
              <line x1="16" y1="0" x2="26" y2="0" stroke={red} strokeWidth="1" />
            </>
          ) : (
            <line x1="12" y1="0" x2="26" y2="0" stroke={red} strokeWidth="1" />
          )}
          <text x="-4" y="-16" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
        </g>
      )

    case 'gate_or':
    case 'gate_nor':
      return (
        <g>
          <line x1="-26" y1="-7" x2="-10" y2="-7" stroke={red} strokeWidth="1" />
          <line x1="-26" y1="7" x2="-10" y2="7" stroke={red} strokeWidth="1" />
          {/* OR Body */}
          <path
            d="M -16 -12 Q -8 0 -16 12 Q 2 12 10 0 Q 2 -12 -16 -12 Z"
            fill="#ffffff"
            stroke={red}
            strokeWidth="1"
          />
          {symbolType === 'gate_nor' ? (
            <>
              <circle cx="12" cy="0" r="2" fill="#ffffff" stroke={red} strokeWidth="1" />
              <line x1="14" y1="0" x2="26" y2="0" stroke={red} strokeWidth="1" />
            </>
          ) : (
            <line x1="10" y1="0" x2="26" y2="0" stroke={red} strokeWidth="1" />
          )}
          <text x="-2" y="-16" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
        </g>
      )

    case 'gate_not':
      return (
        <g>
          <line x1="-24" y1="0" x2="-10" y2="0" stroke={red} strokeWidth="1" />
          <polygon points="-10,-10 6,0 -10,10" fill="#ffffff" stroke={red} strokeWidth="1" />
          <circle cx="8" cy="0" r="2" fill="#ffffff" stroke={red} strokeWidth="1" />
          <line x1="10" y1="0" x2="24" y2="0" stroke={red} strokeWidth="1" />
          <text x="-2" y="-14" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
        </g>
      )

    case 'gate_xor':
      return (
        <g>
          <line x1="-26" y1="-7" x2="-12" y2="-7" stroke={red} strokeWidth="1" />
          <line x1="-26" y1="7" x2="-12" y2="7" stroke={red} strokeWidth="1" />
          {/* Dual curve for XOR */}
          <path d="M -18 -12 Q -10 0 -18 12" fill="none" stroke={red} strokeWidth="1" />
          <path
            d="M -14 -12 Q -6 0 -14 12 Q 4 12 12 0 Q 4 -12 -14 -12 Z"
            fill="#ffffff"
            stroke={red}
            strokeWidth="1"
          />
          <line x1="12" y1="0" x2="26" y2="0" stroke={red} strokeWidth="1" />
          <text x="-2" y="-16" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
        </g>
      )

    case 'transistor_npn':
    case 'transistor_pnp': {
      const isNpn = symbolType === 'transistor_npn'
      return (
        <g>
          {/* Transistor circle */}
          <circle cx="0" cy="0" r="16" fill="#ffffff" stroke={red} strokeWidth="1" />
          {/* Base bar */}
          <line x1="-6" y1="-9" x2="-6" y2="9" stroke={red} strokeWidth="1.5" />
          <line x1="-20" y1="0" x2="-6" y2="0" stroke={red} strokeWidth="1" />
          {/* Collector */}
          <line x1="-6" y1="-4" x2="8" y2="-12" stroke={red} strokeWidth="1" />
          <line x1="8" y1="-12" x2="14" y2="-20" stroke={red} strokeWidth="1" />
          {/* Emitter */}
          <line x1="-6" y1="4" x2="8" y2="12" stroke={red} strokeWidth="1" />
          <line x1="8" y1="12" x2="14" y2="20" stroke={red} strokeWidth="1" />
          {/* Arrow */}
          {isNpn ? (
            <polygon points="8,12 3,11 6,7" fill={red} />
          ) : (
            <polygon points="-3,5 2,4 -1,8" fill={red} />
          )}
          <text x="0" y="-20" textAnchor="middle" fill={red} fontSize="8" fontWeight="600" fontFamily="sans-serif">
            {designator}
          </text>
        </g>
      )
    }

    case 'ic_jk74hc73':
    case 'ic_nand74hc00':
    case 'ic_dff7474':
    case 'sensor':
    case 'ic_generic':
    default: {
      const halfW = comp.width / 2
      const halfH = comp.height / 2

      return (
        <g>
          {/* IC Body Box */}
          <rect
            x={-halfW}
            y={-halfH}
            width={comp.width}
            height={comp.height}
            fill="#ffffff"
            stroke={red}
            strokeWidth="1"
          />

          {/* IC Header Band */}
          <rect
            x={-halfW}
            y={-halfH}
            width={comp.width}
            height={12}
            fill="#fef2f2"
            stroke={red}
            strokeWidth="0.8"
          />
          <text
            x="0"
            y={-halfH + 9}
            textAnchor="middle"
            fill={red}
            fontSize="7"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            {subText || designator}
          </text>

          {/* Designator above box */}
          <text
            x="0"
            y={-halfH - 4}
            textAnchor="middle"
            fill={red}
            fontSize="8.5"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            {designator}
          </text>

          {/* Pin Stubs & Labels */}
          {terminals.map(term => {
            const relX = term.x - comp.x
            const relY = term.y - comp.y
            const isLeft = term.dir === 'left'

            return (
              <g key={term.id}>
                {/* Stub line */}
                <line
                  x1={isLeft ? -halfW : halfW}
                  y1={relY}
                  x2={relX}
                  y2={relY}
                  stroke={red}
                  strokeWidth="0.8"
                />

                {/* Clock triangle */}
                {term.isClock && (
                  <polygon
                    points={`${isLeft ? -halfW : halfW},${relY - 3} ${isLeft ? -halfW + 4 : halfW - 4},${relY} ${isLeft ? -halfW : halfW},${relY + 3}`}
                    fill="none"
                    stroke={red}
                    strokeWidth="0.8"
                  />
                )}

                {/* Invert circle */}
                {term.isInverted && (
                  <circle
                    cx={isLeft ? -halfW - 2 : halfW + 2}
                    cy={relY}
                    r="1.5"
                    fill="#ffffff"
                    stroke={red}
                    strokeWidth="0.8"
                  />
                )}

                {/* Pin Name Label */}
                <text
                  x={isLeft ? -halfW + 4 : halfW - 4}
                  y={relY + 2.5}
                  textAnchor={isLeft ? 'start' : 'end'}
                  fill={red}
                  fontSize="5.5"
                  fontFamily="sans-serif"
                  fontWeight="600"
                >
                  {term.label}
                </text>
              </g>
            )
          })}
        </g>
      )
    }
  }
}
