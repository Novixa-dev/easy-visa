/**
 * Payload admin pages contain authenticated, frequently-changing customer
 * data. Keep their server shell dynamic; the Payload React application still
 * hydrates and navigates on the client, while browser-cached static bundles
 * keep subsequent visits fast.
 */
export const dynamic = 'force-dynamic'

export default function PayloadLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
