import path from 'node:path'
import type { CollectionConfig } from 'payload'
import { isOwner, staffOnly } from '@/access'
import { L } from '@/fields/common'
import { DOCUMENT_MIME_TYPES } from '@/lib/constants'
import { audited } from '@/hooks/audit'

/**
 * Customer identity / travel documents. Stored OUTSIDE the public folder and
 * served only through Payload's access-controlled file route.
 * In production, switch to a private S3-compatible bucket (see docs/DEPLOYMENT.md).
 */
export const RequestDocuments: CollectionConfig = {
  slug: 'request-documents',
  labels: { singular: L('مستند', 'Document'), plural: L('مستندات العملاء', 'Customer documents') },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'request', 'slot', 'mimeType', 'filesize', 'createdAt'],
    group: L('العمليات', 'Operations'),
    description: L('مستندات سرية. لا تشاركها خارج النظام.', 'Confidential. Do not share outside the system.'),
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: ({ req }) => isOwner(req),
  },
  hooks: audited,
  upload: {
    staticDir: path.resolve(process.cwd(), 'private-uploads'),
    mimeTypes: DOCUMENT_MIME_TYPES,
    disableLocalStorage: false,
    // No resized copies: keep the original only, never generate public variants.
    imageSizes: [],
    adminThumbnail: () => false as unknown as string,
    filesRequiredOnCreate: true,
  },
  fields: [
    { name: 'request', type: 'relationship', relationTo: 'requests', index: true, label: L('الطلب', 'Request') },
    { name: 'slot', type: 'text', label: L('نوع المستند', 'Document type') },
    { name: 'slotLabel', type: 'text', label: L('اسم المستند', 'Document name') },
    { name: 'originalName', type: 'text', label: L('اسم الملف الأصلي', 'Original filename'), admin: { readOnly: true } },
  ],
}
