import type { CollectionAfterChangeHook } from 'payload'
import { siteUrl } from '@/lib/misc'

/** Emails the office when a new request arrives. Uses the configured email adapter. */
export const notifyNewRequest: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create' || req.context?.skipNotify) return doc
  try {
    const settings = await req.payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
    const to = [...(settings.notifyEmails ?? []).map((e) => e.email), process.env.ADMIN_NOTIFY_EMAIL]
      .filter((e): e is string => Boolean(e))
    if (!to.length) return doc
    const url = `${siteUrl()}/admin/collections/requests/${doc.id}`
    await req.payload.sendEmail({
      to,
      subject: `طلب جديد ${doc.reference} — New request`,
      html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.7">
        <p>وصل طلب جديد عبر ${doc.source === 'website' ? 'الموقع' : 'الإدخال اليدوي'}.</p>
        <p><strong>المرجع:</strong> ${doc.reference}<br/><strong>العميل:</strong> ${escapeHtml(doc.contactName)}</p>
        <p><a href="${url}">فتح الطلب في لوحة التحكم</a></p>
        <hr/><p dir="ltr">New request ${doc.reference}. <a href="${url}">Open in dashboard</a></p>
        <p style="color:#666;font-size:12px">لا تحتوي هذه الرسالة على مستندات العميل لأسباب أمنية.</p></div>`,
    })
  } catch (err) {
    req.payload.logger.error({ err, msg: 'new request email failed' })
  }
  return doc
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
