import type { Access, FieldAccess, PayloadRequest } from 'payload'

export type Role = 'owner' | 'staff'

const roleOf = (req: PayloadRequest): Role | null => {
  const u = req.user as { role?: Role; collection?: string } | null
  if (!u || u.collection !== 'users') return null
  return u.role ?? 'staff'
}

export const isOwner = (req: PayloadRequest) => roleOf(req) === 'owner'
export const isStaff = (req: PayloadRequest) => roleOf(req) !== null

/** Any signed-in team member. */
export const staffOnly: Access = ({ req }) => isStaff(req)
/** Owner / super admin. */
export const ownerOnly: Access = ({ req }) => isOwner(req)
/** Public can read published docs; staff can read everything. */
export const publishedOrStaff: Access = ({ req }) =>
  isStaff(req) ? true : { status: { equals: 'published' } }
export const anyone: Access = () => true
export const nobody: Access = () => false

export const ownerField: FieldAccess = ({ req }) => isOwner(req)
export const staffField: FieldAccess = ({ req }) => isStaff(req)
