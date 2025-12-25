'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { ChatBubble } from './shared/ChatBubble';
import { OptionButton } from './shared/OptionButton';
import { FileUploadZone } from './shared/FileUploadZone';

interface DocumentUploadPhaseProps {
  onUploadComplete: (files: File[]) => void;
  onSkip: () => void;
}

export const DocumentUploadPhase: React.FC<DocumentUploadPhaseProps> = ({
  onUploadComplete,
  onSkip
}) => {
  const { t } = useI18n();
  const [showUploadUI, setShowUploadUI] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleDone = () => {
    if (uploadedFiles.length > 0) {
      onUploadComplete(uploadedFiles);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ChatBubble sender="mirae">
        <div className="space-y-3">
          <p className="whitespace-pre-line">{t('onboardingUploadPrompt')}</p>
        </div>
      </ChatBubble>

      {!showUploadUI && (
        <div className="flex gap-3 justify-end">
          <OptionButton 
            onClick={() => setShowUploadUI(true)}
            variant="primary"
          >
            📤 {t('onboardingUploadButton')}
          </OptionButton>
          <OptionButton 
            onClick={onSkip}
            variant="ghost"
          >
            {t('onboardingUploadSkip')}
          </OptionButton>
        </div>
      )}

      {showUploadUI && (
        <>
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              maxFiles={6}
              maxFileSize={5 * 1024 * 1024} // 5MB
              acceptedTypes={['image/png', 'image/jpeg', 'application/pdf']}
            />
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {t('onboardingUploadFilesLabel', { count: uploadedFiles.length })}
                </p>
                <ul className="space-y-1">
                  {uploadedFiles.map((file, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                      <span>📄</span>
                      <span>{file.name}</span>
                      <span className="text-xs text-gray-400">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <OptionButton 
              onClick={handleDone}
              variant="primary"
              disabled={uploadedFiles.length === 0}
            >
              {t('onboardingUploadDone')}
            </OptionButton>
            <OptionButton 
              onClick={onSkip}
              variant="ghost"
            >
              {t('onboardingUploadCancel')}
            </OptionButton>
          </div>
        </>
      )}
    </div>
  );
};
