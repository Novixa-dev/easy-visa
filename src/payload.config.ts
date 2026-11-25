import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { ar } from '@payloadcms/translations/languages/ar'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig, type CollectionConfig, type GlobalConfig } from 'payload'
import { revalidateAfterChange, revalidateAfterDelete, revalidateGlobal } from './hooks/revalidate'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { AuditLogs } from './collections/AuditLogs'
import { Customers } from './collections/Customers'
import { Destinations } from './collections/Destinations'
import { Faqs } from './collections/Faqs'
import { Media } from './collections/Media'
import { Offers } from './collections/Offers'
import { RequestDocuments } from './collections/RequestDocuments'
import { Requests } from './collections/Requests'
import { ServiceCategories } from './collections/ServiceCategories'
import { Services } from './collections/Services'
import { Users } from './collections/Users'
import { Companies } from './collections/Companies'
import { ContactMessages } from './collections/ContactMessages'
import { PageViews } from './collections/PageViews'
import { Payments } from './collections/Payments'
import { Trips } from './collections/Trips'
import { AboutPage, Homepage, LegalPages, SiteSettings } from './globals'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const smtpConfigured = Boolean(process.env.SMTP_HOST)

/** Public content: refresh cached pages whenever it changes. */
const live = <T extends CollectionConfig>(c: T): T => ({
  ...c,
  hooks: {
    ...c.hooks,
    afterChange: [...(c.hooks?.afterChange ?? []), revalidateAfterChange],
    afterDelete: [...(c.hooks?.afterDelete ?? []), revalidateAfterDelete],
  },
})
const liveGlobal = <T extends GlobalConfig>(g: T): T => ({
  ...g,
  hooks: { ...g.hooks, afterChange: [...(g.hooks?.afterChange ?? []), revalidateGlobal] },
})

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' · Easy Visa',
      icons: [{ rel: 'icon', type: 'image/png', url: '/brand/icon-192.png' }],
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Brand#AdminLogo',
        Icon: '@/components/admin/Brand#AdminIcon',
      },
      beforeDashboard: ['@/components/admin/Dashboard#Dashboard'],
      beforeNavLinks: ['@/components/admin/NavLinks#NavLinks'],
      views: {
        reports: { Component: '@/components/admin/Reports#Reports', path: '/reports', meta: { title: 'التقارير · Reports' } },
      },
    },
    dateFormat: 'd MMM yyyy, HH:mm',
  },
  i18n: {
    supportedLanguages: { ar, en },
    fallbackLanguage: 'ar',
  },
  localization: {
    locales: [
      { label: 'العربية', code: 'ar', rtl: true },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'ar',
    fallback: true,
  },
  collections: [
    Requests,
    Payments,
    ContactMessages,
    Customers,
    RequestDocuments,
    live(Trips),
    live(Companies),
    PageViews,
    live(Services),
    live(ServiceCategories),
    live(Destinations),
    live(Offers),
    live(Faqs),
    live(Media),
    Users,
    AuditLogs,
  ],
  globals: [SiteSettings, Homepage, AboutPage, LegalPages].map(liveGlobal),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // Dev: auto-sync schema. Production: run `payload migrate` (see docs/DEPLOYMENT.md).
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
    // Applied automatically on production start-up.
    prodMigrations: migrations,
  }),
  email: smtpConfigured
    ? nodemailerAdapter({
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'no-reply@easyvisa.example',
        defaultFromName: process.env.EMAIL_FROM_NAME || 'Easy Visa',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  upload: { limits: { fileSize: 10 * 1024 * 1024 } },
  sharp,
  graphQL: { disable: true },
  plugins: [],
})
