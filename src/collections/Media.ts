import path from 'node:path'
import type { CollectionConfig } from 'payload'
import { anyone, isOwner, staffOnly } from '@/access'
import { L } from '@/fields/common'

/** Public images for services, offers and pages. Never use this for customer documents. */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: L('صورة', 'Image'), plural: L('الصور', 'Images') },
  admin: { group: L('المحتوى', 'Content') },
  access: {
    read: anyone,
    create: staffOnly,
    update: staffOnly,
    delete: ({ req }) => isOwner(req),
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
    formatOptions: { format: 'webp', options: { quality: 82 } },
    resizeOptions: { width: 2000, withoutEnlargement: true },
    imageSizes: [
      { name: 'thumb', width: 480, formatOptions: { format: 'webp', options: { quality: 75 } } },
      { name: 'card', width: 960, formatOptions: { format: 'webp', options: { quality: 78 } } },
    ],
    focalPoint: true,
  },
  fields: [
    { name: 'alt', type: 'text', required: true, localized: true, label: L('وصف الصورة', 'Alt text') },
  ],
}
