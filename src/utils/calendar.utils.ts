import type { ScheduledPost } from '../types/calendar.types';

/**
 * Get the number of days in a specific month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get the first day of the month (0 = Sunday, 6 = Saturday)
 */
export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

/**
 * Get the day name in Spanish
 */
export const getDayName = (dayOfWeek: number): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayOfWeek] || '';
};

/**
 * Get short day name in Spanish
 */
export const getShortDayName = (dayOfWeek: number): string => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[dayOfWeek] || '';
};

/**
 * Format hour as HH:00
 */
export const formatTime = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

/**
 * Check if a date is in the past
 */
export const isDateInPast = (date: string | Date): boolean => {
  return new Date(date) < new Date();
};

/**
 * Format date for input[type="date"] (YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format datetime for input[type="datetime-local"] (YYYY-MM-DDTHH:MM)
 */
export const formatDateTimeForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Get posts scheduled for a specific date
 */
export const getPostsByDate = (posts: ScheduledPost[], date: Date): ScheduledPost[] => {
  const dateStr = formatDateForInput(date);
  return posts.filter((post) => {
    const postDate = formatDateForInput(new Date(post.scheduledDate));
    return postDate === dateStr;
  });
};

/**
 * Format date to readable Spanish format
 */
export const formatDateReadable = (date: Date | string): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return d.toLocaleDateString('es-ES', options);
};

/**
 * Get month name in Spanish
 */
export const getMonthName = (month: number): string => {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  return months[month] || '';
};

/**
 * Parse comma-separated hashtags string to array
 */
export const parseHashtags = (hashtagsStr: string): string[] => {
  return hashtagsStr
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
};

/**
 * Format hashtags array to comma-separated string
 */
export const formatHashtags = (hashtags: string[]): string => {
  return hashtags.map((tag) => (tag.startsWith('#') ? tag.slice(1) : tag)).join(', ');
};

/**
 * Get status color class for badges
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-700';
    case 'scheduled':
      return 'bg-purple-100 text-purple-700';
    case 'published':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Get platform icon name (for lucide-react)
 */
export const getPlatformIcon = (platform: string): string => {
  switch (platform) {
    case 'tiktok':
      return 'Music';
    case 'instagram':
      return 'Instagram';
    case 'youtube':
      return 'Youtube';
    default:
      return 'Globe';
  }
};
