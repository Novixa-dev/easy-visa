'use client'
import { useRowLabel } from '@payloadcms/ui'

export function FieldRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string; name?: string; type?: string; required?: boolean }>()
  const n = (rowNumber ?? 0) + 1
  return (
    <span>
      {n}. {data?.label || data?.name || '—'}
      <span style={{ opacity: 0.6 }}>
        {' '}
        ({data?.type}
        {data?.required ? ', *' : ''})
      </span>
    </span>
  )
}
