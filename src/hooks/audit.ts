import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Writes an entry to `audit-logs` for every create / update / delete made by a
 * signed-in team member. Public submissions are logged as "system".
 */
export const auditAfterChange: CollectionAfterChangeHook = async ({ doc, operation, req, collection, previousDoc }) => {
  if (req.context?.skipAudit) return doc
  try {
    const changed =
      operation === 'update' && previousDoc
        ? Object.keys(doc).filter(
            (k) => !['updatedAt', 'createdAt'].includes(k) && JSON.stringify(doc[k]) !== JSON.stringify(previousDoc[k]),
          )
        : []
    await req.payload.create({
      collection: 'audit-logs',
      data: {
        action: operation,
        collectionSlug: collection.slug,
        documentId: String(doc.id),
        summary: changed.length ? `Changed: ${changed.slice(0, 12).join(', ')}` : undefined,
        user: req.user && req.user.collection === 'users' ? req.user.id : undefined,
      },
      req,
      overrideAccess: true,
      context: { skipAudit: true },
    })
  } catch (e) {
    req.payload.logger.error({ err: e, msg: 'audit log failed' })
  }
  return doc
}

export const auditAfterDelete: CollectionAfterDeleteHook = async ({ doc, req, collection }) => {
  try {
    await req.payload.create({
      collection: 'audit-logs',
      data: {
        action: 'delete',
        collectionSlug: collection.slug,
        documentId: String(doc.id),
        user: req.user && req.user.collection === 'users' ? req.user.id : undefined,
      },
      req,
      overrideAccess: true,
      context: { skipAudit: true },
    })
  } catch (e) {
    req.payload.logger.error({ err: e, msg: 'audit log failed' })
  }
  return doc
}

export const audited = {
  afterChange: [auditAfterChange],
  afterDelete: [auditAfterDelete],
}
