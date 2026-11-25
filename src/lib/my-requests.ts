/** Guest "My requests": references kept only in this browser (no account). */
export type SavedRequest = { reference: string; last4: string; title: string; at: string }

const KEY = 'ev-my-requests'

export function loadMyRequests(): SavedRequest[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v.filter((x) => x && typeof x.reference === 'string' && /^\d{4}$/.test(x.last4)) : []
  } catch {
    return []
  }
}

export function saveMyRequest(item: SavedRequest) {
  try {
    const list = loadMyRequests().filter((x) => x.reference !== item.reference)
    list.unshift(item)
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)))
  } catch {}
}

export function removeMyRequest(reference: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(loadMyRequests().filter((x) => x.reference !== reference)))
  } catch {}
}
