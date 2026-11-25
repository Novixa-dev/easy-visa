/** A value given in both languages. */
export type Bi = { ar: string; en: string }
export const bi = (ar: string, en: string): Bi => ({ ar, en })

const isBi = (v: unknown): v is Bi =>
  !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).sort().join() === 'ar,en'

/** Resolve every {ar, en} leaf to one language. */
export function pick<T>(value: T, lang: 'ar' | 'en'): unknown {
  if (isBi(value)) return value[lang]
  if (Array.isArray(value)) return value.map((v) => pick(v, lang))
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    if ((value as { root?: unknown }).root) return value // lexical JSON
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, pick(v, lang)]))
  }
  return value
}

/** Copy array row ids from a saved doc onto new data so a second-locale update keeps the same rows. */
export function withIds(data: unknown, saved: unknown): unknown {
  if (Array.isArray(data) && Array.isArray(saved))
    return data.map((row, i) => {
      const s = saved[i] as Record<string, unknown> | undefined
      const merged = withIds(row, s)
      return s?.id && merged && typeof merged === 'object' ? { ...(merged as object), id: s.id } : merged
    })
  if (data && typeof data === 'object' && saved && typeof saved === 'object' && !(data as { root?: unknown }).root)
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, withIds(v, (saved as Record<string, unknown>)[k])]))
  return data
}

/** Minimal Lexical rich text from simple blocks. */
type Block = { h?: string; p?: string; ul?: string[] }
const text = (t: string) => ({ type: 'text', text: t, format: 0, detail: 0, mode: 'normal', style: '', version: 1 })
export function rich(blocks: Block[]) {
  const children = blocks.map((b) => {
    if (b.h) return { type: 'heading', tag: 'h2', children: [text(b.h)], direction: null, format: '', indent: 0, version: 1 }
    if (b.ul)
      return {
        type: 'list',
        listType: 'bullet',
        tag: 'ul',
        start: 1,
        children: b.ul.map((li, i) => ({ type: 'listitem', value: i + 1, children: [text(li)], direction: null, format: '', indent: 0, version: 1 })),
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      }
    return { type: 'paragraph', children: [text(b.p ?? '')], direction: null, format: '', indent: 0, textFormat: 0, version: 1 }
  })
  return { root: { type: 'root', children, direction: null, format: '', indent: 0, version: 1 } }
}
export const richBi = (ar: Block[], en: Block[]) => ({ ar: rich(ar), en: rich(en) })
