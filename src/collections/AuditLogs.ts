import type { CollectionConfig } from 'payload'
import { isOwner, nobody } from '@/access'
import { L } from '@/fields/common'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: { singular: L('سجل', 'Audit entry'), plural: L('سجل العمليات', 'Audit log') },
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['createdAt', 'user', 'action', 'collectionSlug', 'documentId', 'summary'],
    group: L('الإعدادات', 'Settings'),
  },
  defaultSort: '-createdAt',
  access: { read: ({ req }) => isOwner(req), create: nobody, update: nobody, delete: nobody },
  fields: [
    { name: 'action', type: 'text', required: true, index: true, label: L('العملية', 'Action') },
    { name: 'collectionSlug', type: 'text', index: true, label: L('القسم', 'Section') },
    { name: 'documentId', type: 'text', index: true, label: L('المعرف', 'Document') },
    { name: 'summary', type: 'text', label: L('التفاصيل', 'Details') },
    { name: 'user', type: 'relationship', relationTo: 'users', label: L('بواسطة', 'By') },
  ],
}
