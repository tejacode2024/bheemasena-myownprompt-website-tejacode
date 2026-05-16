import type { ReactNode } from 'react'

type Tone =
  | 'default' | 'pending' | 'placed' | 'cod' | 'prepaid'
  | 'paid' | 'unpaid' | 'new-badge' | 'archived'
  | 'online' | 'offline' | 'token'

export function Tag({ tone = 'default', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`tag-pill${tone === 'default' ? '' : ' ' + tone}`}>{children}</span>
}
