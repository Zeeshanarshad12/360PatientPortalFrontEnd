import React from 'react';
import { getInitials } from '@/utils/helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Avatar color system
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS: Record<string, string> = {
  patient: '#534AB7', // purple — open
  provider: '#185FA5', // blue — open
  patient_closed: '#AFA9EC', // light purple — closed
  provider_closed: '#85B7EB' // light blue — closed
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
  role?: 'patient' | 'provider';
  isClosed?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 40,
  className,
  role = 'patient',
  isClosed = false
}) => {
  const initials = getInitials(name ?? '');

  // closed always gray, otherwise role determines color

  const bg = isClosed
    ? AVATAR_COLORS[`${role}_closed`] ?? AVATAR_COLORS[role]
    : AVATAR_COLORS[role] ?? AVATAR_COLORS.patient;

  // Image avatar
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0
        }}
      />
    );
  }

  // Initials avatar
  return (
    <div
      className={className}
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: '#ffffff',
        fontWeight: 500,
        fontSize: size * 0.35,
        userSelect: 'none',
        fontFamily: 'inherit'
      }}
    >
      {initials}
    </div>
  );
};
