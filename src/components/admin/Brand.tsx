/* eslint-disable @next/next/no-img-element */
export function AdminLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <img className="ev-logo ev-logo--light-theme" src="/brand/logo-full.webp" alt="Easy Visa" width={220} height={183} style={{ width: 220, height: 'auto' }} />
      <img className="ev-logo ev-logo--dark-theme" src="/brand/logo-full-light.webp" alt="Easy Visa" width={220} height={183} style={{ width: 220, height: 'auto' }} />
      <span style={{ fontSize: 13, opacity: 0.7 }}>لوحة إدارة Easy Visa · Easy Visa dashboard</span>
      <style>{`.ev-logo--dark-theme{display:none}html[data-theme=dark] .ev-logo--dark-theme{display:block}html[data-theme=dark] .ev-logo--light-theme{display:none}`}</style>
    </div>
  )
}

export function AdminIcon() {
  // The sidebar is navy in both themes, so the light mark is always used there.
  return <img src="/brand/logo-mark-light.png" alt="Easy Visa" width={34} height={26} style={{ width: 34, height: 'auto' }} />
}
