/* Lightweight, dependency-free SVG charts for the dashboard (server-rendered). */

const NAVY = '#16357a'
const GOLD = '#cf9a2c'

type Point = { day: string; [k: string]: number | string }

export function AreaChart({
  data,
  keys,
  labels,
  lang,
  height = 220,
}: {
  data: Point[]
  keys: [string, string?]
  labels: [string, string?]
  lang: 'ar' | 'en'
  height?: number
}) {
  const W = 720
  const H = height
  const pad = { t: 16, r: keys[1] ? 34 : 12, b: 28, l: 34 }
  // Each series gets its own scale (left axis navy, right axis gold), so a small
  // series such as requests stays readable next to visits.
  const niceMax = (k?: string) => {
    if (!k) return 4
    const m = Math.max(1, ...data.map((d) => Number(d[k]) || 0))
    return Math.ceil(m / 4) * 4 || 4
  }
  const nice = niceMax(keys[0])
  const nice2 = niceMax(keys[1])
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, data.length - 1)
  const y = (v: number, scale = nice) => H - pad.b - (v / scale) * (H - pad.t - pad.b)
  const line = (k: string, scale = nice) => data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(Number(d[k]) || 0, scale).toFixed(1)}`).join(' ')
  const area = (k: string) => `${line(k)} L${x(data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`
  const ticks = [0, nice / 4, nice / 2, (3 * nice) / 4, nice]
  const every = Math.max(1, Math.ceil(data.length / 8))
  const fmt = (day: string) =>
    new Intl.DateTimeFormat(lang === 'ar' ? 'ar-YE-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(day + 'T00:00:00Z'))
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={labels.filter(Boolean).join(' / ')} style={{ display: 'block', direction: 'ltr' }}>
        <defs>
          <linearGradient id="ev-a0" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={NAVY} stopOpacity="0.22" />
            <stop offset="100%" stopColor={NAVY} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity="0.08" />
            <text x={pad.l - 6} y={y(t) + 4} fontSize="11" textAnchor="end" fill={NAVY} fillOpacity="0.7">
              {Math.round(t)}
            </text>
            {keys[1] && (
              <text x={W - pad.r + 6} y={y(t) + 4} fontSize="11" textAnchor="start" fill={GOLD}>
                {Math.round((t / nice) * nice2)}
              </text>
            )}
          </g>
        ))}
        <path d={area(keys[0])} fill="url(#ev-a0)" />
        <path d={line(keys[0])} fill="none" stroke={NAVY} strokeWidth="2.2" strokeLinejoin="round" />
        {keys[1] && <path d={line(keys[1], nice2)} fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinejoin="round" />}
        {keys[1] &&
          data.map((d, i) =>
            Number(d[keys[1]!]) > 0 ? <circle key={i} cx={x(i)} cy={y(Number(d[keys[1]!]), nice2)} r="3" fill={GOLD} /> : null,
          )}
        {data.map((d, i) =>
          (i % every === 0 && data.length - 1 - i >= every * 0.6) || i === data.length - 1 ? (
            <text key={d.day} x={x(i)} y={H - 8} fontSize="11" textAnchor="middle" fill="currentColor" fillOpacity="0.55">
              {fmt(String(d.day))}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption style={{ display: 'flex', gap: 16, fontSize: 12, marginTop: 6, opacity: 0.8 }}>
        <Legend color={NAVY} label={labels[0]} />
        {labels[1] && <Legend color={GOLD} label={labels[1]} />}
      </figcaption>
    </figure>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
      {label}
    </span>
  )
}

export function BarList({ items, format, empty, color = GOLD }: { items: { key: string; value: number; label?: string; href?: string }[]; format?: (k: string) => string; empty: string; color?: string }) {
  if (!items.length) return <p style={{ opacity: 0.6, margin: 0 }}>{empty}</p>
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
      {items.map((i) => {
        const content = (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13.5 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} dir="auto">
                {i.label ?? (format ? format(i.key) : i.key)}
              </span>
              <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{i.value.toLocaleString('en')}</strong>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: 'var(--theme-elevation-100)', marginTop: 5 }}>
              <div style={{ height: 6, borderRadius: 4, width: `${Math.max(2, (i.value / max) * 100)}%`, background: color }} />
            </div>
          </>
        )
        return (
          <li key={i.key}>
            {i.href ? (
              <a href={i.href} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                {content}
              </a>
            ) : (
              content
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Segmented horizontal bar, used for shares such as devices or languages. */
export function ShareBar({ items, colors, format }: { items: { key: string; value: number }[]; colors: string[]; format: (k: string) => string }) {
  const total = items.reduce((a, i) => a + i.value, 0) || 1
  return (
    <div>
      <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', background: 'var(--theme-elevation-100)' }}>
        {items.map((i, idx) => (
          <div key={i.key} title={`${format(i.key)} ${Math.round((i.value / total) * 100)}%`} style={{ width: `${(i.value / total) * 100}%`, background: colors[idx % colors.length] }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10, fontSize: 13 }}>
        {items.map((i, idx) => (
          <span key={i.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: colors[idx % colors.length] }} />
            {format(i.key)} <strong>{Math.round((i.value / total) * 100)}%</strong>
          </span>
        ))}
      </div>
    </div>
  )
}

export function Sparkline({ values, color = NAVY }: { values: number[]; color?: string }) {
  const W = 120
  const H = 32
  const max = Math.max(1, ...values)
  const pts = values.map((v, i) => `${((i * W) / Math.max(1, values.length - 1)).toFixed(1)},${(H - 2 - (v / max) * (H - 4)).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden style={{ display: 'block', direction: 'ltr' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
