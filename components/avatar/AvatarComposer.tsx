import React, { forwardRef } from 'react';
import Image from 'next/image';
import type { AccessoryId, ProgressState } from './avatarTypes';
import { getAccessoryById, isAccessoryUnlocked, getAccessoriesByLayer } from './avatarRegistry';

type AvatarComposerProps = {
  baseSrc: string; // "/asset/Mirae_Icon1.png"
  selected: AccessoryId[];
  progress: ProgressState;
  size?: number; // px
  className?: string;
};

export const AvatarComposer = forwardRef<HTMLDivElement, AvatarComposerProps>(
  ({ baseSrc, selected, progress, size = 320, className = '' }, ref) => {
    // Filter accessories: only render if BOTH selected AND unlocked
    const validAccessories = selected.filter(id =>
      isAccessoryUnlocked(id, progress)
    );

    const behindAccessories = getAccessoriesByLayer('behind')
      .filter(acc => validAccessories.includes(acc.id));

    const frontAccessories = getAccessoriesByLayer('front')
      .filter(acc => validAccessories.includes(acc.id));

    return (
      <div
        ref={ref}
        className={`relative ${className}`}
        style={{ width: size, height: size }}
      >
        {/* Layer 1: Behind accessories */}
        {behindAccessories.map(accessory => {
          const pos = accessory.defaultPosition;
          return (
            <div
              key={accessory.id}
              className="absolute pointer-events-none"
              style={{
                left: `${pos.leftPct}%`,
                top: `${pos.topPct}%`,
                width: `${pos.widthPct}%`,
                transform: pos.rotateDeg ? `rotate(${pos.rotateDeg}deg)` : undefined,
                transformOrigin: 'center',
              }}
            >
              <img
                src={accessory.src}
                alt={accessory.name}
                className="w-full h-auto"
                style={{ display: 'block' }}
              />
            </div>
          );
        })}

        {/* Layer 2: Base Mirae PNG */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={baseSrc}
            alt="Mirae"
            width={size}
            height={size}
            className="object-contain"
            unoptimized
          />
        </div>

        {/* Layer 3: Front accessories */}
        {frontAccessories.map(accessory => {
          const pos = accessory.defaultPosition;
          return (
            <div
              key={accessory.id}
              className="absolute pointer-events-none"
              style={{
                left: `${pos.leftPct}%`,
                top: `${pos.topPct}%`,
                width: `${pos.widthPct}%`,
                transform: pos.rotateDeg ? `rotate(${pos.rotateDeg}deg)` : undefined,
                transformOrigin: 'center',
              }}
            >
              <img
                src={accessory.src}
                alt={accessory.name}
                className="w-full h-auto"
                style={{ display: 'block' }}
              />
            </div>
          );
        })}
      </div>
    );
  }
);

AvatarComposer.displayName = 'AvatarComposer';
