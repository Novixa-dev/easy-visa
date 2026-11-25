import type { Endpoint, Where } from 'payload'
import { STATUS_LABELS, type RequestStatus } from '@/lib/constants'

/** Quote a CSV cell and neutralise spreadsheet formulas (CSV injection). */
export function csvCell(v: unknown): string {
  let s = v == null ? '' : String(v)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export const toCsv = (rows: unknown[][]) => '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n')

/** GET /api/requests/export?type=requests|payments|customers&from=YYYY-MM-DD (owner only). */
export const exportEndpoint: Endpoint = {
  path: '/export',
  method: 'get',
  handler: async (req) => {
    const user = req.user as { role?: string; collection?: string } | null
    if (!user || user.collection !== 'users' || user.role !== 'owner') return Response.json({ error: 'forbidden' }, { status: 403 })
    const url = new URL(req.url ?? '', 'http://x')
    const type = url.searchParams.get('type') ?? 'requests'
    const from = url.searchParams.get('from')
    const since: Where = from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? { createdAt: { greater_than_equal: `${from}T00:00:00.000Z` } } : {}
    const { payload } = req
    let rows: unknown[][] = []

    if (type === 'requests') {
      const res = await payload.find({ collection: 'requests', where: since, sort: '-createdAt', limit: 10000, depth: 1, locale: 'ar', overrideAccess: true })
      rows = [['المرجع', 'التاريخ', 'العميل', 'الهاتف', 'الخدمة / الرحلة', 'المقاعد', 'الحالة', 'المصدر', 'تاريخ السفر', 'المبلغ', 'العملة', 'المدفوع', 'حالة الدفع', 'الموظف']]
      for (const r of res.docs)
        rows.push([
          r.reference,
          r.createdAt.slice(0, 16).replace('T', ' '),
          r.contactName,
          r.phone,
          typeof r.trip === 'object' && r.trip ? r.trip.title : typeof r.service === 'object' && r.service ? r.service.title : '',
          r.seats ?? '',
          STATUS_LABELS[r.status as RequestStatus]?.ar ?? r.status,
          r.source,
          r.travelDate?.slice(0, 10) ?? '',
          r.invoice?.amount ?? '',
          r.invoice?.currency ?? '',
          r.paidAmount ?? 0,
          r.paymentStatus ?? '',
          typeof r.assignedTo === 'object' && r.assignedTo ? r.assignedTo.name : '',
        ])
    } else if (type === 'payments') {
      const res = await payload.find({ collection: 'payments', where: since, sort: '-createdAt', limit: 10000, depth: 1, overrideAccess: true })
      rows = [['مرجع الدفعة', 'التاريخ', 'مرجع الطلب', 'المبلغ', 'العملة', 'الطريقة', 'الحالة', 'المحوِّل', 'رقم العملية', 'إلى حساب', 'أكدها']]
      for (const p of res.docs)
        rows.push([
          p.reference,
          p.createdAt.slice(0, 16).replace('T', ' '),
          typeof p.request === 'object' && p.request ? p.request.reference : '',
          p.amount,
          p.currency,
          p.method,
          p.status,
          p.payerName ?? '',
          p.transferReference ?? '',
          p.toAccount ?? '',
          typeof p.reviewedBy === 'object' && p.reviewedBy ? p.reviewedBy.name : '',
        ])
    } else if (type === 'customers') {
      const res = await payload.find({ collection: 'customers', sort: '-createdAt', limit: 20000, depth: 0, overrideAccess: true })
      rows = [['الاسم', 'الهاتف', 'واتساب', 'اللغة', 'أول تواصل']]
      for (const c of res.docs) rows.push([c.fullName, c.phone, c.whatsapp ?? '', c.preferredLocale ?? '', c.createdAt.slice(0, 10)])
    } else return Response.json({ error: 'unknown type' }, { status: 400 })

    await payload.create({
      collection: 'audit-logs',
      data: { action: 'export', collectionSlug: type, summary: `${rows.length - 1} rows`, user: (user as unknown as { id: number }).id },
      overrideAccess: true,
      context: { skipAudit: true },
    })

    return new Response(toCsv(rows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="easy-visa-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'private, no-store',
      },
    })
  },
}
