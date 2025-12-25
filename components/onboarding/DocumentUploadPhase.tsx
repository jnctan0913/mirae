'use client';

import React from 'react';
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
    <div className="flex flex-col gap-4 p-6 max-w-2xl mx-auto">
      <ChatBubble sender="mirae">
        <div className="space-y-3">
          <p>One more thing—some students find it helpful to share things like:</p>
          <ul className="list-none space-y-1 ml-2">
            <li>📎 Career.net results (커리어넷 검사 결과)</li>
            <li>📎 Interest/aptitude test results</li>
            <li>📎 Notes from school counseling</li>
            <li>📎 Project work or writing samples</li>
          </ul>
          <p className="mt-3">
            If you have anything like that and want to share, I can help 
            us talk through what you're seeing in them.
          </p>
          <p className="text-sm text-gray-500">
            But if not, no worries—we can just keep chatting!
          </p>
        </div>
      </ChatBubble>

      {!showUploadUI && (
        <div className="flex gap-3 justify-end">
          <OptionButton 
            onClick={() => setShowUploadUI(true)}
            variant="primary"
          >
            📤 Upload something
          </OptionButton>
          <OptionButton 
            onClick={onSkip}
            variant="ghost"
          >
            Skip for now
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
                  Uploaded files ({uploadedFiles.length}/6):
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
              Done uploading
            </OptionButton>
            <OptionButton 
              onClick={onSkip}
              variant="ghost"
            >
              Cancel
            </OptionButton>
          </div>
        </>
      )}
    </div>
  );
};

