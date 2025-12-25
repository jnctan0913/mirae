'use client';

import React, { useState } from 'react';
import { FloatingChatBubble } from './FloatingChatBubble';
import { FloatingChatPanel } from './FloatingChatPanel';

export const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount] = useState(0); // Can be used for future notifications

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <FloatingChatBubble isOpen={isOpen} onToggle={handleToggle} unreadCount={unreadCount} />
      <FloatingChatPanel isOpen={isOpen} onClose={handleClose} />
    </>
  );
};
