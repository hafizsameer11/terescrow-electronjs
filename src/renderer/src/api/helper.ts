import { API_BASE_URL } from './config'

export const getImageUrl = (imageName: any): string => {
  if (imageName == null || imageName == undefined || imageName == '')
    return `${API_BASE_URL}/uploads/userProfile.jpg`
  return `${API_BASE_URL}/uploads/${imageName}`
}

export function addThousandSeparator(value: any): string {
  if (value == null || value === '') {
    // Return '0' or an empty string for null or undefined values
    return '0'
  }

  if (isNaN(value)) {
    // Ensure the input is a number or numeric string
    console.warn('Invalid input:', value)
    return 'Invalid' // Optionally return a fallback value
  }

  // Convert the value to a float and format with thousand separators
  return parseFloat(value).toLocaleString('en-US')
}
