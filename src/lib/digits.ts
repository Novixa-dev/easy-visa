/** Convert Arabic-Indic (٠-٩) and Persian (۰-۹) digits to ASCII digits. */
// Accepts a missing value (e.g. a phone not yet set in Settings on a fresh database) instead of throwing.
export function toLatinDigits(input: string | null | undefined): string {
  return String(input ?? '')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
}
