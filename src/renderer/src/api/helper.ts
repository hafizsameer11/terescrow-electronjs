import { API_BASE_URL } from './config'

export const getImageUrl = (imageName: any): string => {
  if (imageName == null || imageName == undefined || imageName == '')
    return `${API_BASE_URL}/uploads/userProfile.jpg`
  return `${API_BASE_URL}/uploads/${imageName}`
}

export function addThousandSeparator(value: any): string {
  if (value == null || value === '') {
    return '0'
  }
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '').trim())
  if (Number.isNaN(n)) {
    console.warn('Invalid input:', value)
    return 'Invalid'
  }
  return n.toLocaleString('en-US')
}

/**
 * Formats values shown as Naira/NGN (with ₦ or N prefix applied by the caller).
 * Strips commas, ₦, spaces, and leading N; handles numeric strings from APIs.
 */
export function formatNairaAmount(value: string | number | null | undefined): string {
  if (value == null || value === '') return '0'
  const s0 = String(value).trim()
  if (s0 === '—' || s0 === '-') return '—'
  const cleaned = s0.replace(/,/g, '').replace(/[₦\s]/g, '').replace(/^N/i, '')
  if (cleaned === '') return '0'
  const n = parseFloat(cleaned)
  if (Number.isNaN(n)) return s0
  return Math.round(n).toLocaleString('en-US')
}
