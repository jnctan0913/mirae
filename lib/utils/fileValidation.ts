// File validation utility

export interface FileValidationConfig {
  maxFileSize: number;
  maxFiles: number;
  allowedTypes: string[];
  allowedExtensions: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  validFiles: File[];
}

export function validateFiles(
  files: File[],
  config: FileValidationConfig
): FileValidationResult {
  const errors: string[] = [];
  const validFiles: File[] = [];

  // Check file count
  if (files.length > config.maxFiles) {
    errors.push(`Maximum ${config.maxFiles} files allowed`);
    return { isValid: false, errors, validFiles };
  }

  for (const file of files) {
    // Check file size
    if (file.size > config.maxFileSize) {
      errors.push(`${file.name} exceeds ${(config.maxFileSize / 1024 / 1024).toFixed(0)}MB limit`);
      continue;
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      errors.push(`${file.name} has unsupported file type`);
      continue;
    }

    // Check file extension
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!config.allowedExtensions.includes(fileExt)) {
      errors.push(`${file.name} has unsupported extension`);
      continue;
    }

    validFiles.push(file);
  }

  return {
    isValid: errors.length === 0,
    errors,
    validFiles
  };
}

export function sanitizeFileName(fileName: string): string {
  // Remove special characters and limit length
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100);
}

