import React from 'react';
import Image from 'next/image';
import { AccessoryId, ACCESSORIES, AccessorySVG, getAccessoriesByLayer } from './miraeAccessories';

interface AvatarWithAccessoriesProps {
  selected: AccessoryId[];
  className?: string;
  avatarSrc?: string;
  size?: number;
}

export const AvatarWithAccessories: React.FC<AvatarWithAccessoriesProps> = ({
  selected,
  className = '',
  avatarSrc = '/asset/Mirae_Icon1.png',
  size = 240,
}) => {
  const behindAccessories = getAccessoriesByLayer(selected, 'behind');
  const frontAccessories = getAccessoriesByLayer(selected, 'front');

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Behind layer accessories */}
      {behindAccessories.map((id) => {
        const meta = ACCESSORIES[id];
        const pos = meta.defaultPosition;
        return (
          <div
            key={id}
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translate(${pos.x}%, ${pos.y}%) scale(${pos.scale}) rotate(${pos.rotate || 0}deg)`,
              transformOrigin: 'center',
            }}
          >
            <AccessorySVG accessoryId={id} />
          </div>
        );
      })}

      {/* Base Mirae Avatar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src={avatarSrc}
          alt="Mirae"
          width={size}
          height={size}
          className="object-contain"
        />
      </div>

      {/* Front layer accessories */}
      {frontAccessories.map((id) => {
        const meta = ACCESSORIES[id];
        const pos = meta.defaultPosition;
        return (
          <div
            key={id}
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translate(${pos.x}%, ${pos.y}%) scale(${pos.scale}) rotate(${pos.rotate || 0}deg)`,
              transformOrigin: 'center',
            }}
          >
            <AccessorySVG accessoryId={id} />
          </div>
        );
      })}
    </div>
  );
};
