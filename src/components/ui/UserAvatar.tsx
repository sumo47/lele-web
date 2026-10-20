'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, User } from 'lucide-react';

export interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showEditBadge?: boolean;
  onEditClick?: () => void;
  priority?: boolean;
}

const sizeConfig = {
  xs: { container: 'w-6 h-6 text-[10px]', px: 24, badge: 'w-3 h-3 p-0.5' },
  sm: { container: 'w-8 h-8 text-xs', px: 32, badge: 'w-4 h-4 p-0.5' },
  md: { container: 'w-11 h-11 text-sm', px: 44, badge: 'w-5 h-5 p-1' },
  lg: { container: 'w-20 h-20 text-2xl', px: 80, badge: 'w-7 h-7 p-1.5' },
  xl: { container: 'w-24 h-24 sm:w-28 sm:h-28 text-3xl', px: 112, badge: 'w-8 h-8 p-1.5' },
};

export default function UserAvatar({
  src,
  name,
  size = 'md',
  className = '',
  showEditBadge = false,
  onEditClick,
  priority = false,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const cfg = sizeConfig[size] || sizeConfig.md;

  const initial = name && name.trim() ? name.trim().charAt(0).toUpperCase() : null;

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`${cfg.container} rounded-full overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200/80 shadow-xs flex items-center justify-center font-bold text-red-600 select-none relative`}
        aria-label={name ? `${name}'s avatar` : 'User profile photo'}
      >
        {src && !imageError ? (
          <Image
            src={src}
            alt={name || 'Profile photo'}
            fill
            sizes={`${cfg.px}px`}
            className="object-cover"
            priority={priority}
            onError={() => setImageError(true)}
          />
        ) : initial ? (
          <span>{initial}</span>
        ) : (
          <User className="w-1/2 h-1/2 text-red-400" />
        )}
      </div>

      {showEditBadge && (
        <button
          type="button"
          onClick={onEditClick}
          aria-label="Change profile photo"
          title="Change profile photo"
          className={`absolute bottom-0 right-0 ${cfg.badge} rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-md border-2 border-white transition flex items-center justify-center cursor-pointer`}
        >
          <Camera className="w-full h-full" />
        </button>
      )}
    </div>
  );
}
