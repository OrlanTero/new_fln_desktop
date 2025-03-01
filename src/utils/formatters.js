/**
 * Utility functions for formatting values
 */

/**
 * Format a number as currency
 * @param {number} value - The value to format
 * @param {string} locale - The locale to use (default: 'en-PH')
 * @param {string} currency - The currency to use (default: 'PHP')
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (value, locale = 'en-PH', currency = 'PHP') => {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format a date string
 * @param {string|Date} date - The date to format
 * @param {object} options - The Intl.DateTimeFormat options
 * @param {string} locale - The locale to use (default: 'en-US')
 * @returns {string} The formatted date string
 */
export const formatDate = (date, options = {}, locale = 'en-US') => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
};

/**
 * Format a date and time string
 * @param {string|Date} date - The date to format
 * @param {string} locale - The locale to use (default: 'en-US')
 * @returns {string} The formatted date and time string
 */
export const formatDateTime = (date, locale = 'en-US') => {
  if (!date) return '';
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return formatDate(date, options, locale);
};

/**
 * Format a percentage
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - The number of decimal places (default: 1)
 * @returns {string} The formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '';
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a number with thousand separators
 * @param {number} value - The value to format
 * @param {number} decimals - The number of decimal places (default: 0)
 * @param {string} locale - The locale to use (default: 'en-US')
 * @returns {string} The formatted number string
 */
export const formatNumber = (value, decimals = 0, locale = 'en-US') => {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Truncate a string if it exceeds the maximum length
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length (default: 50)
 * @param {string} suffix - The suffix to add if truncated (default: '...')
 * @returns {string} The truncated string
 */
export const truncateString = (str, maxLength = 50, suffix = '...') => {
  if (!str) return '';
  
  if (str.length <= maxLength) return str;
  
  return `${str.substring(0, maxLength)}${suffix}`;
};

/**
 * Format a phone number
 * @param {string} phone - The phone number to format
 * @returns {string} The formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
  } else if (cleaned.length === 11) {
    return `+${cleaned.substring(0, 1)} (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 11)}`;
  }
  
  // If not a standard format, return the original
  return phone;
};

/**
 * Capitalize the first letter of each word in a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format a file size
 * @param {number} bytes - The file size in bytes
 * @param {number} decimals - The number of decimal places (default: 2)
 * @returns {string} The formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format a duration in seconds to a human-readable string
 * @param {number} seconds - The duration in seconds
 * @returns {string} The formatted duration
 */
export const formatDuration = (seconds) => {
  if (!seconds) return '';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}; 