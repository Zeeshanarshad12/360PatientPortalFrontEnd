import React from 'react';
import { getInitials } from '@/utils/helpers';

const AVATAR_COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
  '#EC4899',
  '#6366F1'
];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name?.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 36,
  className = ''
}) => {
  const initials = getInitials(name);
  const bg = colorForName(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0
        }}
        className={className}
      />
    );
  }

  return (
    <div
      className={className}
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
        fontWeight: 600,
        fontSize: size * 0.35,
        userSelect: 'none',
        fontFamily: 'Open Sans, sans-serif'
      }}
      aria-label={name}
    >
      {initials}
    </div>
  );
};
