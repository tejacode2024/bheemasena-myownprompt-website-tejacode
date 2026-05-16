import { SITE } from '../data/site'

export function openZomato(): void {
  window.open(SITE.zomatoUrl, '_blank', 'noopener,noreferrer')
}
