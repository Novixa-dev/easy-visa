import type { CollectionConfig } from 'payload'
import { isOwner, ownerField } from '@/access'
import { L } from '@/fields/common'
import { audited } from '@/hooks/audit'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: L('مستخدم', 'Team member'), plural: L('فريق العمل', 'Team') },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'active'],
    group: L('الإعدادات', 'Settings'),
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 60 * 60 * 8,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  access: {
    read: ({ req }) => (isOwner(req) ? true : req.user ? { id: { equals: req.user.id } } : false),
    create: ({ req }) => isOwner(req),
    update: ({ req }) => (isOwner(req) ? true : req.user ? { id: { equals: req.user.id } } : false),
    delete: ({ req }) => isOwner(req),
    admin: ({ req }) => Boolean(req.user && (req.user as { active?: boolean }).active !== false),
  },
  hooks: {
    ...audited,
    beforeChange: [
      // The very first account on a fresh install must be able to manage everything.
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true, req })
          if (totalDocs === 0) {
            data.role = 'owner'
            data.active = true
          }
        }
        return data
      },
    ],
    beforeLogin: [
      ({ user }) => {
        if (user?.active === false) throw new Error('This account is disabled.')
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: L('الاسم', 'Name') },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      saveToJWT: true,
      label: L('الدور', 'Role'),
      access: { update: ownerField, create: ownerField },
      options: [
        { label: L('المالك (صلاحيات كاملة)', 'Owner (full access)'), value: 'owner' },
        { label: L('موظف (الطلبات والعملاء)', 'Staff (requests & customers)'), value: 'staff' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: L('الحساب مفعّل', 'Account active'),
      access: { update: ownerField, create: ownerField },
      admin: { position: 'sidebar' },
    },
  ],
}
