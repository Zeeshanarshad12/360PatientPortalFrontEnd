export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export function formatMessageTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLen: number): string {
  return text?.length > maxLen ? text.slice(0, maxLen) + '...' : text;
}

export const MESSAGE_TYPES = [
  'Other',
  'Medication Refill',
  'General',
  'Lab Results',
  'Appointment',
  'Billing',
  'Insurance',
  'Referral'
];
