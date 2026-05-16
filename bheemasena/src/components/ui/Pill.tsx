import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  onDark?: boolean
  children: ReactNode
}

export function Pill({ variant = 'primary', onDark, children, className, ...rest }: Props) {
  const classes = [
    'pill-btn',
    `pill-${variant}`,
    onDark ? 'on-dark' : '',
    className ?? '',
  ].join(' ').trim()
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}
