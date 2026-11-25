import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

const base = (size = 24, rest: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...rest,
})

export const KaabaIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M4 8.5 12 5l8 3.5V18l-8 2.5L4 18z" />
    <path d="M4 8.5 12 12l8-3.5M12 12v8.5" />
    <path d="M4 11.2l8 3.4 8-3.4" strokeWidth={2.2} className="text-gold-500" stroke="currentColor" />
  </svg>
)
export const FamilyIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <circle cx="8" cy="7" r="2.6" />
    <circle cx="16.5" cy="8.5" r="2.1" />
    <path d="M3.5 19c.4-3.4 2.2-5.4 4.5-5.4s4.1 2 4.5 5.4M13 19c.3-2.6 1.6-4.1 3.5-4.1S19.7 16.4 20 19" />
  </svg>
)
export const PassportIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <circle cx="12" cy="10" r="3.2" />
    <path d="M8.8 10h6.4M12 6.8c-1 1-1.5 2-1.5 3.2s.5 2.2 1.5 3.2c1-1 1.5-2 1.5-3.2s-.5-2.2-1.5-3.2M9 17h6" />
  </svg>
)
export const GlobeIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c-2.3 2.4-3.4 5.2-3.4 8.5s1.1 6.1 3.4 8.5c2.3-2.4 3.4-5.2 3.4-8.5S14.3 5.9 12 3.5" />
  </svg>
)
export const PlaneIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M10.5 13.5 4 11l1.4-1.4 7.1.6 4.3-4.3a1.9 1.9 0 0 1 2.7 2.7l-4.3 4.3.6 7.1L14.4 21l-2.5-6.5-3.4 3.3.3 2.2-1.3 1.3-1.5-3-3-1.5 1.3-1.3 2.2.3z" />
  </svg>
)
export const BusIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <rect x="4" y="3.5" width="16" height="14" rx="2.5" />
    <path d="M4 11h16M8 3.5v7.5M16 3.5v7.5M6.5 17.5V20M17.5 17.5V20" />
    <circle cx="8" cy="14.5" r=".6" fill="currentColor" />
    <circle cx="16" cy="14.5" r=".6" fill="currentColor" />
  </svg>
)
export const HotelIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M3.5 19.5V8.5M3.5 15h17v4.5M20.5 15v-2.5a3 3 0 0 0-3-3H11v5.5" />
    <circle cx="7.3" cy="12" r="1.8" />
  </svg>
)
export const ChatIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M4 5.5h16v10H9.5L5.5 19v-3.5H4z" />
    <path d="M8 9.5h8M8 12.3h5" />
  </svg>
)
export const TicketIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M3.5 7.5h17v3a1.8 1.8 0 0 0 0 3.5v3h-17v-3a1.8 1.8 0 0 0 0-3.5z" />
    <path d="M14.5 7.5v10" strokeDasharray="1.6 1.8" />
  </svg>
)
export const ChecklistIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V2.8h6V4M8.5 10l1.3 1.3 2.4-2.6M8.5 15.5l1.3 1.3 2.4-2.6M14 10.3h2M14 15.8h2" />
  </svg>
)
export const WhatsAppIcon = ({ size = 20, ...r }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...r}>
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.17-1.5A9.9 9.9 0 1 0 12.04 2m0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.07.89.9-2.99-.2-.31A8.2 8.2 0 1 1 12.04 20.1m4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.16 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.29" />
  </svg>
)
export const PhoneIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M6.6 3.5h2.6l1.4 4-1.9 1.3a10.6 10.6 0 0 0 6.5 6.5l1.3-1.9 4 1.4v2.6a2 2 0 0 1-2.1 2A15.6 15.6 0 0 1 4.6 5.6a2 2 0 0 1 2-2.1" />
  </svg>
)
export const InstagramIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.8" />
    <circle cx="17.2" cy="6.8" r=".7" fill="currentColor" />
  </svg>
)
export const FacebookIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H8.8v3h2.6V21" />
  </svg>
)
export const PinIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>
)
export const CheckIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="m5 12.5 4.2 4.2L19 7" />
  </svg>
)
export const ChevronIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)} className={`rtl:-scale-x-100 ${r.className ?? ''}`}>
    <path d="m9 5 7 7-7 7" />
  </svg>
)
export const MenuIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
)
export const CloseIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)
export const UploadIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M12 15.5V4.5M7.5 9 12 4.5 16.5 9M4.5 15v3.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15" />
  </svg>
)
export const FileIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" />
    <path d="M13.5 3.5V9H19" />
  </svg>
)
export const LockIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
)

export const SERVICE_ICON = {
  kaaba: KaabaIcon,
  family: FamilyIcon,
  passport: PassportIcon,
  globe: GlobeIcon,
  plane: PlaneIcon,
  bus: BusIcon,
  hotel: HotelIcon,
  chat: ChatIcon,
} as const

export const PILLAR_ICON = { passport: PassportIcon, chat: ChatIcon, ticket: TicketIcon, checklist: ChecklistIcon } as const

export function ServiceIcon({ name, size = 24, className }: { name?: string | null; size?: number; className?: string }) {
  const Cmp = SERVICE_ICON[(name ?? 'passport') as keyof typeof SERVICE_ICON] ?? PassportIcon
  return <Cmp size={size} className={className} />
}
