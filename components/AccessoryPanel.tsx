'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, X } from 'lucide-react';
import {
  ACCESSORIES,
  isAccessoryUnlocked,
  MiraeCharacter,
  type Accessory,
  type EquippedAccessories,
  type AccessoryType,
} from './MiraeCharacterEvolution';

interface AccessoryPanelProps {
  cardCount: number;
  completedStages: string[];
  equippedAccessories: EquippedAccessories;
  onAccessoryChange: (equipped: EquippedAccessories) => void;
  isOpen?: boolean;
  onClose?: () => void;
  showTriggerButton?: boolean;
}

export const AccessoryPanel: React.FC<AccessoryPanelProps> = ({
  cardCount,
  completedStages,
  equippedAccessories,
  onAccessoryChange,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  showTriggerButton = true,
}) => {
  const [activeTab, setActiveTab] = useState<AccessoryType>('hat');
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose ? (value: boolean) => !value && externalOnClose() : setInternalIsOpen;

  const tabs: { type: AccessoryType; label: string; emoji: string }[] = [
    { type: 'hat', label: 'Hats', emoji: '👑' },
    { type: 'cape', label: 'Capes', emoji: '🦸' },
    { type: 'accessory', label: 'Accessories', emoji: '✨' },
    { type: 'effect', label: 'Effects', emoji: '💫' },
  ];

  const filteredAccessories = ACCESSORIES.filter((acc) => acc.type === activeTab);

  const handleAccessoryToggle = (accessory: Accessory) => {
    const isUnlocked = isAccessoryUnlocked(accessory, cardCount, completedStages);
    if (!isUnlocked) return;

    const currentEquipped = equippedAccessories[accessory.type];
    const newEquipped = { ...equippedAccessories };

    if (currentEquipped === accessory.id) {
      // Unequip if already equipped
      delete newEquipped[accessory.type];
    } else {
      // Equip new accessory
      newEquipped[accessory.type] = accessory.id;
    }

    console.log('AccessoryPanel: Calling onAccessoryChange with:', newEquipped);
    onAccessoryChange(newEquipped);
  };

  const handleResetAll = () => {
    // Remove all equipped accessories
    onAccessoryChange({});
  };

  const unlockedCount = ACCESSORIES.filter((acc) =>
    isAccessoryUnlocked(acc, cardCount, completedStages)
  ).length;

  return (
    <>
      {/* Toggle Button (optional) */}
      {showTriggerButton && (
        <button
          onClick={() => setInternalIsOpen(!internalIsOpen)}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#9DD5F5] to-[#C7B9FF] text-white font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          <span className="flex items-center justify-center gap-2">
            ✨ Customize Mirae ({unlockedCount}/{ACCESSORIES.length} unlocked)
          </span>
        </button>
      )}

      {/* Accessory Panel Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm px-4"
            onClick={() => externalOnClose ? externalOnClose() : setInternalIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl rounded-3xl border border-white/40 bg-white/95 p-6 shadow-2xl backdrop-blur-lg max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Customize Mirae</h2>
                <button
                  onClick={() => externalOnClose ? externalOnClose() : setInternalIsOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <p className="text-sm text-slate-600 mb-4">
                Unlock accessories by collecting cards and completing stages!
              </p>

              {/* Main Content: Preview + Customization */}
              <div className="flex-1 flex gap-6 min-h-0">
                {/* Left: Mirae Preview */}
                <div className="w-80 flex-shrink-0">
                  <div className="sticky top-0 rounded-2xl bg-gradient-to-br from-sky-50 via-violet-50 to-rose-50 p-6 h-full flex flex-col items-center justify-center">
                    <MiraeCharacter
                      key={`preview-${JSON.stringify(equippedAccessories)}`}
                      cardCount={cardCount}
                      recentCardTypes={[]}
                      size={280}
                      equippedAccessories={equippedAccessories}
                    />
                    <p className="mt-4 text-sm font-medium text-slate-600 text-center">
                      Live Preview
                    </p>
                    <p className="text-xs text-slate-500 text-center mt-1">
                      {Object.keys(equippedAccessories).length} accessories equipped
                    </p>
                  </div>
                </div>

                {/* Right: Accessory Selection */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Tabs */}
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.type}
                        onClick={() => setActiveTab(tab.type)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                          activeTab === tab.type
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{tab.emoji}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Accessory Grid */}
                  <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-3">
                  {filteredAccessories.map((accessory) => {
                    const isUnlocked = isAccessoryUnlocked(accessory, cardCount, completedStages);
                    const isEquipped = equippedAccessories[accessory.type] === accessory.id;

                    return (
                      <motion.button
                        key={accessory.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccessoryToggle(accessory);
                        }}
                        disabled={!isUnlocked}
                        whileHover={isUnlocked ? { scale: 1.02 } : {}}
                        whileTap={isUnlocked ? { scale: 0.98 } : {}}
                        className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                          isEquipped
                            ? 'border-[#9DD5F5] bg-[#9DD5F5]/10 shadow-md'
                            : isUnlocked
                            ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                            : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        {/* Locked/Equipped indicator */}
                        <div className="absolute top-2 right-2">
                          {!isUnlocked ? (
                            <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center">
                              <Lock className="w-3 h-3 text-slate-600" />
                            </div>
                          ) : isEquipped ? (
                            <div className="w-6 h-6 rounded-full bg-[#9DD5F5] flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : null}
                        </div>

                        {/* Preview */}
                        <div className="w-full aspect-square mb-2 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden relative">
                          {isUnlocked ? (
                            <div className="w-20 h-20 relative">
                              {accessory.component}
                            </div>
                          ) : (
                            <div className="text-4xl opacity-30">🔒</div>
                          )}
                        </div>

                        {/* Name */}
                        <h3 className={`font-semibold text-sm mb-1 ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                          {accessory.name}
                        </h3>

                        {/* Description */}
                        <p className={`text-xs ${isUnlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                          {accessory.description}
                        </p>

                        {/* Unlock condition */}
                        {!isUnlocked && (
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <p className="text-xs text-slate-500">
                              {accessory.unlockCondition.type === 'cardCount'
                                ? `Unlock at ${accessory.unlockCondition.value} cards`
                                : `Complete Stage ${accessory.unlockCondition.value}`}
                            </p>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-slate-500">
                    {unlockedCount} of {ACCESSORIES.length} unlocked
                  </p>
                  {Object.keys(equippedAccessories).length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetAll();
                      }}
                      className="px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      Reset All
                    </button>
                  )}
                </div>
                <button
                  onClick={() => externalOnClose ? externalOnClose() : setInternalIsOpen(false)}
                  className="px-6 py-2 rounded-full bg-slate-800 text-white font-medium hover:bg-slate-700 transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
