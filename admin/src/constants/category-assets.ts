export const CATEGORY_ASSET_OPTIONS = [
  { slug: 'birthday', label: 'Birthday', path: '/assets/categories/transparent-birthday-icon.png' },
  { slug: 'wedding', label: 'Wedding', path: '/assets/categories/transparent-wedding-icon.png' },
  { slug: 'party', label: 'Party', path: '/assets/categories/transparent-party-icon.png' },
  { slug: 'seminar', label: 'Seminar', path: '/assets/categories/transparent-seminar-icon.png' },
  { slug: 'meeting', label: 'Meeting', path: '/assets/categories/transparent-meeting-icon.png' },
  { slug: 'reunion', label: 'Reunion', path: '/assets/categories/transparent-reunion-icon.png' },
  { slug: 'funeral', label: 'Funeral', path: '/assets/categories/transparent-funeral-icon.png' },
] as const

export const BRAND_LOGO = '/assets/brand/invyte-logo.png'
export const BRAND_ICON = '/icon.png'

export function categoryImageSrc(image?: string | null) {
  if (!image) return null
  if (image.startsWith('http') || image.startsWith('/')) return image
  return `/assets/categories/${image}`
}
