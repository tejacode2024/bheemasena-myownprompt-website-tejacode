import type { MenuTag } from '../../data/menu'

type Props = { tag?: MenuTag }

export function Tag({ tag }: Props) {
  if (!tag) return null
  const cls = `tag-pill ${tag.toLowerCase()}`
  return <span className={cls}>{tag}</span>
}
