import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/** Refresh public pages right after the owner edits content in the dashboard. */
async function refresh() {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    // Outside a Next.js request (e.g. seed script): nothing to revalidate.
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc }) => {
  await refresh()
  return doc
}
export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await refresh()
  return doc
}
export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc }) => {
  await refresh()
  return doc
}
