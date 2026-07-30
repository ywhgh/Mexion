import type { AxiomType } from './types'

export const ILLUSTRATION_WIDTH = 560
export const ILLUSTRATION_HEIGHT = 420
export const TAU = Math.PI * 2

type Point = readonly [number, number]
type GeoPoint = readonly [number, number]
type Vector4 = readonly [number, number, number, number]

export interface IllustrationPalette {
  ink: string
  muted: string
  faint: string
  accent: string
}

export interface IllustrationRenderState {
  theme: AxiomType
  width: number
  height: number
  drawProgress: number
  cycle: number
  palette: IllustrationPalette
}

export const ILLUSTRATION_FEATURES: Record<AxiomType, readonly string[]> = {
  axiom: ['armillary sphere', 'rotating globe', 'continental plates', 'orbital body'],
  singularity: ['spacetime grid', 'gravity funnel', 'event horizon', 'accretion disk'],
  resonance: ['classical tuning fork', 'Chladni figure', 'standing waves', 'resonance nodes'],
  entropy: ['hexagonal crystal', 'dandelion crown', 'drifting seeds', 'organic tendril'],
  dimension: ['observer eye', 'perspective rays', 'tesseract projection', 'dimensional vertices'],
  constant: ['nautilus shell', 'logarithmic spiral', 'Fibonacci measure', 'classical compass']
}

export interface MotionSignature {
  rotationCos: number
  rotationSin: number
  breath: number
  drift: number
  wave: number
  projection: number
}

export function getMotionSignature(cycle: number): MotionSignature {
  const angle = TAU * normalizeCycle(cycle)
  return {
    rotationCos: Math.cos(angle),
    rotationSin: Math.sin(angle),
    breath: (1 - Math.cos(angle)) / 2,
    drift: Math.sin(angle),
    wave: Math.sin(angle * 2),
    projection: Math.cos(angle)
  }
}

function normalizeCycle(value: number): number {
  if (!Number.isFinite(value)) return 0
  return ((value % 1) + 1) % 1
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function smoothstep(value: number): number {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

function reveal(progress: number, start: number, end: number): number {
  return end <= start
    ? Number(progress >= end)
    : smoothstep((progress - start) / (end - start))
}

function sample<T>(count: number, pointAt: (ratio: number) => T): T[] {
  const safeCount = Math.max(2, count)
  return Array.from({ length: safeCount }, (_, index) => pointAt(index / (safeCount - 1)))
}

function ellipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotation = 0,
  start = 0,
  end = TAU,
  count = 96
): Point[] {
  const cosRotation = Math.cos(rotation)
  const sinRotation = Math.sin(rotation)
  return sample(count, ratio => {
    const angle = start + (end - start) * ratio
    const x = Math.cos(angle) * rx
    const y = Math.sin(angle) * ry
    return [
      cx + x * cosRotation - y * sinRotation,
      cy + x * sinRotation + y * cosRotation
    ]
  })
}

function pointOnEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotation: number,
  angle: number
): Point {
  const x = Math.cos(angle) * rx
  const y = Math.sin(angle) * ry
  const cosRotation = Math.cos(rotation)
  const sinRotation = Math.sin(rotation)
  return [
    cx + x * cosRotation - y * sinRotation,
    cy + x * sinRotation + y * cosRotation
  ]
}

function bezier(p0: Point, p1: Point, p2: Point, p3: Point, count = 48): Point[] {
  return sample(count, ratio => {
    const inverse = 1 - ratio
    return [
      inverse ** 3 * p0[0] + 3 * inverse ** 2 * ratio * p1[0] + 3 * inverse * ratio ** 2 * p2[0] + ratio ** 3 * p3[0],
      inverse ** 3 * p0[1] + 3 * inverse ** 2 * ratio * p1[1] + 3 * inverse * ratio ** 2 * p2[1] + ratio ** 3 * p3[1]
    ]
  })
}

function join(...paths: Point[][]): Point[] {
  return paths.flatMap((path, index) => index === 0 ? path : path.slice(1))
}

function rotate(point: Point, angle: number, origin: Point): Point {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = point[0] - origin[0]
  const dy = point[1] - origin[1]
  return [origin[0] + dx * cos - dy * sin, origin[1] + dx * sin + dy * cos]
}

function rectangle(x: number, y: number, width: number, height: number): Point[] {
  return [[x, y], [x + width, y], [x + width, y + height], [x, y + height]]
}

interface StrokeOptions {
  color: string
  width: number
  opacity?: number
  closed?: boolean
  dash?: readonly number[]
}

function trace(
  ctx: CanvasRenderingContext2D,
  points: readonly Point[],
  progress: number,
  options: StrokeOptions
) {
  const amount = clamp01(progress)
  if (amount <= 0 || points.length < 2) return

  const source = options.closed ? [...points, points[0]] : [...points]
  const lengths: number[] = []
  let total = 0
  for (let index = 1; index < source.length; index += 1) {
    const length = Math.hypot(
      source[index][0] - source[index - 1][0],
      source[index][1] - source[index - 1][1]
    )
    lengths.push(length)
    total += length
  }

  const target = total * amount
  let consumed = 0
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(source[0][0], source[0][1])
  for (let index = 1; index < source.length; index += 1) {
    const length = lengths[index - 1]
    if (consumed + length <= target) {
      ctx.lineTo(source[index][0], source[index][1])
      consumed += length
      continue
    }
    const ratio = length === 0 ? 0 : Math.max(0, target - consumed) / length
    const previous = source[index - 1]
    ctx.lineTo(
      previous[0] + (source[index][0] - previous[0]) * ratio,
      previous[1] + (source[index][1] - previous[1]) * ratio
    )
    break
  }
  if (options.closed && amount >= 0.9999) ctx.closePath()
  ctx.strokeStyle = options.color
  ctx.globalAlpha = options.opacity ?? 1
  ctx.lineWidth = options.width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.setLineDash(options.dash ? [...options.dash] : [])
  ctx.stroke()
  ctx.restore()
}

function dot(ctx: CanvasRenderingContext2D, point: Point, radius: number, color: string, opacity = 1) {
  if (radius <= 0) return
  ctx.save()
  ctx.beginPath()
  ctx.arc(point[0], point[1], radius, 0, TAU)
  ctx.fillStyle = color
  ctx.globalAlpha = opacity
  ctx.fill()
  ctx.restore()
}

function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  point: Point,
  color: string,
  opacity = 0.55,
  align: CanvasTextAlign = 'left'
) {
  ctx.save()
  ctx.fillStyle = color
  ctx.globalAlpha = opacity
  ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  ctx.textAlign = align
  ctx.fillText(text, point[0], point[1])
  ctx.restore()
}

function survey(ctx: CanvasRenderingContext2D, progress: number, palette: IllustrationPalette) {
  const base = reveal(progress, 0, 0.2)
  trace(ctx, [[62, 210], [498, 210]], base, {
    color: palette.faint,
    width: 0.55,
    opacity: 0.42,
    dash: [2, 8]
  })
  trace(ctx, [[280, 56], [280, 364]], base, {
    color: palette.faint,
    width: 0.55,
    opacity: 0.34,
    dash: [2, 9]
  })
  const marks = reveal(progress, 0.08, 0.24)
  for (const [x, y] of [[66, 82], [494, 82], [66, 338], [494, 338]] as Point[]) {
    trace(ctx, [[x - 5, y], [x + 5, y]], marks, { color: palette.faint, width: 0.65, opacity: 0.5 })
    trace(ctx, [[x, y - 5], [x, y + 5]], marks, { color: palette.faint, width: 0.65, opacity: 0.5 })
  }
}

function projectSphere(lat: number, lon: number, rotation: number, cx: number, cy: number, radius: number) {
  const longitude = lon + rotation
  const cosLat = Math.cos(lat)
  return {
    point: [cx + radius * cosLat * Math.sin(longitude), cy - radius * Math.sin(lat)] as Point,
    visible: cosLat * Math.cos(longitude) >= -0.015
  }
}

function splitVisible(points: Array<{ point: Point; visible: boolean }>): Point[][] {
  const segments: Point[][] = []
  let active: Point[] = []
  for (const entry of points) {
    if (entry.visible) active.push(entry.point)
    else if (active.length > 1) {
      segments.push(active)
      active = []
    } else active = []
  }
  if (active.length > 1) segments.push(active)
  return segments
}

function globeCurve(
  ctx: CanvasRenderingContext2D,
  coordinates: readonly GeoPoint[],
  rotation: number,
  progress: number,
  style: StrokeOptions
) {
  const dense: GeoPoint[] = []
  for (let index = 1; index < coordinates.length; index += 1) {
    const from = coordinates[index - 1]
    const to = coordinates[index]
    for (let step = 0; step < 8; step += 1) {
      const ratio = step / 8
      dense.push([from[0] + (to[0] - from[0]) * ratio, from[1] + (to[1] - from[1]) * ratio])
    }
  }
  dense.push(coordinates[coordinates.length - 1])
  const segments = splitVisible(dense.map(([lat, lon]) => projectSphere(
    lat * Math.PI / 180,
    lon * Math.PI / 180,
    rotation,
    280,
    205,
    82
  )))
  segments.forEach((segment, index) => trace(ctx, segment, clamp01(progress * segments.length - index), style))
}
function drawAxiom(
  ctx: CanvasRenderingContext2D,
  progress: number,
  cycle: number,
  palette: IllustrationPalette
) {
  const angle = TAU * normalizeCycle(cycle)
  const framework = reveal(progress, 0.14, 0.5)
  const globe = reveal(progress, 0.28, 0.62)
  const details = reveal(progress, 0.5, 0.86)
  const accents = reveal(progress, 0.82, 1)
  const eclipticTilt = 0.37 + Math.sin(angle) * 0.06
  const counterTilt = -0.52 + Math.sin(angle * 2 + 0.42) * 0.036

  trace(ctx, ellipse(280, 205, 151, 151, 0, 0, TAU, 144), framework, {
    color: palette.muted,
    width: 1.15,
    opacity: 0.68,
    closed: true
  })
  trace(ctx, ellipse(280, 205, 151, 57, eclipticTilt, 0, TAU, 144), framework, {
    color: palette.ink,
    width: 1.45,
    opacity: 0.78,
    closed: true
  })
  trace(ctx, ellipse(280, 205, 149, 55, counterTilt, 0, TAU, 144), reveal(progress, 0.2, 0.53), {
    color: palette.muted,
    width: 1.05,
    opacity: 0.7,
    closed: true
  })
  trace(ctx, [[236, 60], [324, 350]], framework, {
    color: palette.muted,
    width: 0.85,
    opacity: 0.55
  })
  trace(ctx, join(
    bezier([248, 353], [242, 365], [229, 371], [211, 374], 20),
    bezier([211, 374], [248, 381], [312, 381], [349, 374], 28),
    bezier([349, 374], [331, 371], [318, 365], [312, 353], 20)
  ), framework, {
    color: palette.ink,
    width: 1.25,
    opacity: 0.82
  })

  trace(ctx, ellipse(280, 205, 82, 82, 0, 0, TAU, 128), globe, {
    color: palette.ink,
    width: 2.05,
    opacity: 0.96,
    closed: true
  })

  const globeRotation = angle - 0.62
  for (const latitude of [-55, -30, 0, 30, 55]) {
    const projected = sample(96, ratio => {
      const entry = projectSphere(
        latitude * Math.PI / 180,
        ratio * TAU - Math.PI,
        globeRotation,
        280,
        205,
        82
      )
      return entry.point
    })
    trace(ctx, projected, details, {
      color: latitude === 0 ? palette.muted : palette.faint,
      width: latitude === 0 ? 0.9 : 0.65,
      opacity: latitude === 0 ? 0.6 : 0.48
    })
  }

  for (const longitude of [-120, -60, 0, 60, 120]) {
    const segments = splitVisible(sample(96, ratio => {
      const latitude = -Math.PI / 2 + ratio * Math.PI
      return projectSphere(latitude, longitude * Math.PI / 180, globeRotation, 280, 205, 82)
    }))
    for (const segment of segments) {
      trace(ctx, segment, details, { color: palette.faint, width: 0.7, opacity: 0.52 })
    }
  }

  const activeMeridian = splitVisible(sample(96, ratio => {
    const latitude = -Math.PI / 2 + ratio * Math.PI
    return projectSphere(latitude, 18 * Math.PI / 180, globeRotation, 280, 205, 82)
  }))
  for (const segment of activeMeridian) {
    trace(ctx, segment, details, {
      color: palette.accent,
      width: 0.92,
      opacity: 0.36 * accents
    })
  }

  const continentStyle: StrokeOptions = { color: palette.ink, width: 1.3, opacity: 0.86 }
  globeCurve(ctx, [[58, -18], [64, 20], [56, 52], [49, 92], [26, 118], [8, 103], [18, 72], [8, 43], [20, 18], [37, -4], [58, -18]], globeRotation, details, continentStyle)
  globeCurve(ctx, [[34, -17], [17, -5], [4, 12], [-18, 18], [-35, 29], [-34, 11], [-10, -2], [9, -15], [34, -17]], globeRotation, details, continentStyle)
  globeCurve(ctx, [[60, -138], [45, -126], [30, -112], [15, -91], [8, -78], [27, -80], [45, -98], [58, -120], [60, -138]], globeRotation, details, continentStyle)
  globeCurve(ctx, [[8, -79], [-8, -76], [-25, -67], [-49, -70], [-31, -54], [-8, -61], [8, -79]], globeRotation, details, continentStyle)

  const orbitAngle = angle * 2 + 0.45
  trace(ctx, ellipse(280, 205, 151, 57, eclipticTilt, orbitAngle - 0.42, orbitAngle, 34), accents, {
    color: palette.accent,
    width: 1.05,
    opacity: 0.4
  })
  const satellite = pointOnEllipse(280, 205, 151, 57, eclipticTilt, orbitAngle)
  for (let tail = 4; tail >= 1; tail -= 1) {
    const tailPoint = pointOnEllipse(280, 205, 151, 57, eclipticTilt, orbitAngle - tail * 0.07)
    dot(ctx, tailPoint, (2.4 - tail * 0.36) * accents, palette.accent, 0.14 + (4 - tail) * 0.08)
  }
  dot(ctx, satellite, 3.8 * accents, palette.accent, 0.98)
  trace(ctx, [[satellite[0] - 7, satellite[1]], [satellite[0] + 7, satellite[1]]], accents, {
    color: palette.accent,
    width: 0.8,
    opacity: 0.78
  })
  trace(ctx, [[satellite[0], satellite[1] - 7], [satellite[0], satellite[1] + 7]], accents, {
    color: palette.accent,
    width: 0.8,
    opacity: 0.78
  })

  for (let index = 0; index < 9; index += 1) {
    const tickAngle = -1.02 + index * 0.085
    const inner: Point = [280 + Math.cos(tickAngle) * 155, 205 + Math.sin(tickAngle) * 155]
    const outerRadius = index % 4 === 0 ? 164 : 160
    const outer: Point = [
      280 + Math.cos(tickAngle) * outerRadius,
      205 + Math.sin(tickAngle) * outerRadius
    ]
    trace(ctx, [inner, outer], details, { color: palette.muted, width: 0.7, opacity: 0.62 })
  }

  if (progress > 0.72) {
    label(ctx, '23°26′ / ECLIPTIC', [388, 104], palette.muted, 0.62 * details)
    label(ctx, 'ROT. 001', [327, 304], palette.accent, 0.72 * accents)
  }
}

function drawSingularity(
  ctx: CanvasRenderingContext2D,
  progress: number,
  cycle: number,
  palette: IllustrationPalette
) {
  const angle = TAU * normalizeCycle(cycle)
  const breath = (1 - Math.cos(angle * 2)) / 2
  const tension = Math.sin(angle * 2)
  const grid = reveal(progress, 0.12, 0.45)
  const funnel = reveal(progress, 0.3, 0.68)
  const details = reveal(progress, 0.55, 0.88)
  const accents = reveal(progress, 0.82, 1)

  for (let row = -3; row <= 3; row += 1) {
    const path = sample(80, ratio => {
      const x = 72 + ratio * 416
      const normalized = (x - 280) / 208
      const gravity = Math.exp(-normalized * normalized * 5.2)
      const breathingDepth = gravity * (7 * breath + tension * 1.8)
      return [
        x,
        145 + row * 20 + gravity * (96 - Math.abs(row) * 9) + breathingDepth
      ] as Point
    })
    trace(ctx, path, clamp01(grid * 1.2 - (row + 3) * 0.04), {
      color: palette.faint,
      width: row === 0 ? 0.8 : 0.58,
      opacity: row === 0 ? 0.58 : 0.43
    })
  }

  for (let column = -6; column <= 6; column += 1) {
    const x = 280 + column * 31
    const centerPull = tension * (1 - Math.min(1, Math.abs(column) / 7)) * 3.4
    const path = join(
      bezier([x, 90], [x + column * 2, 140], [280 + column * 15, 172 + centerPull], [280 + column * 8, 220 + centerPull], 30),
      bezier([280 + column * 8, 220 + centerPull], [280 + column * 5, 264], [280 + column * 2, 301], [280, 331], 32)
    )
    trace(ctx, path, clamp01(grid * 1.18 - (column + 6) * 0.025), {
      color: palette.faint,
      width: column === 0 ? 0.8 : 0.56,
      opacity: column === 0 ? 0.6 : 0.4
    })
  }

  for (let ring = 0; ring < 7; ring += 1) {
    const ratio = ring / 6
    const y = 176 + ratio * 138 + tension * (1 - ratio) * 2.4
    const rx = (112 * (1 - ratio) ** 1.24 + 7) * (1 + breath * 0.025)
    const ry = 22 * (1 - ratio * 0.55) + breath * (1 - ratio) * 1.8
    trace(ctx, ellipse(280, y, rx, ry, 0, 0, TAU, 112), clamp01(funnel * 1.35 - ring * 0.08), {
      color: ring < 2 ? palette.muted : palette.ink,
      width: ring === 0 ? 1.35 : 0.85,
      opacity: 0.45 + ratio * 0.34,
      closed: true
    })
  }

  trace(ctx, ellipse(280, 167 + tension * 1.4, 111 + breath * 3.2, 23 + breath * 1.4, -0.12, 0, TAU, 144), funnel, {
    color: palette.ink,
    width: 2,
    opacity: 0.92,
    closed: true
  })
  trace(ctx, ellipse(280, 166, 72 + breath * 2.4, 12 + breath, 0.18, 0, TAU, 120), details, {
    color: palette.muted,
    width: 1.1,
    opacity: 0.68,
    closed: true
  })
  trace(ctx, ellipse(280, 166, 35 + breath * 1.6, 7 + breath * 0.65, 0.06, 0, TAU, 96), details, {
    color: palette.ink,
    width: 2.4,
    opacity: 0.95,
    closed: true
  })

  for (let stream = 0; stream < 4; stream += 1) {
    const phase = angle * 2 + stream * TAU / 4
    const cx = 280
    const cy = 160 + stream * 2
    const rx = 134 - stream * 15
    const ry = 29 - stream * 3
    const rotation = -0.2 + stream * 0.1 + Math.sin(angle + stream * 0.6) * 0.035
    const orbit = ellipse(cx, cy, rx, ry, rotation, phase, phase + 1.5, 46)
    const isPrimary = stream === 0
    trace(ctx, orbit, details, {
      color: isPrimary ? palette.accent : palette.muted,
      width: isPrimary ? 1.7 : 1,
      opacity: isPrimary ? 0.88 * accents : 0.62
    })

    const flowPoint = pointOnEllipse(cx, cy, rx, ry, rotation, phase + 1.42)
    for (let tail = 3; tail >= 1; tail -= 1) {
      const tailPoint = pointOnEllipse(cx, cy, rx, ry, rotation, phase + 1.42 - tail * 0.1)
      dot(
        ctx,
        tailPoint,
        (1.9 - tail * 0.34) * details,
        isPrimary ? palette.accent : palette.muted,
        (isPrimary ? accents : 1) * (0.12 + (3 - tail) * 0.08)
      )
    }
    dot(
      ctx,
      flowPoint,
      (isPrimary ? 3.15 : 2.15) * details,
      isPrimary ? palette.accent : palette.ink,
      isPrimary ? 0.94 * accents : 0.7
    )
  }

  const singularPoint: Point = [280, 329]
  dot(ctx, singularPoint, (3.2 + breath * 0.8) * accents, palette.accent, 0.95)
  trace(ctx, [[268, 329], [292, 329]], accents, { color: palette.accent, width: 0.75, opacity: 0.72 })
  trace(ctx, [[280, 317], [280, 341]], accents, { color: palette.accent, width: 0.75, opacity: 0.72 })
  if (progress > 0.72) {
    label(ctx, 'EVENT HORIZON', [394, 157], palette.muted, 0.62 * details)
    label(ctx, 'r → 0', [291, 344], palette.accent, 0.76 * accents)
  }
}

function drawResonance(
  ctx: CanvasRenderingContext2D,
  progress: number,
  cycle: number,
  palette: IllustrationPalette
) {
  const angle = TAU * normalizeCycle(cycle)
  const vibration = Math.sin(angle * 3) * 4.8
  const standingPulse = Math.sin(angle * 2) * 3.6
  const framework = reveal(progress, 0.13, 0.42)
  const fork = reveal(progress, 0.28, 0.68)
  const waves = reveal(progress, 0.5, 0.9)
  const accents = reveal(progress, 0.82, 1)
  const chladniX = 119 + standingPulse
  const chladniY = 71 - standingPulse * 0.42

  const chladni = sample(260, ratio => {
    const theta = ratio * TAU
    return [
      280 + Math.sin(theta * 2) * chladniX,
      192 + Math.sin(theta * 3) * chladniY
    ] as Point
  })
  trace(ctx, chladni, framework, {
    color: palette.faint,
    width: 0.72,
    opacity: 0.48,
    closed: true
  })
  trace(ctx, ellipse(280, 191, 146 + standingPulse * 0.45, 103 - standingPulse * 0.2, 0, 0, TAU, 144), framework, {
    color: palette.faint,
    width: 0.55,
    opacity: 0.36,
    dash: [3, 8],
    closed: true
  })

  const leftOuter = join(
    bezier([236 + vibration, 100], [235 + vibration, 151], [235, 207], [250, 236], 40),
    bezier([250, 236], [258, 251], [268, 257], [280, 258], 22)
  )
  const rightOuter = join(
    bezier([324 - vibration, 100], [325 - vibration, 151], [325, 207], [310, 236], 40),
    bezier([310, 236], [302, 251], [292, 257], [280, 258], 22)
  )
  const leftInner = bezier([250 + vibration * 0.65, 105], [249, 161], [251, 210], [280, 231], 52)
  const rightInner = bezier([310 - vibration * 0.65, 105], [311, 161], [309, 210], [280, 231], 52)

  trace(ctx, leftOuter, fork, { color: palette.ink, width: 2.2, opacity: 0.96 })
  trace(ctx, rightOuter, fork, { color: palette.ink, width: 2.2, opacity: 0.96 })
  trace(ctx, leftInner, reveal(progress, 0.38, 0.72), { color: palette.muted, width: 1.05, opacity: 0.76 })
  trace(ctx, rightInner, reveal(progress, 0.38, 0.72), { color: palette.muted, width: 1.05, opacity: 0.76 })
  trace(ctx, [[280, 258], [280, 331]], fork, { color: palette.ink, width: 5.2, opacity: 0.92 })
  trace(ctx, [[274, 331], [286, 331]], fork, { color: palette.ink, width: 1.3, opacity: 0.9 })
  trace(ctx, [[232 + vibration, 99], [252 + vibration, 99]], fork, { color: palette.ink, width: 1.2, opacity: 0.82 })
  trace(ctx, [[308 - vibration, 99], [328 - vibration, 99]], fork, { color: palette.ink, width: 1.2, opacity: 0.82 })

  for (let wave = 0; wave < 5; wave += 1) {
    const wavePhase = normalizeCycle(cycle * 2 + wave / 5)
    const radius = 46 + wavePhase * 144
    const envelope = Math.pow(Math.sin(Math.PI * wavePhase), 1.25)
    const isAccentWave = wave === 1
    const opacity = envelope * (isAccentWave ? 0.82 * accents : 0.58)
    const width = isAccentWave ? 1.4 : 0.9
    const color = isAccentWave ? palette.accent : palette.muted

    trace(ctx, ellipse(280, 184, radius, radius * 0.54, 0, -Math.PI * 0.42, Math.PI * 0.42, 54), waves, {
      color,
      width,
      opacity
    })
    trace(ctx, ellipse(280, 184, radius, radius * 0.54, 0, Math.PI * 0.58, Math.PI * 1.42, 54), waves, {
      color,
      width,
      opacity
    })
  }

  const nodeAngles = [0.08, 0.24, 0.42, 0.58, 0.76, 0.92]
  nodeAngles.forEach((ratio, index) => {
    const theta = ratio * TAU
    const node: Point = [
      280 + Math.sin(theta * 2) * chladniX,
      192 + Math.sin(theta * 3) * chladniY
    ]
    const pulse = 2.15 + Math.sin(angle * 3 + index * 0.8) * 0.52
    const opacity = 0.7 + Math.sin(angle * 3 + index * 0.8) * 0.16
    dot(ctx, node, pulse * accents, palette.accent, opacity)
  })
  trace(ctx, ellipse(280, 184, 19 + Math.sin(angle * 2) * 4.2, 8.5 + Math.cos(angle * 2) * 1.2, 0, 0, TAU, 72), accents, {
    color: palette.accent,
    width: 1.15,
    opacity: 0.75,
    closed: true
  })

  if (progress > 0.72) {
    label(ctx, 'f₀ = fₙ', [391, 92], palette.accent, 0.72 * accents)
    label(ctx, 'CHLADNI / NODE MAP', [74, 341], palette.muted, 0.6 * waves)
  }
}

function drawSeed(
  ctx: CanvasRenderingContext2D,
  origin: Point,
  angle: number,
  scale: number,
  progress: number,
  palette: IllustrationPalette,
  accented = false
) {
  const direction: Point = [Math.cos(angle), Math.sin(angle)]
  const normal: Point = [-direction[1], direction[0]]
  const tip: Point = [origin[0] + direction[0] * 13 * scale, origin[1] + direction[1] * 13 * scale]
  trace(ctx, [origin, tip], progress, {
    color: accented ? palette.accent : palette.muted,
    width: 0.85,
    opacity: accented ? 0.82 : 0.68
  })
  for (const spread of [-1, 0, 1]) {
    const tuft: Point = [
      origin[0] - direction[0] * 5 * scale + normal[0] * spread * 4 * scale,
      origin[1] - direction[1] * 5 * scale + normal[1] * spread * 4 * scale
    ]
    trace(ctx, [origin, tuft], progress, {
      color: accented ? palette.accent : palette.faint,
      width: 0.65,
      opacity: accented ? 0.7 : 0.55
    })
  }
  dot(ctx, tip, 1.3 * scale * progress, accented ? palette.accent : palette.ink, 0.75)
}

function drawEntropy(
  ctx: CanvasRenderingContext2D,
  progress: number,
  cycle: number,
  palette: IllustrationPalette
) {
  const angle = TAU * normalizeCycle(cycle)
  const framework = reveal(progress, 0.12, 0.42)
  const structure = reveal(progress, 0.28, 0.68)
  const organic = reveal(progress, 0.5, 0.9)
  const accents = reveal(progress, 0.82, 1)
  const sway = Math.sin(angle) * 6.5
  const crownLift = Math.sin(angle * 2) * 2.4
  const crystalCenter: Point = [176, 204]
  const crystalRadius = 69
  const crystal = sample(6, indexRatio => {
    const vertexAngle = -Math.PI / 2 + Math.round(indexRatio * 5) * TAU / 6
    return [
      crystalCenter[0] + Math.cos(vertexAngle) * crystalRadius,
      crystalCenter[1] + Math.sin(vertexAngle) * crystalRadius
    ] as Point
  })

  trace(ctx, crystal, framework, {
    color: palette.ink,
    width: 1.9,
    opacity: 0.94,
    closed: true
  })
  trace(ctx, ellipse(176, 204, 42, 42, 0, 0, TAU, 6), framework, {
    color: palette.muted,
    width: 1,
    opacity: 0.68,
    closed: true
  })
  for (let arm = 0; arm < 6; arm += 1) {
    const armAngle = -Math.PI / 2 + arm * TAU / 6
    const endpoint: Point = [176 + Math.cos(armAngle) * crystalRadius, 204 + Math.sin(armAngle) * crystalRadius]
    trace(ctx, [crystalCenter, endpoint], clamp01(structure * 1.15 - arm * 0.06), {
      color: palette.ink,
      width: 1.15,
      opacity: 0.8
    })
    for (const distance of [30, 48]) {
      const branchPoint: Point = [176 + Math.cos(armAngle) * distance, 204 + Math.sin(armAngle) * distance]
      for (const side of [-1, 1]) {
        const branchAngle = armAngle + side * Math.PI / 3
        const branchEnd: Point = [
          branchPoint[0] - Math.cos(branchAngle) * 11,
          branchPoint[1] - Math.sin(branchAngle) * 11
        ]
        trace(ctx, [branchPoint, branchEnd], structure, { color: palette.muted, width: 0.78, opacity: 0.68 })
      }
    }
  }

  for (let hatch = 0; hatch < 6; hatch += 1) {
    const y = 179 + hatch * 9
    trace(ctx, [[141 + hatch * 2, y], [160 + hatch * 3, y + 14]], structure, {
      color: palette.faint,
      width: 0.6,
      opacity: 0.52
    })
  }

  const transitionFragments: Array<{ point: Point; size: number; rotation: number }> = [
    { point: [252, 171], size: 12, rotation: 0.12 },
    { point: [279, 188], size: 9, rotation: 0.48 },
    { point: [304, 168], size: 7, rotation: 0.84 },
    { point: [322, 200], size: 5, rotation: 1.08 }
  ]
  transitionFragments.forEach((fragment, index) => {
    const motionWeight = index + 1
    const movedCenter: Point = [
      fragment.point[0] + Math.sin(angle + index * 0.82) * (1.3 + motionWeight * 1.25),
      fragment.point[1] + Math.cos(angle * 2 + index * 0.58) * (0.8 + motionWeight * 0.72)
    ]
    const fragmentRotation = fragment.rotation + Math.sin(angle + index * 0.64) * 0.035 * motionWeight
    const shape = rectangle(
      movedCenter[0] - fragment.size / 2,
      movedCenter[1] - fragment.size / 2,
      fragment.size,
      fragment.size
    ).map(point => rotate(point, fragmentRotation, movedCenter))
    trace(ctx, shape, clamp01(organic * 1.25 - index * 0.12), {
      color: index > 1 ? palette.accent : palette.muted,
      width: 0.85,
      opacity: index > 1 ? 0.76 * accents : 0.65,
      closed: true
    })
  })

  const crown: Point = [370 + sway, 184 + crownLift]
  const crownBreath = Math.sin(angle * 2) * 3.4
  trace(ctx, bezier(
    [crown[0], crown[1] + 6],
    [358 + sway * 0.72, 240 + crownLift * 0.45],
    [372 + sway * 0.34, 290],
    [349, 345],
    72
  ), organic, {
    color: palette.ink,
    width: 1.55,
    opacity: 0.88
  })
  trace(ctx, bezier([355 + sway * 0.25, 282], [332, 267], [320, 289], [315, 305], 36), organic, {
    color: palette.muted,
    width: 0.9,
    opacity: 0.7
  })
  trace(ctx, bezier([354 + sway * 0.3, 294], [383 + sway * 0.18, 272], [403, 289], [408, 311], 38), organic, {
    color: palette.muted,
    width: 0.9,
    opacity: 0.68
  })

  for (let ray = 0; ray < 18; ray += 1) {
    const rayAngle = -Math.PI * 0.92 + ray * Math.PI * 1.84 / 17
    if (ray > 11 && ray % 2 === 0) continue
    const flutterAngle = rayAngle + Math.sin(angle * 2 + ray * 0.61) * 0.028
    const radius = 39 + (ray % 3) * 4 + crownBreath * Math.cos(rayAngle) + Math.sin(angle * 3 + ray) * 1.35
    const endpoint: Point = [
      crown[0] + Math.cos(flutterAngle) * radius,
      crown[1] + Math.sin(flutterAngle) * radius
    ]
    trace(ctx, [crown, endpoint], clamp01(organic * 1.15 - ray * 0.022), {
      color: ray === 7 ? palette.accent : palette.muted,
      width: ray === 7 ? 1.05 : 0.72,
      opacity: ray === 7 ? 0.8 * accents : 0.62
    })
    dot(ctx, endpoint, (ray % 4 === 0 ? 1.9 : 1.25) * organic, ray === 7 ? palette.accent : palette.ink, 0.7)
  }
  dot(ctx, crown, 3.4 * organic, palette.ink, 0.92)

  const seeds = [
    { point: [426, 127] as Point, phase: 0.2, direction: -0.8, accent: true },
    { point: [458, 155] as Point, phase: 1.1, direction: -0.42, accent: false },
    { point: [441, 205] as Point, phase: 2.2, direction: 0.08, accent: false },
    { point: [486, 224] as Point, phase: 3.1, direction: 0.32, accent: true },
    { point: [414, 94] as Point, phase: 4.2, direction: -1.02, accent: false },
    { point: [505, 171] as Point, phase: 5.3, direction: -0.24, accent: false }
  ]
  seeds.forEach((seed, index) => {
    const driftX = Math.sin(angle + seed.phase) * (8 + index * 1.55)
      + Math.sin(angle * 2 + seed.phase * 0.7) * 2.4
    const driftY = Math.cos(angle + seed.phase) * (5 + index * 0.92)
      + Math.sin(angle * 2 + seed.phase) * 2.8
    const drifted: Point = [seed.point[0] + driftX, seed.point[1] + driftY]
    const direction = seed.direction + Math.sin(angle * 2 + seed.phase) * 0.12
    drawSeed(
      ctx,
      drifted,
      direction,
      0.8 + index * 0.035,
      clamp01(organic * 1.24 - index * 0.06),
      palette,
      seed.accent && accents > 0
    )
  })

  trace(ctx, bezier(
    [349, 345],
    [386 + sway * 0.18, 353],
    [427 + sway * 0.35, 336 + crownLift * 0.35],
    [452 + sway * 0.48, 353 + crownLift * 0.5],
    62
  ), organic, {
    color: palette.muted,
    width: 0.8,
    opacity: 0.58
  })
  trace(ctx, bezier(
    [394 + sway * 0.18, 348],
    [409 + sway * 0.3, 326],
    [431 + sway * 0.4, 327 + crownLift * 0.3],
    [435 + sway * 0.5, 311 + crownLift * 0.45],
    34
  ), organic, {
    color: palette.accent,
    width: 0.85,
    opacity: 0.65 * accents
  })

  if (progress > 0.72) {
    label(ctx, 'ORDER', [112, 112], palette.muted, 0.62 * structure)
    label(ctx, 'ΔS > 0', [451, 319], palette.accent, 0.74 * accents)
  }
}
function projectTesseract(vertex: Vector4, angle: number): Point {
  const [x, y, z, w] = vertex
  const cosXw = Math.cos(angle)
  const sinXw = Math.sin(angle)
  const cosYw = Math.cos(angle + 0.72)
  const sinYw = Math.sin(angle + 0.72)
  const xwX = x * cosXw - w * sinXw
  const xwW = x * sinXw + w * cosXw
  const ywY = y * cosYw - xwW * sinYw
  const ywW = y * sinYw + xwW * cosYw

  const fixedY = -0.56
  const fixedX = 0.43
  const cosY = Math.cos(fixedY)
  const sinY = Math.sin(fixedY)
  const cosX = Math.cos(fixedX)
  const sinX = Math.sin(fixedX)
  const rotatedX = xwX * cosY - z * sinY
  const rotatedZ = xwX * sinY + z * cosY
  const rotatedY = ywY * cosX - rotatedZ * sinX
  const depthZ = ywY * sinX + rotatedZ * cosX
  const fourDimensionalScale = 1.5 / (2.75 - ywW * 0.48)
  const perspective = 2.9 / (3.75 - depthZ * 0.34)

  return [
    358 + rotatedX * 72 * fourDimensionalScale * perspective,
    210 + rotatedY * 72 * fourDimensionalScale * perspective
  ]
}

function drawDimension(
  ctx: CanvasRenderingContext2D,
  progress: number,
  cycle: number,
  palette: IllustrationPalette
) {
  const angle = TAU * normalizeCycle(cycle)
  const projectionAngle = angle * 2
  const rayPulse = 0.34 + (1 - Math.cos(angle * 2)) * 0.075
  const framework = reveal(progress, 0.12, 0.42)
  const observer = reveal(progress, 0.25, 0.58)
  const projection = reveal(progress, 0.42, 0.86)
  const accents = reveal(progress, 0.82, 1)

  const eyeUpper = bezier([72, 210], [99, 178], [141, 178], [171, 210], 52)
  const eyeLower = bezier([72, 210], [99, 242], [141, 242], [171, 210], 52)
  trace(ctx, eyeUpper, observer, { color: palette.ink, width: 1.8, opacity: 0.94 })
  trace(ctx, eyeLower, observer, { color: palette.ink, width: 1.8, opacity: 0.94 })
  trace(ctx, ellipse(122, 210, 22, 31, 0, 0, TAU, 88), observer, {
    color: palette.muted,
    width: 1.05,
    opacity: 0.75,
    closed: true
  })
  const pupil: Point = [
    122 + Math.cos(angle) * 4.2,
    210 + Math.sin(angle * 2) * 2.6
  ]
  dot(ctx, pupil, 7.5 * observer, palette.ink, 0.92)
  dot(ctx, [pupil[0] - 3, pupil[1] - 5], 2 * observer, palette.accent, 0.84 * accents)

  const vertices: Vector4[] = Array.from({ length: 16 }, (_, index) => [
    index & 1 ? 1 : -1,
    index & 2 ? 1 : -1,
    index & 4 ? 1 : -1,
    index & 8 ? 1 : -1
  ] as Vector4)
  const projected = vertices.map(vertex => projectTesseract(vertex, projectionAngle))

  const bounds = projected.reduce((result, point) => ({
    left: Math.min(result.left, point[0]),
    top: Math.min(result.top, point[1]),
    right: Math.max(result.right, point[0]),
    bottom: Math.max(result.bottom, point[1])
  }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity })

  const vanishingPoint: Point = [122, 210]
  for (const corner of [
    [bounds.left, bounds.top],
    [bounds.left, bounds.bottom],
    [bounds.right, bounds.top],
    [bounds.right, bounds.bottom]
  ] as Point[]) {
    trace(ctx, [vanishingPoint, corner], framework, {
      color: palette.faint,
      width: 0.65,
      opacity: rayPulse,
      dash: [3, 7]
    })
  }
  trace(ctx, [[58, 294], [497, 294]], framework, {
    color: palette.faint,
    width: 0.6,
    opacity: 0.42
  })
  for (let mark = 0; mark < 11; mark += 1) {
    const x = 68 + mark * 42
    trace(ctx, [[x, 290], [x, mark % 5 === 0 ? 301 : 297]], framework, {
      color: palette.faint,
      width: 0.65,
      opacity: 0.48
    })
  }

  let edgeIndex = 0
  for (let from = 0; from < vertices.length; from += 1) {
    for (let dimension = 0; dimension < 4; dimension += 1) {
      const to = from ^ (1 << dimension)
      if (to <= from) continue
      const isFourthDimension = dimension === 3
      trace(ctx, [projected[from], projected[to]], clamp01(projection * 1.25 - edgeIndex * 0.018), {
        color: isFourthDimension ? palette.accent : palette.ink,
        width: isFourthDimension ? 1.2 : 1.05,
        opacity: isFourthDimension ? 0.72 * accents : 0.78
      })
      edgeIndex += 1
    }
  }

  projected.forEach((point, index) => {
    const isDimensionalAnchor = Boolean(index & 8)
    dot(ctx, point, (isDimensionalAnchor ? 2.3 : 1.5) * projection, isDimensionalAnchor ? palette.accent : palette.ink, isDimensionalAnchor ? 0.86 * accents : 0.72)
  })

  const tracerRatio = (1 - Math.cos(angle * 2)) / 2
  const tracerStart = projected[0]
  const tracerEnd = projected[8]
  const dimensionalTracer: Point = [
    tracerStart[0] + (tracerEnd[0] - tracerStart[0]) * tracerRatio,
    tracerStart[1] + (tracerEnd[1] - tracerStart[1]) * tracerRatio
  ]
  dot(ctx, dimensionalTracer, 3.15 * accents, palette.accent, 0.94)
  trace(ctx, [
    [dimensionalTracer[0] - 5, dimensionalTracer[1]],
    [dimensionalTracer[0] + 5, dimensionalTracer[1]]
  ], accents, { color: palette.accent, width: 0.68, opacity: 0.58 })

  trace(ctx, ellipse(358, 210, 133, 111, -0.15 + Math.sin(angle) * 0.08, 0, TAU, 128), framework, {
    color: palette.faint,
    width: 0.6,
    opacity: 0.35,
    dash: [2, 9],
    closed: true
  })
  if (progress > 0.72) {
    label(ctx, 'OBSERVER / O', [67, 258], palette.muted, 0.62 * observer)
    label(ctx, 'R⁴ → R³ → R²', [394, 332], palette.accent, 0.76 * accents)
  }
}

function logarithmicSpiral(center: Point, scale: number, rotation: number, turns = 4.8): Point[] {
  return sample(360, ratio => {
    const theta = ratio * turns * TAU
    const radius = 2.7 * Math.exp(0.118 * theta) * scale
    return [
      center[0] + Math.cos(theta + rotation) * radius,
      center[1] + Math.sin(theta + rotation) * radius
    ] as Point
  })
}

function drawConstant(
  ctx: CanvasRenderingContext2D,
  progress: number,
  cycle: number,
  palette: IllustrationPalette
) {
  const angle = TAU * normalizeCycle(cycle)
  const breath = 1 + (1 - Math.cos(angle)) * 0.0075
  const framework = reveal(progress, 0.12, 0.42)
  const shell = reveal(progress, 0.27, 0.68)
  const details = reveal(progress, 0.48, 0.88)
  const accents = reveal(progress, 0.82, 1)

  const fibonacciSquares = [
    [78, 91, 178],
    [256, 91, 110],
    [256, 201, 68],
    [324, 201, 42],
    [324, 243, 26],
    [350, 243, 16]
  ] as const
  fibonacciSquares.forEach(([x, y, size], index) => {
    trace(ctx, rectangle(x, y, size, size), clamp01(framework * 1.2 - index * 0.08), {
      color: palette.faint,
      width: index === 0 ? 0.72 : 0.58,
      opacity: 0.42,
      closed: true
    })
  })

  const shellOutline = join(
    bezier([392, 214], [378, 126], [304, 92], [218, 101], 52),
    bezier([218, 101], [131, 109], [88, 170], [100, 243], 52),
    bezier([100, 243], [113, 320], [206, 342], [292, 311], 56),
    bezier([292, 311], [346, 292], [383, 253], [392, 214], 44)
  ).map(point => [
    238 + (point[0] - 238) * breath,
    214 + (point[1] - 214) * breath
  ] as Point)
  trace(ctx, shellOutline, shell, {
    color: palette.ink,
    width: 2.05,
    opacity: 0.95,
    closed: true
  })

  const aperture = join(
    bezier([392, 214], [372, 202], [347, 196], [326, 198], 32),
    bezier([326, 198], [342, 226], [345, 266], [320, 292], 42)
  )
  trace(ctx, aperture, details, { color: palette.muted, width: 1.1, opacity: 0.74 })

  const spiralRotation = -0.48 + Math.sin(angle) * 0.055
  const spiral = logarithmicSpiral([218, 217], breath, spiralRotation)
  trace(ctx, spiral, shell, { color: palette.ink, width: 1.85, opacity: 0.92 })
  trace(ctx, logarithmicSpiral([218, 217], breath * 0.985, spiralRotation + 0.018), details, {
    color: palette.muted,
    width: 0.65,
    opacity: 0.48
  })

  const markerRatio = 0.16 + (1 - Math.cos(angle)) * 0.36
  const markerTheta = markerRatio * 4.8 * TAU
  const markerRadius = 2.7 * Math.exp(0.118 * markerTheta) * breath
  const spiralMarker: Point = [
    218 + Math.cos(markerTheta + spiralRotation) * markerRadius,
    217 + Math.sin(markerTheta + spiralRotation) * markerRadius
  ]
  trace(ctx, ellipse(spiralMarker[0], spiralMarker[1], 6.2, 6.2, 0, 0, TAU, 48), accents, {
    color: palette.accent,
    width: 0.85,
    opacity: 0.62,
    closed: true
  })
  dot(ctx, spiralMarker, 2.9 * accents, palette.accent, 0.96)
  trace(ctx, [
    [spiralMarker[0] - 8, spiralMarker[1]],
    [spiralMarker[0] + 8, spiralMarker[1]]
  ], accents, { color: palette.accent, width: 0.68, opacity: 0.5 })

  const chamberAngles = [0.36, 0.83, 1.31, 1.82, 2.36, 2.92, 3.5, 4.1]
  chamberAngles.forEach((theta, index) => {
    const innerRadius = 16 + index * 9.7
    const outerRadius = 57 + index * 8.4
    const rayAngle = theta - 0.62
    const start: Point = [218 + Math.cos(rayAngle) * innerRadius, 217 + Math.sin(rayAngle) * innerRadius]
    const end: Point = [218 + Math.cos(rayAngle) * outerRadius, 217 + Math.sin(rayAngle) * outerRadius * 0.78]
    trace(ctx, bezier(start, [start[0] + 9, start[1] - 3], [end[0] - 8, end[1] + 5], end, 28), clamp01(details * 1.2 - index * 0.06), {
      color: palette.muted,
      width: 0.78,
      opacity: 0.62
    })
  })

  for (let hatch = 0; hatch < 8; hatch += 1) {
    const start: Point = [121 + hatch * 12, 274 + hatch * 4]
    const end: Point = [139 + hatch * 13, 291 + hatch * 2]
    trace(ctx, [start, end], details, { color: palette.faint, width: 0.62, opacity: 0.48 })
  }

  const pivot: Point = [400, 117]
  const compassMotion = Math.sin(angle) * 0.075
  const leftFoot: Point = [400 + Math.cos(1.86 + compassMotion) * 174, 117 + Math.sin(1.86 + compassMotion) * 174]
  const rightFoot: Point = [400 + Math.cos(1.26 - compassMotion) * 174, 117 + Math.sin(1.26 - compassMotion) * 174]
  trace(ctx, [[pivot[0] - 8, pivot[1] + 7], [leftFoot[0], leftFoot[1]]], details, {
    color: palette.ink,
    width: 2.15,
    opacity: 0.9
  })
  trace(ctx, [[pivot[0] + 8, pivot[1] + 7], [rightFoot[0], rightFoot[1]]], details, {
    color: palette.ink,
    width: 2.15,
    opacity: 0.9
  })
  trace(ctx, [[leftFoot[0] - 3, leftFoot[1] - 12], leftFoot], details, { color: palette.ink, width: 1, opacity: 0.82 })
  trace(ctx, [[rightFoot[0] + 3, rightFoot[1] - 12], rightFoot], details, { color: palette.ink, width: 1, opacity: 0.82 })
  trace(ctx, ellipse(pivot[0], pivot[1], 13 + Math.sin(angle * 2) * 0.9, 13 + Math.sin(angle * 2) * 0.9, 0, 0, TAU, 72), details, {
    color: palette.accent,
    width: 1.45,
    opacity: 0.88 * accents,
    closed: true
  })
  dot(ctx, pivot, 3.2 * accents, palette.accent, 0.95)
  trace(ctx, ellipse(400, 117, 38, 38, 0, 0.82 + compassMotion * 0.8, 2.32 - compassMotion * 0.8, 42), accents, {
    color: palette.accent,
    width: 0.8,
    opacity: 0.65,
    dash: [2, 4]
  })

  if (progress > 0.72) {
    label(ctx, 'φ = 1.618033…', [371, 84], palette.accent, 0.8 * accents)
    label(ctx, 'NATURAL RATIO / PLATE VI', [80, 354], palette.muted, 0.6 * details)
  }
}

export function renderScientificIllustration(
  ctx: CanvasRenderingContext2D,
  state: IllustrationRenderState
) {
  const width = Math.max(1, state.width)
  const height = Math.max(1, state.height)
  const progress = clamp01(state.drawProgress)
  const cycle = normalizeCycle(state.cycle)

  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.restore()

  const scale = Math.min(width / ILLUSTRATION_WIDTH, height / ILLUSTRATION_HEIGHT)
  const offsetX = (width - ILLUSTRATION_WIDTH * scale) / 2
  const offsetY = (height - ILLUSTRATION_HEIGHT * scale) / 2
  ctx.save()
  ctx.translate(offsetX, offsetY)
  ctx.scale(scale, scale)
  survey(ctx, progress, state.palette)

  switch (state.theme) {
    case 'axiom':
      drawAxiom(ctx, progress, cycle, state.palette)
      break
    case 'singularity':
      drawSingularity(ctx, progress, cycle, state.palette)
      break
    case 'resonance':
      drawResonance(ctx, progress, cycle, state.palette)
      break
    case 'entropy':
      drawEntropy(ctx, progress, cycle, state.palette)
      break
    case 'dimension':
      drawDimension(ctx, progress, cycle, state.palette)
      break
    case 'constant':
      drawConstant(ctx, progress, cycle, state.palette)
      break
  }

  label(ctx, `// ${state.theme.toUpperCase()} / ENCYCLOPAEDIC PLATE`, [67, 72], state.palette.muted, 0.58 * reveal(progress, 0.72, 0.96))
  ctx.restore()
}