'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Lock, Download, RotateCcw, Sparkles } from 'lucide-react';
import { toPng } from 'html-to-image';
import { AvatarComposer } from './AvatarComposer';
import type { AccessoryId, ProgressState, AvatarConfig } from './avatarTypes';
import { ACCESSORIES, getUnlockedAccessories, isAccessoryUnlocked, getAutoStylePreset } from './avatarRegistry';
import { getUserProfile, updateUserProfile } from '@/lib/userProfile';

const STORAGE_KEY = 'mirae_avatar_config_v1';

interface AvatarCustomizerPanelProps {
  baseSrc: string;
  progress: ProgressState;
  onConfigChange?: (config: AvatarConfig) => void;
}

export const AvatarCustomizerPanel: React.FC<AvatarCustomizerPanelProps> = ({
  baseSrc,
  progress,
  onConfigChange,
}) => {
  const [selectedAccessories, setSelectedAccessories] = useState<AccessoryId[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Load from profile or localStorage on mount
  useEffect(() => {
    const profile = getUserProfile();
    const profileSelection = profile.avatar?.customizerSelectedAccessories ?? null;
    if (profileSelection && profileSelection.length > 0) {
      const unlocked = getUnlockedAccessories(progress);
      const validSelection = profileSelection.filter((id) => unlocked.has(id));
      setSelectedAccessories(validSelection);
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const config: AvatarConfig = JSON.parse(saved);
      const unlocked = getUnlockedAccessories(progress);
      const validSelection = config.selectedAccessories.filter((id) => unlocked.has(id));
      setSelectedAccessories(validSelection);
      updateUserProfile({
        avatar: {
          ...profile.avatar,
          customizerSelectedAccessories: validSelection,
        },
      });
    } catch (e) {
      console.error('Failed to load avatar config:', e);
    }
  }, [progress]);

  // Save to localStorage whenever selection changes
  useEffect(() => {
    const config: AvatarConfig = { selectedAccessories };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    onConfigChange?.(config);
    updateUserProfile({
      avatar: {
        ...getUserProfile().avatar,
        customizerSelectedAccessories: selectedAccessories,
      },
    });
  }, [selectedAccessories, onConfigChange]);

  const toggleAccessory = (id: AccessoryId) => {
    setSelectedAccessories(prev =>
      prev.includes(id)
        ? prev.filter(accId => accId !== id)
        : [...prev, id]
    );
  };

  const handleReset = () => {
    setSelectedAccessories([]);
  };

  const handleAutoStyle = () => {
    const preset = getAutoStylePreset(progress);
    setSelectedAccessories(preset);
  };

  const handleExportPNG = async () => {
    if (!avatarRef.current) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(avatarRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      // Download
      const link = document.createElement('a');
      link.download = 'mirae-avatar.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      // Fallback: open in new tab
      if (avatarRef.current) {
        try {
          const dataUrl = await toPng(avatarRef.current);
          window.open(dataUrl, '_blank');
        } catch (e) {
          console.error('Fallback export also failed:', e);
        }
      }
    } finally {
      setIsExporting(false);
    }
  };

  const unlockedAccessories = getUnlockedAccessories(progress);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Avatar Preview */}
      <div className="rounded-3xl border border-white/40 bg-white/85 p-8 shadow-lg backdrop-blur-lg">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <AvatarComposer
              ref={avatarRef}
              baseSrc={baseSrc}
              selected={selectedAccessories}
              progress={progress}
              size={320}
              className="mx-auto"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleAutoStyle}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 transition-all shadow-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Match my cards
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleExportPNG}
            disabled={isExporting}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export PNG'}
          </button>
        </div>
      </div>

      {/* Accessory Toggles */}
      <div className="rounded-3xl border border-white/40 bg-white/85 p-6 shadow-lg backdrop-blur-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Accessories</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACCESSORIES.map(accessory => {
            const isUnlocked = unlockedAccessories.has(accessory.id);
            const isSelected = selectedAccessories.includes(accessory.id);

            return (
              <button
                key={accessory.id}
                onClick={() => isUnlocked && toggleAccessory(accessory.id)}
                disabled={!isUnlocked}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${
                  isUnlocked
                    ? isSelected
                      ? 'border-slate-800 bg-slate-800 text-white shadow-md'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {!isUnlocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-white bg-white'
                            : 'border-slate-300 bg-transparent'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{accessory.name}</p>
                    <p className={`text-xs mt-0.5 ${
                      isUnlocked
                        ? isSelected
                          ? 'text-white/70'
                          : 'text-slate-500'
                        : 'text-slate-400'
                    }`}>
                      {isUnlocked
                        ? accessory.layer === 'behind'
                          ? 'Background layer'
                          : 'Front layer'
                        : 'Unlock by continuing your journey'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs text-slate-600 text-center">
            <span className="font-medium">{selectedAccessories.length}</span> accessory
            {selectedAccessories.length !== 1 ? 'ies' : 'y'} selected •{' '}
            <span className="font-medium">{unlockedAccessories.size}</span> unlocked
          </p>
        </div>
      </div>

      {/* Installation note (for development reference) */}
      {/*
        To enable PNG export, install html-to-image:
        npm i html-to-image
      */}
    </div>
  );
};
