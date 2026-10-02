import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type Dispatch, type PointerEvent, type SetStateAction, type WheelEvent } from 'react'
import { board, boardGroup, boardPoint, columnX, isBreadboardPart, pinOffset, railY, rowY, terminalPosition, type Point } from './layout'
import { pinId, pinNames, type Level, type Part, type Project, type Simulation, type Wire, type WirePoint } from './model'
import { chipPinInfo, friendlyPinLabel } from './pinout'
import { roundedWirePath, snapBendPoint, wirePolylinePoints, type SnapGuide } from './wireGeometry'
import { connectionTargets, nearestConnectionTarget, terminalLabel } from './connectionTargets'
import { findDirectContact, isDirectContact } from './directContacts'
import {
  libraryAssetUrl,
  libraryFrame,
  libraryIdFromPart,
  libraryPinNameForKind,
  libraryPinNames,
  libraryPinOffset,
  type LibraryRecord,
  type LibraryRecords,
} from './library'

export type View = { x: number; y: number; width: number; height: number }
type Drag =
  | { type: 'part'; part: string; start: Point; original: Project; initial: Point; moved: boolean }
  | { type: 'bend'; wireId: string; bendIndex: number; start: Point; original: Project; initial: Point; currentBends: Point[]; moved: boolean }
  | { type: 'wire-segment'; wireId: string; segmentIndex: number; start: Point; original: Project; initialPoint: Point; currentBends: Point[]; moved: boolean }
  | { type: 'endpoint'; wireId: string; endpoint: 'from' | 'to'; start: Point; original: Project; currentPos: Point; targetTerminal?: string; moved: boolean }
type Pan = { x: number; y: number; view: View }
type Props = {
  project: Project
  simulation?: Simulation
  libraryRecords: LibraryRecords
  selected?: string
  pending?: string
  wireBends: WirePoint[]
  wireColor: string
  view: View
  setView: Dispatch<SetStateAction<View>>
  onSelect: (id?: string) => void
  onTerminal: (id: string) => void
  onWireBend: (point: Point) => void
  onMovePart: (id: string, x: number, y: number) => void
  onDropPart: (original: Project) => void
  onToggleButton: (id: string, pressed: boolean) => void
  onCancelWire: () => void
  onUpdateWire?: (wireId: string, changes: Partial<Wire>, recordHistory?: boolean) => void
}

const signalColor = (level?: Level) => (level === '1' ? '#22c55e' : level === '0' ? '#0284c7' : '#94a3b8')

function resistorBands(ohms: number): [string, string, string] {
  if (!Number.isFinite(ohms) || ohms <= 0) return ['#dc2626', '#dc2626', '#78350f']
  const digits = ['#1e293b', '#78350f', '#dc2626', '#ea580c', '#eab308', '#16a34a', '#2563eb', '#7c3aed', '#64748b', '#f8fafc']
  let multiplier = Math.floor(Math.log10(ohms)) - 1
  let significant = Math.round(ohms / 10 ** multiplier)
  if (significant >= 100) {
    significant = 10
    multiplier++
  }
  const band = multiplier < -2 ? '#94a3b8' : multiplier === -2 ? '#cbd5e1' : multiplier === -1 ? '#eab308' : digits[Math.min(multiplier, 9)]
  return [digits[Math.min(9, Math.floor(significant / 10))], digits[significant % 10], band]
}

function Knob({
  x,
  y,
  label,
  minLabel,
  maxLabel,
  angle = -140,
}: {
  x: number
  y: number
  label?: string
  minLabel?: string
  maxLabel?: string
  angle?: number
}) {
  const rad = angle * (Math.PI / 180)
  const dotX = Math.sin(rad) * 11
  const dotY = -Math.cos(rad) * 11
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={17} fill="url(#knobFace)" stroke="#a2a5ab" strokeWidth={1} filter="url(#componentShadow)" />
      <circle r={13.5} fill="#dcdee2" stroke="#b8bac0" strokeWidth={0.8} />
      <circle cx={dotX} cy={dotY} r={1.8} fill="#2d3034" />
      {minLabel && (
        <text x={-16} y={15} fontSize={6.5} fill="#6e727a" fontWeight={800} textAnchor="start">
          {minLabel}
        </text>
      )}
      {maxLabel && (
        <text x={16} y={15} fontSize={6.5} fill="#6e727a" fontWeight={800} textAnchor="end">
          {maxLabel}
        </text>
      )}
      {label && (
        <text x={0} y={-22} fontSize={7} fill="#6e727a" fontWeight={800} textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  )
}

function Display({
  x,
  y,
  width = 112,
  height = 52,
  value,
  unit,
  label,
  on = true,
}: {
  x: number
  y: number
  width?: number
  height?: number
  value: string
  unit: string
  label?: string
  on?: boolean
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={0} width={width} height={height} rx={3} fill="#383b40" stroke="#25272a" strokeWidth={1} filter="url(#componentShadow)" />
      <rect x={3} y={3} width={width - 6} height={height - 6} rx={2} fill="#ccd6d8" />
      {label && (
        <text x={6} y={12} fill="#4f595b" fontSize={6.5} fontWeight={800} letterSpacing={0.5}>
          {label}
        </text>
      )}
      <text
        x={width - 24}
        y={height - 14}
        fill="#1a2024"
        fontSize={22}
        fontWeight={700}
        textAnchor="end"
        fontFamily="monospace"
        letterSpacing={0.5}
      >
        {on ? value : '0.00'}
      </text>
      <text x={width - 8} y={height - 14} fill="#1a2024" fontSize={12} fontWeight={800} textAnchor="end" fontFamily="sans-serif">
        {unit}
      </text>
    </g>
  )
}

function BindingPost({
  x,
  y,
  color = 'red',
  label,
  connected,
}: {
  x: number
  y: number
  color?: 'red' | 'black' | 'green'
  label?: string
  connected?: boolean
}) {
  const isRed = color === 'red'
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={10} fill={isRed ? '#dc2626' : '#33373d'} stroke={isRed ? '#991b1b' : '#1f2226'} strokeWidth={1.2} filter="url(#componentShadow)" />
      <circle r={4.5} fill="#111827" />
      {connected && <circle r={6.5} fill={isRed ? '#ef4444' : '#4b5563'} stroke="#ffffff" strokeWidth={1} />}
      {label && (
        <text x={0} y={18} textAnchor="middle" fill="#64748b" fontSize={7} fontWeight={800}>
          {label}
        </text>
      )}
    </g>
  )
}

function PartFigure({
  part,
  project,
  simulation,
  libraryRecord,
  selected,
  onToggleButton,
  onPointerDown,
}: {
  part: Part
  project: Project
  simulation?: Simulation
  libraryRecord?: LibraryRecord
  selected: boolean
  onToggleButton: (id: string, pressed: boolean) => void
  onPointerDown: (e: PointerEvent<SVGGElement>) => void
}) {
  const level = (pin: string) => simulation?.levels[pinId(part, pin)]
  const isSource = ['vcc', 'gnd', 'clock'].includes(part.kind)
  const isGate = ['and', 'or', 'not', 'nand', 'nor', 'xor'].includes(part.kind)
  const isLedPart = part.kind === 'led' || part.properties?.simulationModel === 'led2'
  const isLedOn = simulation?.leds[part.id] === '1'

  const ledColorMap: Record<string, { main: string; dark: string; glow: string; die: string }> = {
    red: { main: '#ef4444', dark: '#991b1b', glow: '#dc2626', die: '#fecaca' },
    green: { main: '#1e7e34', dark: '#155724', glow: '#22c55e', die: '#bbf7d0' },
    yellow: { main: '#ca8a04', dark: '#854d0e', glow: '#facc15', die: '#fef08a' },
    orange: { main: '#ea580c', dark: '#9a3412', glow: '#fb923c', die: '#fed7aa' },
    blue: { main: '#0284c7', dark: '#075985', glow: '#38bdf8', die: '#bae6fd' },
    white: { main: '#e2e8f0', dark: '#94a3b8', glow: '#ffffff', die: '#ffffff' },
  }

  const ledColorKey = String(part.properties?.color ?? 'green')
  const ledTheme = ledColorMap[ledColorKey] ?? ledColorMap.green
  const bands = resistorBands(Number(part.properties?.ohms ?? 220))
  const isChip = ['dff7474', 'jk74hc73', 'nand74hc00'].includes(part.kind)
  const isInstrument = part.kind === 'supply' || part.kind === 'generator'
  const isPassive = part.kind === 'resistor' || part.kind === 'led'
  const isButton = part.kind === 'button'
  const isLibraryBreadboard = part.kind === 'library' && Boolean(libraryRecord?.name.startsWith('Breadboard'))
  const connected = (pin: string) => project.wires.some(w => w.from === pinId(part, pin) || w.to === pinId(part, pin))
  const hasLibraryMetadata = Boolean(libraryIdFromPart(part))
  const libraryImageFrame = hasLibraryMetadata ? libraryFrame(libraryRecord, part.kind === 'library' ? undefined : part.kind) : undefined
  const visiblePins = part.kind === 'library' ? libraryPinNames(libraryRecord) : pinNames[part.kind]
  const librarySvg = libraryRecord?.svgs?.find(svg => svg.type === 'breadboard') ?? libraryRecord?.svgs?.[0]
  const libraryPath = String(part.properties?.libraryPath ?? '')
  const libraryImage = hasLibraryMetadata && librarySvg && libraryPath
    ? libraryAssetUrl(`${libraryPath}/${librarySvg.file}`)
    : (part.properties?.libraryThumbnail ? libraryAssetUrl(String(part.properties.libraryThumbnail)) : undefined)
  const libraryImageRect = libraryImageFrame ?? { x: -48, y: -30, width: 96, height: 60 }
  const lightBulbBrightness = part.properties?.simulationModel === 'lightBulb'
    ? Math.min(1, Math.max(0, simulation?.lightBulbBrightness?.[part.id] ?? 0))
    : 0
  const vibrationMotorAmplitude = part.properties?.simulationModel === 'vibration_motor'
    ? Math.min(1, Math.max(0, simulation?.vibrationMotorAmplitude?.[part.id] ?? 0))
    : 0
  const rgbBrightness = part.properties?.simulationModel === 'ledRGB'
    ? simulation?.rgbLedDisplayBrightness?.[part.id] ?? { red: 0, green: 0, blue: 0 }
    : { red: 0, green: 0, blue: 0 }
  const sevenSegmentBrightness = part.properties?.simulationModel === 'seven_segment_digit_5011bh'
    ? simulation?.sevenSegmentDisplayBrightness?.[part.id] ?? { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, dp: 0 }
    : { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, dp: 0 }

  return (
    <g
      transform={`translate(${part.x} ${part.y}) rotate(${part.rotation})`}
      className={`part ${selected ? 'part-selected' : ''}`}
      data-part={part.id}
      data-led-state={isLedPart ? simulation?.leds[part.id] ?? 'X' : undefined}
      data-vibration-amplitude={vibrationMotorAmplitude}
      data-rgb-brightness={`${rgbBrightness.red},${rgbBrightness.green},${rgbBrightness.blue}`}
      data-seven-segment-brightness={Object.values(sevenSegmentBrightness).join(',')}
      style={vibrationMotorAmplitude > 0 ? {
        '--vibration-positive-offset': `${vibrationMotorAmplitude * 1.2}px`,
        '--vibration-negative-offset': `${vibrationMotorAmplitude * -1.2}px`,
      } as CSSProperties : undefined}
      onPointerDown={onPointerDown}
    >
      {libraryImage && (
        <g>
          <rect
            x={libraryImageRect.x}
            y={libraryImageRect.y}
            width={libraryImageRect.width}
            height={libraryImageRect.height}
            fill="transparent"
            pointerEvents="all"
          />
          <image
            className={vibrationMotorAmplitude > 0 ? 'vibration-motor-image' : undefined}
            href={libraryImage}
            x={libraryImageRect.x}
            y={libraryImageRect.y}
            width={libraryImageRect.width}
            height={libraryImageRect.height}
            preserveAspectRatio="none"
            pointerEvents="none"
          />
          {Object.values(rgbBrightness).some(value => value > 0) && <g className="rgb-led-glow" pointerEvents="none">
            {([
              { color: '#ef4444', brightness: rgbBrightness.red, offset: -0.12 },
              { color: '#22c55e', brightness: rgbBrightness.green, offset: 0 },
              { color: '#3b82f6', brightness: rgbBrightness.blue, offset: 0.12 },
            ] as const).map(channel => <circle key={channel.color} cx={libraryImageRect.width * channel.offset} cy={libraryImageRect.y + libraryImageRect.height * 0.42} r={Math.min(libraryImageRect.width, libraryImageRect.height) * 0.32} fill={channel.color} opacity={channel.brightness * 0.4} filter="url(#ledBloom)" />)}
          </g>}
          {lightBulbBrightness > 0 && <g className="light-bulb-glow" pointerEvents="none">
            <circle cx={0} cy={libraryImageRect.y + libraryImageRect.height * 0.42} r={Math.min(libraryImageRect.width, libraryImageRect.height) * 0.32} fill="#f59e0b" opacity={lightBulbBrightness * 0.28} filter="url(#ledBloom)" />
            <circle cx={0} cy={libraryImageRect.y + libraryImageRect.height * 0.42} r={Math.min(libraryImageRect.width, libraryImageRect.height) * 0.16} fill="#fde68a" opacity={lightBulbBrightness * 0.3} filter="url(#ledGlow)" />
          </g>}
          {part.properties?.simulationModel === 'seven_segment_digit_5011bh' && <g className="seven-segment-glow" pointerEvents="none" transform={`scale(${libraryImageFrame?.scaleX ?? 1} ${libraryImageFrame?.scaleY ?? 1})`}>
            {([
              ['a', '-6.094,-25 -8.085,-23.342 -5.405,-20.123 12.831,-20.123 16.888,-23.499 15.638,-25'],
              ['b', '15.129,-2.87 18.438,-21.637 17.668,-22.562 12.957,-18.641 10.292,-3.525 12.594,-0.76'],
              ['c', '10.852,21.385 14.102,2.958 12.437,0.958 8.997,3.821 6.307,19.075 9.303,22.674'],
              ['d', '6.51,25 8.366,23.454 5.588,20.117 -11.838,20.117 -15.946,23.537 -14.728,25'],
              ['e', '-12.424,0.812 -15.395,3.285 -18.363,20.117 -18.363,20.117 -18.438,20.543 -16.726,22.6 -13.353,19.791 -10.429,3.209'],
              ['f', '-9.022,-22.562 -11.15,-20.791 -14.239,-3.274 -12.267,-0.905 -9.262,-3.407 -6.433,-19.452'],
              ['g', '9.559,-2.499 -8.446,-2.499 -11.487,0.032 -9.534,2.378 8.825,2.378 11.657,0.021'],
            ] as const).map(([segment, points]) => <polygon key={segment} points={points} fill="#ff334f" opacity={sevenSegmentBrightness[segment as keyof typeof sevenSegmentBrightness]} filter="url(#ledGlow)" />)}
            <circle cx={16.239} cy={22.815} r={2.718} fill="#ff334f" opacity={sevenSegmentBrightness.dp} filter="url(#ledGlow)" />
          </g>}
          {selected && (
            <rect
              x={libraryImageRect.x - 2}
              y={libraryImageRect.y - 2}
              width={libraryImageRect.width + 4}
              height={libraryImageRect.height + 4}
              fill="none"
              stroke="#0082c3"
              strokeWidth={1.6}
              pointerEvents="none"
            />
          )}
        </g>
      )}

      {hasLibraryMetadata && !libraryImage && (
        <g pointerEvents="none">
          <rect x={libraryImageRect.x - 3} y={libraryImageRect.y - 3} width={libraryImageRect.width + 6} height={libraryImageRect.height + 6} rx={3} fill="#ffffff" stroke="#d7e0e5" />
          <text x={0} y={4} textAnchor="middle" fill="#64748b" fontSize={7}>Carregando SVG local…</text>
        </g>
      )}
      {part.kind === 'button' && hasLibraryMetadata && (
        <circle
          cx={0}
          cy={0}
          r={13}
          fill="transparent"
          className="toggle-target"
          onPointerDown={event => {
            event.stopPropagation()
            event.currentTarget.setPointerCapture(event.pointerId)
            onToggleButton(part.id, true)
          }}
          onPointerUp={event => {
            event.stopPropagation()
            onToggleButton(part.id, false)
          }}
          onPointerCancel={event => {
            event.stopPropagation()
            onToggleButton(part.id, false)
          }}
          onClick={event => event.stopPropagation()}
        />
      )}

      {!hasLibraryMetadata && <>
      {/* ---------------- RESISTOR ---------------- */}
      {part.kind === 'resistor' && (
        <g>
          {/* Top lead extending to terminal at (0, -40.5) */}
          <line x1={0} y1={-40.5} x2={0} y2={-15} stroke="#8e8e96" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={-0.3} y1={-40.5} x2={-0.3} y2={-15} stroke="#ffffff" strokeWidth={0.8} opacity={0.65} strokeLinecap="round" />

          {/* Bottom lead extending to terminal at (0, 40.5) */}
          <line x1={0} y1={15} x2={0} y2={40.5} stroke="#8e8e96" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={-0.3} y1={15} x2={-0.3} y2={40.5} stroke="#ffffff" strokeWidth={0.8} opacity={0.65} strokeLinecap="round" />

          {/* Dumbbell Ceramic Body */}
          <g filter="url(#componentShadow)">
            <path
              d="M 0 -16 C -3.5 -16 -6 -14 -6 -11 C -6 -7 -4.5 -4 -4.5 0 C -4.5 4 -6 7 -6 11 C -6 14 -3.5 16 0 16 C 3.5 16 6 14 6 11 C 6 7 4.5 4 4.5 0 C 4.5 -4 6 -7 6 -11 C 6 -14 3.5 -16 0 -16 Z"
              fill="url(#resistorCeramic)"
              stroke="#a5885e"
              strokeWidth={0.8}
            />
            {/* Color bands clipped cleanly within body */}
            <g clipPath="url(#resBodyClip)">
              <rect x={-7} y={-11.5} width={14} height={3} fill={bands[0]} />
              <rect x={-7} y={-4.5} width={14} height={3} fill={bands[1]} />
              <rect x={-7} y={2} width={14} height={3} fill={bands[2]} />
              <rect x={-7} y={8.5} width={14} height={3} fill="#cca030" />
              <line x1={-2.2} y1={-15} x2={-2.2} y2={15} stroke="#ffffff" strokeWidth={1} opacity={0.35} />
            </g>
          </g>
        </g>
      )}

      {/* ---------------- LED ---------------- */}
      {part.kind === 'led' && (
        <g>
          {/* Active Bloom glow when turned ON */}
          {isLedOn && (
            <g>
              <circle cx={0} cy={-9} r={30} fill={ledTheme.glow} opacity={0.4} filter="url(#ledBloom)" />
              <circle cx={0} cy={-9} r={18} fill={ledTheme.main} opacity={0.7} filter="url(#ledGlow)" />
            </g>
          )}

          {/* Left leg (Cathode) straight down into (-12, 15) */}
          <line x1={-12} y1={4.5} x2={-12} y2={15} stroke="#8e8e96" strokeWidth={2.4} strokeLinecap="round" />
          <line x1={-12.3} y1={4.5} x2={-12.3} y2={15} stroke="#ffffff" strokeWidth={0.7} opacity={0.65} strokeLinecap="round" />

          {/* Right leg (Anode) bends diagonally into (12, 15) */}
          <path d="M 2.5 4.5 L 12 10 L 12 15" fill="none" stroke="#8e8e96" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 2.2 4.5 L 11.7 10 L 11.7 15" fill="none" stroke="#ffffff" strokeWidth={0.7} opacity={0.65} strokeLinecap="round" strokeLinejoin="round" />

          {/* 5mm LED Bulb */}
          <g filter="url(#componentShadow)">
            {/* Dome & Flange */}
            <path
              d="M 15 2 L 15 -13 A 9 9 0 0 0 -3 -13 L -3 2 Q -3 4.5 -1 4.5 L 13 4.5 Q 15 4.5 15 2 Z"
              fill={ledTheme.main}
              stroke={ledTheme.dark}
              strokeWidth={0.9}
              opacity={0.92}
            />
            {/* Base Flange Lip */}
            <rect x={-3.5} y={2} width={20} height={2.5} rx={0.8} fill={ledTheme.main} stroke={ledTheme.dark} strokeWidth={0.7} />
            {/* Flat Notch on Cathode Side (Left) */}
            <path d="M -3.5 2 L -4.5 3.5 L -4.5 4.5 L -1 4.5" fill={ledTheme.dark} />

            {/* Internal Leadframe */}
            <line x1={-10} y1={4} x2={-8.5} y2={-5} stroke="#cbd5e1" strokeWidth={1.2} />
            <path d="M 2 4 L 2 -3 L -1 -7 L 2 -7 Z" fill="#94a3b8" />
            <circle cx={1} cy={-7} r={1.2} fill={isLedOn ? '#ffffff' : '#f59e0b'} />

            {/* Specular 3D Highlights */}
            <path d="M 7 -9 A 7 7 0 0 0 13 -17" fill="none" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" opacity={0.7} />
            <line x1={13.5} y1={-4} x2={13.5} y2={1} stroke="#ffffff" strokeWidth={1} strokeLinecap="round" opacity={0.4} />
          </g>
        </g>
      )}

      {/* ---------------- BOTÃO TÁCTIL (PUSHBUTTON) ---------------- */}
      {isButton && (
        <g>
          {/* 4 Stamped solder leads into breadboard holes (±29, ±23) */}
          <path d="M -25 -16 L -29 -23" stroke="#8e8e96" strokeWidth={3.5} strokeLinecap="round" />
          <path d="M 25 -16 L 29 -23" stroke="#8e8e96" strokeWidth={3.5} strokeLinecap="round" />
          <path d="M -25 16 L -29 23" stroke="#8e8e96" strokeWidth={3.5} strokeLinecap="round" />
          <path d="M 25 16 L 29 23" stroke="#8e8e96" strokeWidth={3.5} strokeLinecap="round" />

          {/* Housing */}
          <g filter="url(#componentShadow)">
            <rect x={-26} y={-26} width={52} height={52} rx={4} fill="#26282b" stroke="#141517" strokeWidth={1.2} />
            <rect x={-23} y={-23} width={46} height={46} rx={3} fill="#d2d4d8" stroke="#a0a2a8" strokeWidth={0.8} />
            {/* Rivets */}
            <circle cx={-18} cy={-18} r={1.8} fill="#7a7c82" />
            <circle cx={18} cy={-18} r={1.8} fill="#7a7c82" />
            <circle cx={-18} cy={18} r={1.8} fill="#7a7c82" />
            <circle cx={18} cy={18} r={1.8} fill="#7a7c82" />
            {/* Center collar */}
            <circle cx={0} cy={0} r={15} fill="#9fa2a8" stroke="#6e7177" strokeWidth={1} />
            {/* Plunger button with press state */}
            <circle
              cx={0}
              cy={0}
              r={level('OUT') === '1' ? 10.5 : 12}
              fill={level('OUT') === '1' ? '#141518' : '#1c1e22'}
              stroke="#0a0b0d"
              strokeWidth={1}
              className="toggle-target"
              onPointerDown={e => {
                e.stopPropagation()
                e.currentTarget.setPointerCapture(e.pointerId)
                onToggleButton(part.id, true)
              }}
              onPointerUp={e => {
                e.stopPropagation()
                onToggleButton(part.id, false)
              }}
              onPointerCancel={e => {
                e.stopPropagation()
                onToggleButton(part.id, false)
              }}
              onClick={e => e.stopPropagation()}
            />
            <ellipse cx={-3} cy={-3} rx={level('OUT') === '1' ? 5 : 6} ry={3} fill="#383b42" opacity={0.6} pointerEvents="none" />
          </g>
        </g>
      )}

      {/* ---------------- CIRCUITOS INTEGRADOS DIP-14 ---------------- */}
      {isChip && (
        <g>
          {/* 14 Stamped DIP leads extending into breadboard holes (±33) */}
          {[-72, -48, -24, 0, 24, 48, 72].map(x => (
            <g key={`lead-${x}`}>
              {/* Top pin */}
              <rect x={x - 4} y={-26} width={8} height={5} rx={1} fill="#b0b0b8" stroke="#606068" strokeWidth={0.6} />
              <line x1={x} y1={-21} x2={x} y2={-33} stroke="#b0b0b8" strokeWidth={4.2} strokeLinecap="square" />
              {/* Bottom pin */}
              <rect x={x - 4} y={21} width={8} height={5} rx={1} fill="#b0b0b8" stroke="#606068" strokeWidth={0.6} />
              <line x1={x} y1={21} x2={x} y2={33} stroke="#b0b0b8" strokeWidth={4.2} strokeLinecap="square" />
            </g>
          ))}

          {/* DIP-14 Body */}
          <g filter="url(#componentShadow)">
            <rect x={-81} y={-21} width={162} height={42} rx={3} fill="#2f3033" stroke="#1e1f21" strokeWidth={1.2} />
            {/* Notch on left */}
            <path d="M -81 -6 A 6 6 0 0 0 -81 6 Z" fill="#1c1d1f" />
            {/* Pin 1 dot */}
            <circle cx={-72} cy={12} r={2.2} fill="#ffffff" opacity={0.85} />
            {/* Clean white text */}
            <text
              x={0}
              y={6}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={16}
              fontWeight="bold"
              fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
              letterSpacing={1.5}
            >
              {part.kind === 'jk74hc73' ? '74HC73' : part.kind === 'nand74hc00' ? '74HC00' : '7474'}
            </text>
          </g>
        </g>
      )}

      {/* ---------------- FONTE DE ENERGIA (POWER SUPPLY) ---------------- */}
      {part.kind === 'supply' && (
        <g>
          {/* Chassis */}
          <g filter="url(#componentShadow)">
            <rect x={-110} y={-76} width={220} height={172} rx={5} fill="#e4e5e7" stroke="#c4c6ca" strokeWidth={1.2} />
            <line x1={-110} y1={58} x2={110} y2={58} stroke="#c4c6ca" strokeWidth={1} />

            {/* Displays */}
            <Display x={-96} y={-66} width={112} height={52} value={Number(part.properties?.voltage ?? 5).toFixed(2)} unit="V" label="TENSÃO" />
            <Display x={-96} y={-6} width={112} height={52} value={Number(part.properties?.current ?? 5).toFixed(2)} unit="A" label="CORRENTE" />

            {/* Knobs */}
            <Knob x={56} y={-40} label="TENSÃO" minLabel="0" maxLabel="30 V" angle={-50} />
            <Knob x={56} y={20} label="CORRENTE" minLabel="0" maxLabel="5 A" angle={120} />

            {/* Power Rocker Switch */}
            <g transform="translate(-80, 75)">
              <rect x={-14} y={-7.5} width={28} height={15} rx={7.5} fill="#42464c" stroke="#282a2e" strokeWidth={1} />
              <circle cx={-4} cy={0} r={5.5} fill="#1e2024" />
              <text x={22} y={3} fontSize={8} fill="#6e727a" fontWeight={800}>ON</text>
            </g>

            {/* Binding Posts at EXACT layout coordinates (0, 84) and (32, 84) */}
            <BindingPost x={0} y={84} color="red" connected={connected('PLUS')} />
            <BindingPost x={32} y={84} color="black" connected={connected('MINUS')} />

            <text x={-60} y={87} textAnchor="start" fontSize={6.5} fill="#888c94" fontWeight={800} letterSpacing={0.5}>
              FONTE CC
            </text>
          </g>
        </g>
      )}

      {/* ---------------- GERADOR DE FUNÇÕES ---------------- */}
      {part.kind === 'generator' && (
        <g>
          {/* Chassis */}
          <g filter="url(#componentShadow)">
            <rect x={-198} y={-84} width={396} height={196} rx={5} fill="#e4e5e7" stroke="#c4c6ca" strokeWidth={1.2} />
            <line x1={-198} y1={72} x2={198} y2={72} stroke="#c4c6ca" strokeWidth={1} />

            {/* 3 LCD Displays on Left */}
            <Display x={-186} y={-74} width={96} height={36} value={Number(part.properties?.frequency ?? 1).toFixed(2)} unit="Hz" label="FREQ" />
            <Display x={-186} y={-28} width={96} height={36} value={Number(part.properties?.amplitude ?? 5).toFixed(2)} unit="V" label="AMPL" />
            <Display x={-186} y={18} width={96} height={36} value={Number(part.properties?.offset ?? 2.5).toFixed(2)} unit="V" label="OFFSET" />

            {/* 3 Knobs */}
            <Knob x={-42} y={-56} minLabel="1 Hz" maxLabel="1 MHz" angle={-120} />
            <Knob x={-42} y={-10} minLabel="0" maxLabel="10 V" angle={0} />
            <Knob x={-42} y={36} minLabel="-10 V" maxLabel="+10 V" angle={45} />

            {/* Waveform Selector Buttons */}
            {['square', 'sine', 'triangle'].map((type, i) => {
              const active = String(part.properties?.waveform ?? 'square') === type
              return (
                <g key={type} transform={`translate(${14 + i * 44}, -74)`}>
                  <rect
                    x={0}
                    y={0}
                    width={38}
                    height={32}
                    rx={3}
                    fill="#e0e2e6"
                    stroke={active ? '#0082c3' : '#b8bac0'}
                    strokeWidth={active ? 2 : 1}
                  />
                  {type === 'square' && <path d="M 9 20 H 19 V 9 H 29 V 20" fill="none" stroke={active ? '#0082c3' : '#444'} strokeWidth={1.8} />}
                  {type === 'sine' && <path d="M 8 20 Q 13 8 19 20 T 30 20" fill="none" stroke={active ? '#0082c3' : '#555'} strokeWidth={1.8} />}
                  {type === 'triangle' && <path d="M 8 20 L 19 9 L 30 20" fill="none" stroke={active ? '#0082c3' : '#555'} strokeWidth={1.8} />}
                </g>
              )
            })}

            {/* Waveform Diagrams */}
            <path d="M 30 -18 Q 45 -33 60 -18 T 90 -18" fill="none" stroke="#71767e" strokeWidth={1.5} />
            <line x1={25} y1="-28" x2={95} y2="-28" stroke="#9ca0a8" strokeWidth={0.8} />
            <line x1={25} y1="-8" x2={95} y2="-8" stroke="#9ca0a8" strokeWidth={0.8} />
            <line x1={95} y1="-28" x2={95} y2="-8" stroke="#71767e" strokeWidth={1} />

            <path d="M 30 24 Q 45 9 60 24 T 90 24" fill="none" stroke="#71767e" strokeWidth={1.5} />
            <line x1={25} y1="24" x2={95} y2="24" stroke="#9ca0a8" strokeWidth={0.8} strokeDasharray="2 2" />
            <line x1={95} y1="14" x2={95} y2="34" stroke="#71767e" strokeWidth={1} />

            {/* Power Switch on bottom left */}
            <g transform="translate(-168, 96)">
              <rect x={-14} y={-7.5} width={28} height={15} rx={7.5} fill="#42464c" stroke="#282a2e" strokeWidth={1} />
              <circle cx={-4} cy={0} r={5.5} fill="#1e2024" />
              <text x={22} y={3} fontSize={8} fill="#6e727a" fontWeight={800}>ON</text>
            </g>

            {/* Binding Posts at EXACT coordinates (-20, 99) and (5, 99) */}
            <BindingPost x={-20} y={99} color="red" connected={connected('OUT')} />
            <BindingPost x={5} y={99} color="black" connected={connected('GND')} />

            <text x={180} y={100} textAnchor="end" fontSize={7.5} fill="#888c94" fontWeight={800} letterSpacing={0.5}>
              GERADOR DE FUNÇÃO
            </text>
          </g>
        </g>
      )}

      {/* ---------------- SOURCES (VCC, GND, CLOCK) ---------------- */}
      {isSource && (
        <g>
          <rect
            x={-44}
            y={-21}
            width={82}
            height={42}
            rx={8}
            fill={part.kind === 'vcc' ? '#fef2f2' : part.kind === 'gnd' ? '#f1f5f9' : '#f0f9ff'}
            stroke={part.kind === 'vcc' ? '#f87171' : part.kind === 'gnd' ? '#94a3b8' : '#38bdf8'}
            strokeWidth={1.5}
            filter="url(#componentShadow)"
          />
          <text
            x={-3}
            y={6}
            textAnchor="middle"
            fontSize={18}
            fontWeight={900}
            fill={part.kind === 'vcc' ? '#dc2626' : part.kind === 'gnd' ? '#334155' : '#0284c7'}
          >
            {part.kind === 'vcc' ? `+${Number(part.properties?.voltage ?? 5)}V` : part.kind === 'gnd' ? '⏚' : '∿'}
          </text>
        </g>
      )}

      {/* ---------------- LOGIC GATES ---------------- */}
      {isGate && (
        <g>
          <rect x={-36} y={-29} width={72} height={58} rx={8} fill="#f5f3ff" stroke="#a78bfa" strokeWidth={1.5} filter="url(#componentShadow)" />
          <text x={0} y={6} textAnchor="middle" fill="#6d28d9" fontSize={15} fontWeight={800}>
            {part.kind.toUpperCase()}
          </text>
        </g>
      )}
      </>}

      {/* ---------------- INTERACTIVE TERMINALS / PINS ---------------- */}
      {part.kind === 'supply' && (part.properties?.simulationModel === 'powerSupply' || (!part.properties?.simulationModel && !libraryRecord?.simulation_model)) && libraryImage && libraryImageFrame && libraryRecord?.extents && (
        <g pointerEvents="none" className="supply-readings"
          transform={`translate(${libraryImageFrame.x} ${libraryImageFrame.y}) scale(${libraryImageFrame.width / libraryRecord.extents.width} ${libraryImageFrame.height / libraryRecord.extents.height}) translate(${-libraryRecord.extents.left} ${-libraryRecord.extents.top})`}>
          <rect x={-47.54} y={-72.232} width={59.229} height={24.679} fill="#DAE5E9" />
          <text x={-43.5} y={-55} fill="#4E5251" fontFamily="Arial" fontSize={13.5} fontWeight="bold">{Number(part.properties?.voltage ?? 5).toFixed(1)} V</text>
          <rect x={-47.54} y={-38.916} width={59.229} height={24.679} fill="#DAE5E9" />
          <text x={-43.5} y={-22} fill="#4E5251" fontFamily="Arial" fontSize={13.5} fontWeight="bold">{Number(part.properties?.current ?? 5).toFixed(1)} A</text>
          <title>Tensão configurada e limite de corrente da fonte</title>
        </g>
      )}
      {isLedPart && libraryImage && libraryImageFrame && (
        <g pointerEvents="none" transform={`scale(${libraryImageFrame.scaleX} ${libraryImageFrame.scaleY})`}>
          {isLedOn && <ellipse cx={-1.25} cy={-18} rx={12} ry={15} fill={ledTheme.glow} opacity={0.6} filter="url(#ledBloom)" />}
          {/* Match the bulb in the downloaded SVG; its static dark mask hid the live state. */}
          <path d="M5.55-13.41v-8.26a6.8 6.8 0 0 0-13.6 0v13.66c1.38 1.14 3.9 1.91 6.8 1.91 4.37 0 7.91-1.74 7.91-3.88v-1.4c0-.74-.41-1.43-1.11-2.03Z"
            fill={isLedOn ? ledTheme.glow : ledTheme.dark} />
          <path d="M-1.25-8.41c3.76 0 6.8-1.33 6.8-2.96v-10.29a6.8 6.8 0 0 0-13.6 0v10.29c0 1.63 3.04 2.96 6.8 2.96Z"
            fill={isLedOn ? ledTheme.main : ledTheme.dark} />
          {isLedOn && <ellipse cx={-1.25} cy={-19} rx={4.2} ry={6.2} fill={ledTheme.die} opacity={0.9} filter="url(#ledGlow)" />}
          <path d="M-5.9-19v-2.6a4.4 4.4 0 0 1 4.4-4.4" fill="none" stroke="#fff" strokeWidth={1.2} strokeLinecap="round" opacity={isLedOn ? 0.85 : 0.25} />
        </g>
      )}
      {visiblePins
        .filter(pin => !(isButton && pin === 'OUT'))
        .map(pin => {
          const libraryPin = part.kind === 'library' ? pin : libraryPinNameForKind(part.kind, pin)
          const pt = part.kind === 'library'
            ? libraryPinOffset(libraryRecord, pin) ?? { x: 0, y: 0 }
            : (libraryPin && libraryRecord ? libraryPinOffset(libraryRecord, libraryPin, part.kind) : undefined) ?? pinOffset(part.kind, pin)
          const chip = isChip
          const physicalPin = chipPinInfo(part.kind, pin)
          return (
            <g
              key={pin}
              className="terminal"
              data-terminal={pinId(part, pin)}
              onClick={e => {
                e.stopPropagation()
              }}
            >
              {/* Terminal pin tip */}
              {(isPassive || isButton) && <circle cx={pt.x} cy={pt.y} r={3.6} fill={connected(pin) ? '#15803d' : '#64748b'} stroke="#ffffff" strokeWidth={1} />}
              {!chip && !isPassive && !isInstrument && !isButton && !isLibraryBreadboard && (
                <circle cx={pt.x} cy={pt.y} r={6.5} fill={signalColor(level(pin))} stroke="#ffffff" strokeWidth={2} />
              )}
              {/* Hit target for easy clicking */}
              <circle cx={pt.x} cy={pt.y} r={isInstrument ? 18 : 15} fill="transparent" pointerEvents="all" cursor="crosshair" />
              <title>{physicalPin ? physicalPin.name : friendlyPinLabel(part.kind, pin, part.label)}</title>
            </g>
          )
        })}

      {/* Label under parts */}
      {!isChip && !isPassive && !isInstrument && !isButton && (
        <text x={0} y={part.kind === 'library' ? libraryImageRect.y + libraryImageRect.height + 19 : 38} textAnchor="middle" className="part-label">
          {part.label}
        </text>
      )}
      {(isPassive || isButton) && selected && (
        <text x={0} y={65} textAnchor="middle" className="part-label">
          {part.label}
        </text>
      )}
    </g>
  )
}

function Breadboard({
  project,
  part,
  simulation,
  libraryRecord,
  libraryRecords,
  pending,
  selected,
  onPointerDown,
}: {
  project: Project
  part: Part
  simulation?: Simulation
  libraryRecord?: LibraryRecord
  libraryRecords: LibraryRecords
  pending?: string
  selected: boolean
  onPointerDown: (e: PointerEvent<SVGGElement>) => void
}) {
  const [hovered, setHovered] = useState<string>()
  const dx = part.x - board.x,
    dy = part.y - board.y
  const levels = new Map<string, Level>()
  for (const [endpoint, value] of Object.entries(simulation?.levels ?? {})) {
    if (endpoint.startsWith('board:')) levels.set(boardGroup(endpoint), value)
  }
  const connectedHoles = new Set(project.wires.filter(w => !w.hidden).flatMap(w => [w.from, w.to]))
  const sourceSvg = libraryRecord?.svgs?.find(svg => svg.type === 'breadboard') ?? libraryRecord?.svgs?.[0]
  const sourcePath = String(part.properties?.libraryPath ?? '')
  const sourceImage = sourceSvg && sourcePath ? libraryAssetUrl(`${sourcePath}/${sourceSvg.file}`) : undefined

  const hole = (id: string) => {
    const absolute = boardPoint(project, id, libraryRecords)!
    const pt = { x: absolute.x - dx, y: absolute.y - dy }
    const wired = connectedHoles.has(id)
    const activeBus = hovered && boardGroup(hovered) === boardGroup(id)

    return (
      <g
        key={id}
        className="board-hole"
        data-terminal={id}
        onPointerEnter={() => setHovered(id)}
        onPointerLeave={() => setHovered(undefined)}
        onClick={e => {
          e.stopPropagation()
        }}
      >
        {/* Active Rail Connection Glow */}
        {activeBus && (
          <circle cx={pt.x} cy={pt.y} r={8.5} fill="#22c55e" opacity={0.25} stroke="#22c55e" strokeWidth={1.5} pointerEvents="none" />
        )}

        {sourceImage ? (
          <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" pointerEvents="all" cursor="crosshair" />
        ) : (
          <>
        {/* Outer hole socket */}
        <rect
          x={pt.x - 4}
          y={pt.y - 4}
          width={8}
          height={8}
          rx={1.2}
          fill="#e2e4e8"
          stroke={hovered === id ? '#0082c3' : pending === id ? '#22c55e' : '#cbd0d6'}
          strokeWidth={hovered === id || pending === id ? 1.5 : 0.8}
        />

        {/* Inner socket depth */}
        <rect
          x={pt.x - 2.8}
          y={pt.y - 2.8}
          width={5.6}
          height={5.6}
          rx={1}
          fill={pending === id ? '#22c55e' : wired ? signalColor(levels.get(boardGroup(id))) : '#1e2024'}
          pointerEvents="none"
        />

        {/* Internal dual spring contacts */}
        <line x1={pt.x - 1.8} y1={pt.y - 1.2} x2={pt.x - 1.8} y2={pt.y + 1.2} stroke="#71767e" strokeWidth={0.7} pointerEvents="none" />
        <line x1={pt.x + 1.8} y1={pt.y - 1.2} x2={pt.x + 1.8} y2={pt.y + 1.2} stroke="#71767e" strokeWidth={0.7} pointerEvents="none" />
        {/* Generous hit target */}
        <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" pointerEvents="all" cursor="crosshair" />
          </>
        )}
      </g>
    )
  }

  return (
    <g className={`part ${selected ? 'part-selected' : ''}`} data-part={part.id} transform={`translate(${dx} ${dy})`} onPointerDown={onPointerDown}>
      {sourceImage ? (
        <>
          <rect x={board.x} y={board.y} width={board.width} height={board.height} fill="transparent" pointerEvents="all" />
          <image href={sourceImage} x={board.x} y={board.y} width={board.width} height={board.height} preserveAspectRatio="none" pointerEvents="none" />
        </>
      ) : libraryIdFromPart(part) ? (
        <g pointerEvents="none">
          <rect x={board.x} y={board.y} width={board.width} height={board.height} rx={12} fill="#f8fafc" stroke="#d7e0e5" />
          <text x={board.x + board.width / 2} y={board.y + board.height / 2} textAnchor="middle" fill="#64748b" fontSize={14}>Carregando SVG local…</text>
        </g>
      ) : (
        <>
          <rect
            x={board.x}
            y={board.y}
            width={board.width}
            height={board.height}
            rx={12}
            fill="#f7f7f8"
            stroke="#cbd0d6"
            strokeWidth={1.5}
            filter="url(#boardShadow)"
          />
          <rect
            x={board.x + 3}
            y={board.y + 3}
            width={board.width - 6}
            height={board.height - 6}
            rx={10}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.5}
            opacity={0.8}
          />
        </>
      )}

      {/* Central Divider Trench */}
      {!sourceImage && !libraryIdFromPart(part) && <rect x={198} y={325} width={724} height={20} rx={2} fill="#dcdde0" stroke="#c0c2c6" strokeWidth={0.8} />}

      {/* Power Rail Lines */}
      {Object.entries(railY).map(([name, y]) => {
        const isPlus = name.endsWith('plus')
        const lineY = y + (name === 'top-plus' || name === 'bottom-minus' ? -11 : 11)
        return (
          <g key={name}>
            {!sourceImage && !libraryIdFromPart(part) && <>
              <line
                x1={205}
                y1={lineY}
                x2={921}
                y2={lineY}
                stroke={isPlus ? '#ef4444' : '#212121'}
                strokeWidth={2}
                opacity={0.85}
              />
              <text x={198} y={y + 3.5} fontSize={12} fontWeight={900} fill={isPlus ? '#ef4444' : '#212121'} textAnchor="middle">
                {isPlus ? '+' : '−'}
              </text>
              <text x={926} y={y + 3.5} fontSize={12} fontWeight={900} fill={isPlus ? '#ef4444' : '#212121'} textAnchor="middle">
                {isPlus ? '+' : '−'}
              </text>
            </>}
            {Array.from({ length: board.columns }, (_, n) => hole(`board:${part.id}:${name}:${n}`))}
          </g>
        )
      })}

      {/* Column Coordinates & Terminal Holes */}
      {Array.from({ length: board.columns }, (_, n) => (
        <g key={n}>
          {!sourceImage && <>
            <text x={columnX(n)} y={237} className="board-number" textAnchor="middle" fontSize={8.5} fill="#71767b" fontWeight={700}>
              {n + 1}
            </text>
            <text x={columnX(n)} y={445} className="board-number" textAnchor="middle" fontSize={8.5} fill="#71767b" fontWeight={700}>
              {n + 1}
            </text>
          </>}
          {(['left', 'right'] as const).map(side => rowY[side].map((_, h) => hole(`board:${part.id}:row:${n}:${side}:${h}`)))}
        </g>
      ))}

      {/* Row Letters on Left and Right */}
      {!sourceImage && rowY.left.map((y, i) => (
        <g key={`l${i}`}>
          <text x={198} y={y + 3.5} fill="#71767b" fontSize={9.5} fontWeight={700} textAnchor="middle">
            {['j', 'i', 'h', 'g', 'f'][i]}
          </text>
          <text x={926} y={y + 3.5} fill="#71767b" fontSize={9.5} fontWeight={700} textAnchor="middle">
            {['j', 'i', 'h', 'g', 'f'][i]}
          </text>
        </g>
      ))}
      {!sourceImage && rowY.right.map((y, i) => (
        <g key={`r${i}`}>
          <text x={198} y={y + 3.5} fill="#71767b" fontSize={9.5} fontWeight={700} textAnchor="middle">
            {['e', 'd', 'c', 'b', 'a'][i]}
          </text>
          <text x={926} y={y + 3.5} fill="#71767b" fontSize={9.5} fontWeight={700} textAnchor="middle">
            {['e', 'd', 'c', 'b', 'a'][i]}
          </text>
        </g>
      ))}
    </g>
  )
}

function wirePath(project: Project, wire: Wire, a: Point, b: Point): string {
  const points = wirePolylinePoints(project, wire, a, b)
  if (points.length === 2 && (Math.abs(a.x - b.x) < 7 || Math.abs(a.y - b.y) < 7)) {
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`
  }
  return roundedWirePath(points)
}

export default function Canvas({
  project,
  simulation,
  libraryRecords,
  selected,
  pending,
  wireBends,
  wireColor,
  view,
  setView,
  onSelect,
  onTerminal,
  onWireBend,
  onMovePart,
  onDropPart,
  onToggleButton,
  onCancelWire,
  onUpdateWire,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const draftPathRef = useRef<SVGPathElement>(null)
  const draftBackingRef = useRef<SVGPathElement>(null)
  const draftTipRef = useRef<SVGGElement>(null)
  const cursorRef = useRef<Point | undefined>(undefined)
  const [hoveredTerminal, setHoveredTerminal] = useState<string>()
  const [draggedPart, setDraggedPart] = useState<string>()
  const [activeSnapGuides, setActiveSnapGuides] = useState<SnapGuide[]>([])
  const [dragEndpointPreview, setDragEndpointPreview] = useState<{ wireId: string; endpoint: 'from' | 'to'; pos: Point } | undefined>()
  const wireGesture = useRef<{ origin: string; x: number; y: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const targets = useMemo(() => connectionTargets(project, libraryRecords), [project, libraryRecords])
  const connectedTerminals = useMemo(() => new Set(project.wires.flatMap(wire => [wire.from, wire.to])), [project.wires])
  const directCandidate = useMemo(() => draggedPart ? findDirectContact(project, draggedPart, libraryRecords) : undefined, [project, draggedPart, libraryRecords])

  useLayoutEffect(() => {
    cursorRef.current = undefined
    setHoveredTerminal(undefined)
    if (!pending) wireGesture.current = null
  }, [pending])

  useLayoutEffect(() => {
    const start = pending ? terminalPosition(project, pending, libraryRecords) : undefined
    if (start) {
      const end = cursorRef.current ?? wireBends.at(-1) ?? start
      const path = roundedWirePath([start, ...wireBends, end])
      draftPathRef.current?.setAttribute('d', path)
      draftBackingRef.current?.setAttribute('d', path)
      draftTipRef.current?.setAttribute('transform', `translate(${end.x} ${end.y})`)
    }
  }, [pending, project, wireBends, libraryRecords])

  const drag = useRef<Drag | null>(null)
  const pan = useRef<Pan | null>(null)

  const toWorld = (e: { clientX: number; clientY: number }): Point => {
    const svg = svgRef.current!
    const p = svg.createSVGPoint()
    p.x = e.clientX
    p.y = e.clientY
    return p.matrixTransform(svg.getScreenCTM()!.inverse())
  }

  const targetAt = (e: PointerEvent<SVGSVGElement>) => {
    const element = e.target as Element
    if (element.closest('.wire-bend-handle, .wire-midpoint-handle, .wire-endpoint-handle, .toggle-target')) return undefined
    if (!pending && element.closest('.wire, .wire-terminals, .wire-interaction-overlay')) return undefined
    const matrix = svgRef.current!.getScreenCTM()!
    const scale = Math.hypot(matrix.a, matrix.b)
    // Ignore holes underneath the body being dragged. Wires must not hide pins.
    const partId = !pending ? element.closest('[data-part]')?.getAttribute('data-part') : undefined
    const candidates = partId ? targets.filter(target => target.partId === partId) : targets
    return nearestConnectionTarget(candidates, toWorld(e), (pending ? 14 : 10) / scale)
  }

  const findConnectionTarget = (at: Point) => {
    const matrix = svgRef.current?.getScreenCTM()
    const scale = matrix ? Math.hypot(matrix.a, matrix.b) : 1
    return nearestConnectionTarget(targets, at, 16 / scale)
  }

  const pointerDownCapture = (e: PointerEvent<SVGSVGElement>) => {
    suppressClick.current = false
    if (e.button !== 0) {
      e.stopPropagation()
      return
    }
    const target = targetAt(e)
    if (!target) return
    e.preventDefault()
    e.stopPropagation()
    suppressClick.current = true
    if (!pending) {
      wireGesture.current = { origin: target.id, x: e.clientX, y: e.clientY, moved: false }
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    onTerminal(target.id)
  }

  const pointerDownPart = (e: PointerEvent<SVGElement>, part: Part) => {
    e.stopPropagation()
    e.preventDefault()
    if (pending) {
      onWireBend(toWorld(e))
      return
    }
    onSelect(part.id)
    setHoveredTerminal(undefined)
    setDraggedPart(part.id)
    drag.current = { type: 'part', part: part.id, start: toWorld(e), original: project, initial: { x: part.x, y: part.y }, moved: false }
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  const pointerDownBend = (e: PointerEvent<SVGElement>, wireId: string, bendIndex: number) => {
    e.stopPropagation()
    e.preventDefault()
    const wire = project.wires.find(w => w.id === wireId)
    if (!wire || !wire.bends || !wire.bends[bendIndex]) return
    onSelect(wireId)
    const currentBends = wire.bends.map(p => ({ ...p }))
    drag.current = {
      type: 'bend',
      wireId,
      bendIndex,
      start: toWorld(e),
      original: project,
      initial: { ...wire.bends[bendIndex] },
      currentBends,
      moved: false,
    }
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  const pointerDownMidpoint = (e: PointerEvent<SVGElement>, wireId: string, segmentIndex: number, midpoint: Point) => {
    e.stopPropagation()
    e.preventDefault()
    if (pending) return
    const wire = project.wires.find(w => w.id === wireId)
    if (!wire) return
    onSelect(wireId)
    const baseBends = wire.bends ? wire.bends.map(p => ({ ...p })) : []
    const insertIdx = Math.min(segmentIndex, baseBends.length)
    baseBends.splice(insertIdx, 0, { ...midpoint })
    drag.current = {
      type: 'bend',
      wireId,
      bendIndex: insertIdx,
      start: toWorld(e),
      original: project,
      initial: { ...midpoint },
      currentBends: baseBends,
      moved: true,
    }
    onUpdateWire?.(wireId, { bends: baseBends }, false)
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  const pointerDownEndpoint = (e: PointerEvent<SVGElement>, wireId: string, endpoint: 'from' | 'to') => {
    e.stopPropagation()
    e.preventDefault()
    if (pending) return
    const wire = project.wires.find(w => w.id === wireId)
    if (!wire) return
    onSelect(wireId)
    const termId = endpoint === 'from' ? wire.from : wire.to
    const pos = terminalPosition(project, termId, libraryRecords)
    if (!pos) return
    drag.current = {
      type: 'endpoint',
      wireId,
      endpoint,
      start: toWorld(e),
      original: project,
      currentPos: pos,
      targetTerminal: termId,
      moved: false,
    }
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  const insertBendAtPoint = (wireId: string, at: Point) => {
    const wire = project.wires.find(w => w.id === wireId)
    if (!wire) return
    const a = terminalPosition(project, wire.from, libraryRecords)
    const b = terminalPosition(project, wire.to, libraryRecords)
    if (!a || !b) return
    const poly = wirePolylinePoints(project, wire, a, b)
    let bestDist = Infinity
    let bestSegIdx = 0
    let bestProj: Point = at

    for (let i = 0; i < poly.length - 1; i++) {
      const p1 = poly[i]
      const p2 = poly[i + 1]
      const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2
      let t = l2 === 0 ? 0 : ((at.x - p1.x) * (p2.x - p1.x) + (at.y - p1.y) * (p2.y - p1.y)) / l2
      t = Math.max(0, Math.min(1, t))
      const projX = p1.x + t * (p2.x - p1.x)
      const projY = p1.y + t * (p2.y - p1.y)
      const dist = Math.hypot(at.x - projX, at.y - projY)
      if (dist < bestDist) {
        bestDist = dist
        bestSegIdx = i
        bestProj = { x: Math.round(projX), y: Math.round(projY) }
      }
    }

    const currentBends = wire.bends ? [...wire.bends.map(p => ({ ...p }))] : []
    const insertIdx = Math.min(bestSegIdx, currentBends.length)
    currentBends.splice(insertIdx, 0, bestProj)
    onUpdateWire?.(wireId, { bends: currentBends }, true)
    onSelect(wireId)
  }

  const pointerDownWire = (e: PointerEvent<SVGElement>, wire: Wire) => {
    e.stopPropagation()
    if (pending) {
      onWireBend(toWorld(e))
      return
    }
    if (e.button !== 0) return
    onSelect(wire.id)
    const at = toWorld(e)
    const a = terminalPosition(project, wire.from, libraryRecords)
    const b = terminalPosition(project, wire.to, libraryRecords)
    if (!a || !b) return

    const poly = wirePolylinePoints(project, wire, a, b)
    let bestDist = Infinity
    let bestSegIdx = 0
    let bestProj: Point = at

    for (let i = 0; i < poly.length - 1; i++) {
      const p1 = poly[i]
      const p2 = poly[i + 1]
      const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2
      let t = l2 === 0 ? 0 : ((at.x - p1.x) * (p2.x - p1.x) + (at.y - p1.y) * (p2.y - p1.y)) / l2
      t = Math.max(0, Math.min(1, t))
      const projX = p1.x + t * (p2.x - p1.x)
      const projY = p1.y + t * (p2.y - p1.y)
      const dist = Math.hypot(at.x - projX, at.y - projY)
      if (dist < bestDist) {
        bestDist = dist
        bestSegIdx = i
        bestProj = { x: Math.round(projX), y: Math.round(projY) }
      }
    }

    const currentBends = wire.bends ? wire.bends.map(p => ({ ...p })) : []
    drag.current = {
      type: 'wire-segment',
      wireId: wire.id,
      segmentIndex: bestSegIdx,
      start: at,
      original: project,
      initialPoint: bestProj,
      currentBends,
      moved: false,
    }
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  const removeBend = (wireId: string, bendIdx: number) => {
    const wire = project.wires.find(w => w.id === wireId)
    if (!wire || !wire.bends) return
    const newBends = wire.bends.filter((_, i) => i !== bendIdx)
    onUpdateWire?.(wireId, { bends: newBends.length ? newBends : undefined }, true)
  }

  const pointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (drag.current) {
      let activeDrag = drag.current
      const at = toWorld(e)
      const dx = at.x - activeDrag.start.x,
        dy = at.y - activeDrag.start.y
      if (!activeDrag.moved && Math.hypot(dx, dy) > 8) {
        activeDrag.moved = true
        if (activeDrag.type === 'wire-segment') {
          const insertIdx = Math.min(activeDrag.segmentIndex, activeDrag.currentBends.length)
          const newBends = [...activeDrag.currentBends]
          newBends.splice(insertIdx, 0, { x: activeDrag.initialPoint.x, y: activeDrag.initialPoint.y })
          onUpdateWire?.(activeDrag.wireId, { bends: newBends }, false)
          activeDrag = {
            type: 'bend',
            wireId: activeDrag.wireId,
            bendIndex: insertIdx,
            start: activeDrag.start,
            original: activeDrag.original,
            initial: activeDrag.initialPoint,
            currentBends: newBends,
            moved: true,
          }
          drag.current = activeDrag
        }
      }
      if (activeDrag.moved) {
        if (activeDrag.type === 'part') {
          onMovePart(activeDrag.part, Math.round(activeDrag.initial.x + dx), Math.round(activeDrag.initial.y + dy))
        } else if (activeDrag.type === 'bend') {
          const wire = project.wires.find(w => w.id === activeDrag.wireId)
          if (wire && activeDrag.currentBends) {
            const a = terminalPosition(project, wire.from, libraryRecords)
            const b = terminalPosition(project, wire.to, libraryRecords)
            if (a && b) {
              const rawPoint = at
              const prev = activeDrag.bendIndex === 0 ? a : (activeDrag.currentBends[activeDrag.bendIndex - 1] ?? a)
              const next =
                activeDrag.bendIndex === activeDrag.currentBends.length - 1
                  ? b
                  : (activeDrag.currentBends[activeDrag.bendIndex + 1] ?? b)
              const { snapped, guides } = snapBendPoint(rawPoint, prev, next, a, b, 8)
              setActiveSnapGuides(guides)

              activeDrag.currentBends[activeDrag.bendIndex] = snapped
              onUpdateWire?.(activeDrag.wireId, { bends: [...activeDrag.currentBends] }, false)
            }
          }
        } else if (activeDrag.type === 'endpoint') {
          const target = findConnectionTarget(at)
          const targetId = target?.id
          const wire = project.wires.find(w => w.id === activeDrag.wireId)
          const otherTerminal = wire ? (activeDrag.endpoint === 'from' ? wire.to : wire.from) : undefined
          const isValidTarget = targetId && targetId !== otherTerminal

          activeDrag.currentPos = isValidTarget && target ? { x: target.x, y: target.y } : at
          activeDrag.targetTerminal = isValidTarget ? targetId : undefined
          setHoveredTerminal(isValidTarget ? targetId : undefined)

          setDragEndpointPreview({
            wireId: activeDrag.wireId,
            endpoint: activeDrag.endpoint,
            pos: activeDrag.currentPos,
          })
        }
      }
    } else if (pan.current) {
      const svg = svgRef.current!
      const factor = pan.current.view.width / svg.getBoundingClientRect().width
      setView({
        ...pan.current.view,
        x: pan.current.view.x - (e.clientX - pan.current.x) * factor,
        y: pan.current.view.y - (e.clientY - pan.current.y) * factor,
      })
    } else {
      if (wireGesture.current) {
        const gesture = wireGesture.current
        if (Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > 5) gesture.moved = true
      }
      const target = targetAt(e)
      setHoveredTerminal(target?.id)
      const at = target ?? toWorld(e)
      cursorRef.current = at
      const start = pending ? terminalPosition(project, pending, libraryRecords) : undefined
      if (start) {
        const path = roundedWirePath([start, ...wireBends, at])
        draftPathRef.current?.setAttribute('d', path)
        draftBackingRef.current?.setAttribute('d', path)
        draftTipRef.current?.setAttribute('transform', `translate(${at.x} ${at.y})`)
      }
    }
  }

  const releasePointer = (e: PointerEvent<SVGSVGElement>) => {
    drag.current = null
    pan.current = null
    wireGesture.current = null
    setDraggedPart(undefined)
    setDragEndpointPreview(undefined)
    if (svgRef.current?.hasPointerCapture(e.pointerId)) svgRef.current.releasePointerCapture(e.pointerId)
  }

  const pointerUp = (e: PointerEvent<SVGSVGElement>) => {
    setActiveSnapGuides([])
    const completedDrag = drag.current
    if (completedDrag?.moved) {
      if (completedDrag.type === 'part') {
        const at = toWorld(e)
        const x = Math.round(completedDrag.initial.x + at.x - completedDrag.start.x)
        const y = Math.round(completedDrag.initial.y + at.y - completedDrag.start.y)
        const releasedProject: Project = {
          ...project,
          parts: project.parts.map(part => part.id === completedDrag.part ? { ...part, x, y } : part),
        }
        const candidate = findDirectContact(releasedProject, completedDrag.part, libraryRecords)
        const movedPart = releasedProject.parts.find(part => part.id === completedDrag.part)
        if (movedPart && candidate) {
          onMovePart(
            completedDrag.part,
            movedPart.x + candidate.to.x - candidate.from.x,
            movedPart.y + candidate.to.y - candidate.from.y,
          )
        } else {
          onMovePart(completedDrag.part, x, y)
        }
        onDropPart(completedDrag.original)
      } else if (completedDrag.type === 'bend') {
        onUpdateWire?.(
          completedDrag.wireId,
          { bends: completedDrag.currentBends.length ? completedDrag.currentBends : undefined },
          true,
        )
      } else if (completedDrag.type === 'endpoint') {
        setDragEndpointPreview(undefined)
        if (completedDrag.targetTerminal) {
          const wire = project.wires.find(w => w.id === completedDrag.wireId)
          if (wire) {
            const currentTerminal = completedDrag.endpoint === 'from' ? wire.from : wire.to
            if (completedDrag.targetTerminal !== currentTerminal) {
              onUpdateWire?.(completedDrag.wireId, { [completedDrag.endpoint]: completedDrag.targetTerminal }, true)
            }
          }
        }
      }
    }
    const gesture = wireGesture.current
    if (gesture?.moved && pending === gesture.origin) {
      const target = targetAt(e)
      if (target && target.id !== gesture.origin) onTerminal(target.id)
    }
    releasePointer(e)
  }

  const pointerCancel = (e: PointerEvent<SVGSVGElement>) => {
    setActiveSnapGuides([])
    if (wireGesture.current) onCancelWire()
    const d = drag.current
    if (d?.moved) {
      if (d.type === 'part') {
        onDropPart(d.original)
      } else if (d.type === 'bend') {
        const origWire = d.original.wires.find(w => w.id === d.wireId)
        if (origWire) {
          onUpdateWire?.(origWire.id, { bends: origWire.bends }, true)
        }
      } else if (d.type === 'endpoint') {
        setDragEndpointPreview(undefined)
      }
    }
    releasePointer(e)
    setHoveredTerminal(undefined)
  }

  const wheel = (e: WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12
    const p = toWorld(e as unknown as PointerEvent<SVGSVGElement>)
    setView(v => {
      const width = Math.max(450, Math.min(2600, v.width * factor))
      const ratio = width / v.width
      return { x: p.x - (p.x - v.x) * ratio, y: p.y - (p.y - v.y) * ratio, width, height: v.height * ratio }
    })
  }

  const draftStart = pending ? terminalPosition(project, pending, libraryRecords) : undefined
  const draftEnd = cursorRef.current ?? draftStart
  const draftPath = draftStart && draftEnd ? roundedWirePath([draftStart, ...wireBends, draftEnd]) : ''
  const highlightedTarget = targets.find(target => target.id === hoveredTerminal)
  const screenScale = svgRef.current?.getScreenCTM()?.a ?? 1

  const selectedWireObj = project.wires.find(w => w.id === selected && !w.hidden)
  const segmentMidpoints = useMemo(() => {
    if (!selectedWireObj) return []
    let a = terminalPosition(project, selectedWireObj.from, libraryRecords)
    let b = terminalPosition(project, selectedWireObj.to, libraryRecords)
    if (dragEndpointPreview && dragEndpointPreview.wireId === selectedWireObj.id) {
      if (dragEndpointPreview.endpoint === 'from') a = dragEndpointPreview.pos
      if (dragEndpointPreview.endpoint === 'to') b = dragEndpointPreview.pos
    }
    if (!a || !b) return []
    const poly = wirePolylinePoints(project, selectedWireObj, a, b)
    const midpoints: Array<{ x: number; y: number; segIdx: number }> = []
    for (let i = 0; i < poly.length - 1; i++) {
      const p1 = poly[i]
      const p2 = poly[i + 1]
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      if (dist >= 16) {
        midpoints.push({
          x: Math.round((p1.x + p2.x) / 2),
          y: Math.round((p1.y + p2.y) / 2),
          segIdx: i,
        })
      }
    }
    return midpoints
  }, [project, selectedWireObj, libraryRecords, dragEndpointPreview])

  return (
    <svg
      ref={svgRef}
      className={`canvas ${pending ? 'canvas-wiring' : ''}`}
      viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
      onPointerDownCapture={pointerDownCapture}
      onClickCapture={e => {
        if (suppressClick.current) {
          e.stopPropagation()
          suppressClick.current = false
        }
      }}
      onWheel={wheel}
      onContextMenu={e => {
        if (pending) {
          e.preventDefault()
          onCancelWire()
        }
      }}
      onPointerDown={e => {
        if (e.target !== e.currentTarget && (e.target as Element).closest('.board-hole, .part, .wire, .terminal, .wire-bend-handle, .wire-midpoint-handle, .wire-endpoint-handle, .wire-interaction-overlay')) return
        e.preventDefault()
        if (pending) {
          onWireBend(toWorld(e))
          return
        }
        onSelect(undefined)
        pan.current = { x: e.clientX, y: e.clientY, view }
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerCancel}
      onPointerLeave={() => setHoveredTerminal(undefined)}
    >
      <defs>
        {/* CircuitLab Studio Canvas Grid */}
        <pattern id="dotGrid" width={24} height={24} patternUnits="userSpaceOnUse">
          <circle cx={1} cy={1} r={1.1} fill="#c5cbd0" />
        </pattern>

        {/* Realistic drop shadows */}
        <filter id="boardShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.14" />
        </filter>
        <filter id="componentShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.16" />
        </filter>
        <filter id="wireShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.14" />
        </filter>

        {/* LED Glow Filters */}
        <filter id="ledBloom" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation={14} />
        </filter>
        <filter id="ledGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={6} />
        </filter>
        <filter id="displayGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={1.5} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradients & Clips */}
        <clipPath id="resBodyClip">
          <path d="M 0 -16 C -3.5 -16 -6 -14 -6 -11 C -6 -7 -4.5 -4 -4.5 0 C -4.5 4 -6 7 -6 11 C -6 14 -3.5 16 0 16 C 3.5 16 6 14 6 11 C 6 7 4.5 4 4.5 0 C 4.5 -4 6 -7 6 -11 C 6 -14 3.5 -16 0 -16 Z" />
        </clipPath>

        <linearGradient id="metalLead" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="35%" stopColor="#f1f5f9" />
          <stop offset="65%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        <linearGradient id="resistorCeramic" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#cfa672" />
          <stop offset="30%" stopColor="#deb887" />
          <stop offset="70%" stopColor="#f3dbc0" />
          <stop offset="100%" stopColor="#bfa075" />
        </linearGradient>

        <linearGradient id="goldBand" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="40%" stopColor="#fde047" />
          <stop offset="70%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <linearGradient id="chipLead" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="40%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        <linearGradient id="metalPlate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        <linearGradient id="knobFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eaebed" />
          <stop offset="100%" stopColor="#c6c8cd" />
        </linearGradient>
      </defs>

      {/* Canvas Background and Grid */}
      <rect x={-10000} y={-10000} width={20000} height={20000} fill="#ededed" />
      <rect x={-10000} y={-10000} width={20000} height={20000} fill="url(#dotGrid)" />

      {/* Breadboards Layer */}
      <g className="breadboards-layer">
        {project.parts
          .filter(part => part.kind === 'breadboard' || isBreadboardPart(part, libraryRecords))
          .map(part => (
            <Breadboard
              key={part.id}
              project={project}
              part={part}
              simulation={simulation}
              libraryRecord={libraryRecords[libraryIdFromPart(part)]}
              libraryRecords={libraryRecords}
              pending={pending}
              selected={selected === part.id}
              onPointerDown={e => pointerDownPart(e, part)}
            />
          ))}
      </g>

      {/* Wires Layer (rendered under components and on top of breadboards) */}
      <g className="wires-layer">
        {project.wires
          .filter(wire => !wire.hidden)
          .map((wire: Wire) => {
            let a = terminalPosition(project, wire.from, libraryRecords)
            let b = terminalPosition(project, wire.to, libraryRecords)
            if (dragEndpointPreview && dragEndpointPreview.wireId === wire.id) {
              if (dragEndpointPreview.endpoint === 'from') a = dragEndpointPreview.pos
              if (dragEndpointPreview.endpoint === 'to') b = dragEndpointPreview.pos
            }
            if (!a || !b) return null
            const path = wirePath(project, wire, a, b)
            const isWireSelected = selected === wire.id

            return (
              <g
                key={wire.id}
                className={`wire ${isWireSelected ? 'wire-selected' : ''}`}
                filter="url(#wireShadow)"
                onPointerDown={e => pointerDownWire(e, wire)}
                onClick={e => {
                  e.stopPropagation()
                  if (!pending) onSelect(wire.id)
                }}
                onDoubleClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  if (!pending) insertBendAtPoint(wire.id, toWorld(e))
                }}
              >
                {/* Outer stroke / Selection ring */}
                <path
                  d={path}
                  stroke={isWireSelected ? '#0082c3' : '#0f172a'}
                  strokeWidth={isWireSelected ? 8.5 : 5.5}
                  strokeOpacity={isWireSelected ? 1 : 0.22}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Core wire color */}
                <path
                  d={path}
                  stroke={wire.color}
                  strokeWidth={isWireSelected ? 5.5 : 4.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Terminal Donut Rings at endpoints A and B */}
                <g className="wire-terminals" pointerEvents="none">
                  {/* Endpoint A */}
                  <circle cx={a.x} cy={a.y} r={5} fill="#1e293b" opacity={0.65} />
                  <circle cx={a.x} cy={a.y} r={3.8} fill={wire.color} stroke="#ffffff" strokeWidth={1} />
                  <circle cx={a.x} cy={a.y} r={1.6} fill="#1e293b" />

                  {/* Endpoint B */}
                  <circle cx={b.x} cy={b.y} r={5} fill="#1e293b" opacity={0.65} />
                  <circle cx={b.x} cy={b.y} r={3.8} fill={wire.color} stroke="#ffffff" strokeWidth={1} />
                  <circle cx={b.x} cy={b.y} r={1.6} fill="#1e293b" />
                </g>
              </g>
            )
          })}
      </g>

      {/* Components Layer (rendered on top of wires) */}
      <g className="components-layer">
        {project.parts
          .filter(part => part.kind !== 'breadboard' && !isBreadboardPart(part, libraryRecords))
          .map(part => (
            <PartFigure
              key={part.id}
              part={part}
              project={project}
              simulation={simulation}
              libraryRecord={libraryRecords[libraryIdFromPart(part)]}
              selected={selected === part.id}
              onToggleButton={onToggleButton}
              onPointerDown={e => pointerDownPart(e, part)}
            />
          ))}
      </g>

      {/* Selected Wire Interactive Handles & Snap Guides */}
      {selectedWireObj && (() => {
        let a = terminalPosition(project, selectedWireObj.from, libraryRecords)
        let b = terminalPosition(project, selectedWireObj.to, libraryRecords)
        if (dragEndpointPreview && dragEndpointPreview.wireId === selectedWireObj.id) {
          if (dragEndpointPreview.endpoint === 'from') a = dragEndpointPreview.pos
          if (dragEndpointPreview.endpoint === 'to') b = dragEndpointPreview.pos
        }
        if (!a || !b) return null
        const overlayPath = wirePath(project, selectedWireObj, a, b)

        return (
          <g className="wire-interaction-overlay">
            {/* Overlay highlight on top of components so selected wire route is always visible */}
            <path
              d={overlayPath}
              stroke="#0284c7"
              strokeWidth={3}
              strokeDasharray="4 4"
              strokeOpacity={0.8}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
            />

            {/* Active snap guide lines and badges */}
            {activeSnapGuides.map((guide, idx) => {
              if (guide.type === 'x') {
                return (
                  <g key={`guide-x-${idx}`} pointerEvents="none" className="snap-guide">
                    <line
                      x1={guide.pos}
                      y1={view.y - 100}
                      x2={guide.pos}
                      y2={view.y + view.height + 100}
                      stroke="#0284c7"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      opacity={0.85}
                    />
                    {guide.label && (
                      <g transform={`translate(${guide.pos} ${Math.max(view.y + 20, 160)}) scale(${1 / screenScale})`}>
                        <rect x={-34} y={-10} width={68} height={20} rx={4} fill="#0284c7" />
                        <text x={0} y={4} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight={700}>
                          {guide.label}
                        </text>
                      </g>
                    )}
                  </g>
                )
              } else {
                return (
                  <g key={`guide-y-${idx}`} pointerEvents="none" className="snap-guide">
                    <line
                      x1={view.x - 100}
                      y1={guide.pos}
                      x2={view.x + view.width + 100}
                      y2={guide.pos}
                      stroke="#0284c7"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      opacity={0.85}
                    />
                    {guide.label && (
                      <g transform={`translate(${Math.max(view.x + 40, 170)} ${guide.pos}) scale(${1 / screenScale})`}>
                        <rect x={-40} y={-10} width={80} height={20} rx={4} fill="#0284c7" />
                        <text x={0} y={4} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight={700}>
                          {guide.label}
                        </text>
                      </g>
                    )}
                  </g>
                )
              }
            })}

            {/* Segment Midpoint Ghost Handles for direct grabbing and centering */}
            {segmentMidpoints.map(mid => (
              <g key={`mid-${mid.segIdx}`} className="wire-midpoint-handle" cursor="crosshair">
                <circle
                  cx={mid.x}
                  cy={mid.y}
                  r={12}
                  fill="transparent"
                  onPointerDown={e => pointerDownMidpoint(e, selectedWireObj.id, mid.segIdx, mid)}
                >
                  <title>Arraste para centralizar / criar curva</title>
                </circle>
                <circle
                  cx={mid.x}
                  cy={mid.y}
                  r={4}
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  opacity={0.9}
                  pointerEvents="none"
                />
              </g>
            ))}

            {/* Existing Bend Handles */}
            {selectedWireObj.bends?.map((bend, bendIdx) => (
              <g key={`bend-${bendIdx}`} className="wire-bend-handle">
                <circle
                  cx={bend.x}
                  cy={bend.y}
                  r={12}
                  fill="transparent"
                  cursor="grab"
                  onPointerDown={e => pointerDownBend(e, selectedWireObj.id, bendIdx)}
                  onDoubleClick={e => {
                    e.stopPropagation()
                    e.preventDefault()
                    removeBend(selectedWireObj.id, bendIdx)
                  }}
                >
                  <title>Arraste para mover / Duplo clique para remover curva</title>
                </circle>
                <circle
                  cx={bend.x}
                  cy={bend.y}
                  r={5.5}
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  cursor="grab"
                  pointerEvents="none"
                />
                <circle
                  cx={bend.x}
                  cy={bend.y}
                  r={2}
                  fill="#0284c7"
                  pointerEvents="none"
                />
              </g>
            ))}

            {/* Endpoint A Handle (Reconnecting wire to another hole) */}
            <g className="wire-endpoint-handle" cursor="grab">
              <circle
                cx={a.x}
                cy={a.y}
                r={13}
                fill="transparent"
                onPointerDown={e => pointerDownEndpoint(e, selectedWireObj.id, 'from')}
              >
                <title>Arraste para reconectar este terminal a outro furo</title>
              </circle>
              <circle
                cx={a.x}
                cy={a.y}
                r={6}
                fill="#ffffff"
                stroke="#0284c7"
                strokeWidth={2.5}
                pointerEvents="none"
              />
              <circle
                cx={a.x}
                cy={a.y}
                r={2}
                fill="#0284c7"
                pointerEvents="none"
              />
            </g>

            {/* Endpoint B Handle (Reconnecting wire to another hole) */}
            <g className="wire-endpoint-handle" cursor="grab">
              <circle
                cx={b.x}
                cy={b.y}
                r={13}
                fill="transparent"
                onPointerDown={e => pointerDownEndpoint(e, selectedWireObj.id, 'to')}
              >
                <title>Arraste para reconectar este terminal a outro furo</title>
              </circle>
              <circle
                cx={b.x}
                cy={b.y}
                r={6}
                fill="#ffffff"
                stroke="#0284c7"
                strokeWidth={2.5}
                pointerEvents="none"
              />
              <circle
                cx={b.x}
                cy={b.y}
                r={2}
                fill="#0284c7"
                pointerEvents="none"
              />
            </g>
          </g>
        )
      })()}

      {/* Active draft wire being drawn */}
      {draftStart && (
        <g className="wire-draft" pointerEvents="none" filter="url(#wireShadow)">
          <path ref={draftBackingRef} d={draftPath} fill="none" stroke="#0f172a" strokeWidth={7} strokeOpacity={0.25} strokeLinecap="round" strokeLinejoin="round" />
          <path ref={draftPathRef} d={draftPath} fill="none" stroke={wireColor} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={draftStart.x} cy={draftStart.y} r={7} fill="#ffffff" stroke={wireColor} strokeWidth={3} />
          {wireBends.map((point, i) => (
            <circle key={i} cx={point.x} cy={point.y} r={4.5} fill={wireColor} stroke="#ffffff" strokeWidth={2} />
          ))}
          <g ref={draftTipRef} transform={`translate(${draftEnd?.x ?? draftStart.x} ${draftEnd?.y ?? draftStart.y})`}>
            {/* Magnetic snap halo when targeting any terminal */}
            <circle
              r={13}
              fill="rgba(34, 197, 94, 0.25)"
              stroke="#22c55e"
              strokeWidth={2.5}
              opacity={hoveredTerminal && hoveredTerminal !== pending ? 1 : 0}
            />
            <circle r={6.5} fill="#ffffff" stroke={hoveredTerminal && hoveredTerminal !== pending ? '#22c55e' : wireColor} strokeWidth={2.5} />
            <circle r={2.5} fill={hoveredTerminal && hoveredTerminal !== pending ? '#22c55e' : wireColor} />
          </g>
        </g>
      )}

      {/* Connection feedback sits above wires so a crossing cannot hide a pin. */}
      <g className="connection-markers" pointerEvents="none">
        {targets.filter(target => !target.isBoard && connectedTerminals.has(target.id)).map(target => (
          <circle key={target.id} cx={target.x} cy={target.y} r={4} fill="#15803d" stroke="#ffffff" strokeWidth={1.5} />
        ))}
        {project.wires.filter(isDirectContact).map(contact => {
          const point = terminalPosition(project, contact.from, libraryRecords)
          return point && <g key={contact.id} className="direct-contact" data-from={contact.from} data-to={contact.to}>
            <title>Contato direto: {terminalLabel(project, contact.from)} ↔ {terminalLabel(project, contact.to)}</title>
            <circle cx={point.x} cy={point.y} r={7} fill="#dcfce7" stroke="#15803d" strokeWidth={2} />
            <circle cx={point.x} cy={point.y} r={2.5} fill="#15803d" />
          </g>
        })}
      </g>
      {directCandidate && (
        <g className="contact-preview" data-from={directCandidate.from.id} data-to={directCandidate.to.id} pointerEvents="none">
          <line x1={directCandidate.from.x} y1={directCandidate.from.y} x2={directCandidate.to.x} y2={directCandidate.to.y}
            stroke="#15803d" strokeWidth={2} strokeDasharray="3 3" />
          <circle cx={directCandidate.from.x} cy={directCandidate.from.y} r={9} fill="#22c55e" fillOpacity={0.2} stroke="#15803d" strokeWidth={2} />
          <g transform={`translate(${directCandidate.to.x} ${directCandidate.to.y}) scale(${1 / screenScale})`}>
            <circle r={11} fill="#22c55e" fillOpacity={0.2} stroke="#15803d" strokeWidth={2} />
            <rect x={-150} y={-68} width={300} height={52} rx={6} fill="#16352a" />
            <text x={0} y={-53} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={600}>Solte para conectar sem fio</text>
            <text x={0} y={-39} textAnchor="middle" fill="#bbf7d0" fontSize={10}>{directCandidate.from.label} ↔ {directCandidate.to.label}</text>
            <text x={0} y={-24} textAnchor="middle" fill="#bbf7d0" fontSize={9}>Os terminais serão alinhados ao soltar</text>
          </g>
        </g>
      )}
      {highlightedTarget && (
        <g className="terminal-feedback" data-target={highlightedTarget.id} pointerEvents="none"
          transform={`translate(${highlightedTarget.x} ${highlightedTarget.y}) scale(${1 / screenScale})`}>
          <circle r={10} fill="#22c55e" fillOpacity={0.18} stroke="#15803d" strokeWidth={2} />
          <g transform="translate(0 -25)">
            <rect x={-Math.max(100, highlightedTarget.label.length * 7 + 24) / 2} y={-16}
              width={Math.max(100, highlightedTarget.label.length * 7 + 24)} height={39} rx={6} fill="#16352a" />
            <text textAnchor="middle" fill="#fff" fontSize={12} fontWeight={600}>{highlightedTarget.label}</text>
            <text y={16} textAnchor="middle" fill="#bbf7d0" fontSize={10}>
              {pending ? highlightedTarget.id === pending ? 'Origem · clique para cancelar' : 'Clique ou solte para conectar'
                : connectedTerminals.has(highlightedTarget.id) ? 'Conectado · clique para ligar outro fio' : 'Clique ou arraste para conectar'}
            </text>
          </g>
        </g>
      )}
    </svg>
  )
}
