'use client';

import React, { useCallback } from 'react';
import { validateFiles, FileValidationConfig } from '@/lib/utils/fileValidation';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles: number;
  maxFileSize: number;
  acceptedTypes: string[];
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  maxFiles,
  maxFileSize,
  acceptedTypes
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validation = validateFiles(fileArray, {
      maxFileSize,
      maxFiles,
      allowedTypes: acceptedTypes,
      allowedExtensions: ['.png', '.jpg', '.jpeg', '.pdf']
    } as FileValidationConfig);

    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setError(null);
    onFilesSelected(validation.validFiles);
  }, [maxFiles, maxFileSize, acceptedTypes, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${isDragging ? 'border-purple-400 bg-purple-50' : 'border-gray-300 bg-gray-50'}
          hover:border-purple-300 hover:bg-purple-25 cursor-pointer
        `}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📎</div>
          <p className="text-gray-600 font-medium">
            Drag files here or tap to browse
          </p>
          <p className="text-sm text-gray-400">
            Supported: PNG, JPG, PDF • Max {maxFiles} files • {(maxFileSize / 1024 / 1024).toFixed(0)}MB each
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

