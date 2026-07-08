import moment from 'moment';

export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return '';
  const m = moment(iso).local();
  if (!m.isValid()) return '';

  const now = moment();
  const diffDays = now
    .clone()
    .startOf('day')
    .diff(m.clone().startOf('day'), 'days');

  if (diffDays === 0) return m.format('hh:mm A');
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return m.format('ddd');
  return m.format('MMM D');
}

export function formatMessageTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const m = moment(iso).local();
  if (!m.isValid()) return '';
  return m.format('hh:mm A');
}

export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;#x27;/g, "'")
    .replace(/&amp;amp;/g, '&')
    .replace(/&amp;lt;/g, '<')
    .replace(/&amp;gt;/g, '>')
    .replace(/&amp;quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, '\u00A0')
    .replace(/&#x2F;/g, '/')
    .replace(/&#x60;/g, '`')
    .replace(/&#x3D;/g, '=');
}

export function getInitials(name: string): string {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

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
