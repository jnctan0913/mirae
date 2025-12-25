# Mirae Onboarding Flow - Implementation Guide

## Overview
This document provides technical specifications for implementing the onboarding conversation flow with optional document upload for Mirae.

**Context:** Mirae is a private conversational AI tool for Korean high school students to explore academic path uncertainty. The onboarding must prioritize psychological safety and feel conversational, not evaluative.

---

## Flow Architecture

### Phase Structure
1. **Welcome & Permission** - Set psychological safety expectations
2. **Basic Context Collection** - Conversational Q&A (year level, course status, feelings)
3. **Optional Document Upload** - Career.net results, aptitude tests (with clear opt-out)
4. **Smart Keyword Extraction** - AI analyzes uploads → generates editable tags
5. **Journey Start** - Transition to main reflective chat

### Key Principles
- ✅ Conversational, not form-based
- ✅ All uploads are optional with clear skip options
- ✅ No storage of uploaded files after keyword extraction
- ✅ Student can edit/remove all generated keywords
- ✅ Warm, non-judgmental language throughout

---

## Tech Stack Assumptions

```
Frontend: Next.js + React + TypeScript
Styling: Tailwind CSS
State Management: React Context or Zustand
File Upload: Browser File API + FormData
AI Analysis: Anthropic Claude API or OpenAI GPT-4 API
Storage: SessionStorage (temporary) + optional localStorage (keywords only)
```

---

## Component Structure

```
src/
├── components/
│   ├── onboarding/
│   │   ├── OnboardingContainer.tsx          # Main orchestrator
│   │   ├── WelcomePhase.tsx                 # Phase 1: Welcome screen
│   │   ├── ContextCollectionPhase.tsx       # Phase 2: Basic info Q&A
│   │   ├── DocumentUploadPhase.tsx          # Phase 3: Upload interface
│   │   ├── KeywordReviewPhase.tsx           # Phase 4: Review/edit tags
│   │   ├── JourneyStartPhase.tsx            # Phase 5: Transition
│   │   └── shared/
│   │       ├── ChatBubble.tsx               # Message display component
│   │       ├── OptionButton.tsx             # Multiple choice button
│   │       ├── FileUploadZone.tsx           # Drag-n-drop zone
│   │       └── KeywordTag.tsx               # Editable tag chip
│   └── chat/
│       └── MainChatInterface.tsx            # Post-onboarding chat
├── hooks/
│   ├── useOnboarding.ts                     # Onboarding state management
│   ├── useFileUpload.ts                     # File handling logic
│   └── useKeywordExtraction.ts              # AI analysis integration
├── services/
│   ├── aiService.ts                         # Claude/GPT API wrapper
│   └── uploadService.ts                     # File processing utilities
├── types/
│   └── onboarding.types.ts                  # TypeScript interfaces
└── utils/
    ├── fileValidation.ts                    # Upload security checks
    └── onboardingFlow.ts                    # Flow logic constants
```

---

## Data Models

### OnboardingState Interface

```typescript
interface OnboardingState {
  currentPhase: 'welcome' | 'context' | 'upload' | 'keywords' | 'start';
  studentData: {
    yearLevel: 'year1' | 'year2' | 'year3' | null;
    courseSelectionStatus: 'picked' | 'deciding' | 'reconsidering' | null;
    currentFeeling: string | null;
  };
  uploadedFiles: File[];
  extractedKeywords: Keyword[];
  conversationHistory: Message[];
  hasSkippedUpload: boolean;
}

interface Keyword {
  id: string;
  text: string;
  isEditable: boolean;
  isRemoved: boolean;
}

interface Message {
  id: string;
  sender: 'mirae' | 'student';
  content: string;
  timestamp: Date;
  type: 'text' | 'options' | 'upload';
  options?: OptionButton[];
}

interface OptionButton {
  id: string;
  label: string;
  value: string;
  action: () => void;
}
```

### File Upload Validation

```typescript
interface FileValidationConfig {
  maxFileSize: number;        // 5MB in bytes
  maxFiles: number;           // 6 files max
  allowedTypes: string[];     // ['image/png', 'image/jpeg', 'application/pdf']
  allowedExtensions: string[]; // ['.png', '.jpg', '.jpeg', '.pdf']
}

interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  validFiles: File[];
}
```

---

## Phase 1: Welcome Screen

### Component: WelcomePhase.tsx

```typescript
import React from 'react';
import ChatBubble from './shared/ChatBubble';
import OptionButton from './shared/OptionButton';

interface WelcomePhaseProps {
  onContinue: () => void;
  onShowDetails: () => void;
  onSkipToChat: () => void;
}

export const WelcomePhase: React.FC<WelcomePhaseProps> = ({
  onContinue,
  onShowDetails,
  onSkipToChat
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl mx-auto">
      {/* Mirae welcome message */}
      <ChatBubble sender="mirae">
        <div className="space-y-3">
          <p className="text-lg">
            Hi! Welcome to Mirae—your private space to think about school and paths. 🌱
          </p>
          <p className="text-gray-600">
            No one else can see what we talk about here. Not teachers, 
            not parents, not friends. Just you and me.
          </p>
          <p>
            Before we start, I'd love to know a little about where you're at 
            right now. Cool if I ask a few quick questions?
          </p>
        </div>
      </ChatBubble>

      {/* Option buttons */}
      <div className="flex gap-3 justify-end">
        <OptionButton 
          onClick={onContinue}
          variant="primary"
        >
          Sure, let's go
        </OptionButton>
        <OptionButton 
          onClick={() => setShowDetails(true)}
          variant="secondary"
        >
          What kind of questions?
        </OptionButton>
      </div>

      {/* Details expansion */}
      {showDetails && (
        <>
          <ChatBubble sender="mirae">
            <div className="space-y-2">
              <p>Nothing scary! Just things like:</p>
              <ul className="list-none space-y-1 ml-2">
                <li>• What year you're in</li>
                <li>• What you're thinking about lately</li>
                <li>• If you have any test results or notes you want to share (totally optional!)</li>
              </ul>
              <p className="mt-3">
                It helps me understand how to be useful to you.
              </p>
            </div>
          </ChatBubble>
          
          <div className="flex gap-3 justify-end">
            <OptionButton onClick={onContinue} variant="primary">
              Okay, sounds good
            </OptionButton>
            <OptionButton onClick={onSkipToChat} variant="ghost">
              I'll just talk instead
            </OptionButton>
          </div>
        </>
      )}
    </div>
  );
};
```

---

## Phase 2: Context Collection

### Component: ContextCollectionPhase.tsx

```typescript
import React from 'react';
import ChatBubble from './shared/ChatBubble';
import OptionButton from './shared/OptionButton';

interface ContextCollectionPhaseProps {
  onComplete: (data: StudentContextData) => void;
}

interface StudentContextData {
  yearLevel: 'year1' | 'year2' | 'year3';
  courseSelectionStatus: 'picked' | 'deciding' | 'reconsidering';
  currentFeeling?: string;
}

export const ContextCollectionPhase: React.FC<ContextCollectionPhaseProps> = ({
  onComplete
}) => {
  const [step, setStep] = React.useState<'year' | 'status' | 'feeling'>('year');
  const [data, setData] = React.useState<Partial<StudentContextData>>({});

  const handleYearSelect = (year: 'year1' | 'year2' | 'year3') => {
    setData(prev => ({ ...prev, yearLevel: year }));
    setStep('status');
  };

  const handleStatusSelect = (status: 'picked' | 'deciding' | 'reconsidering') => {
    setData(prev => ({ ...prev, courseSelectionStatus: status }));
    
    // If they picked "reconsidering" or "deciding", ask about feelings
    if (status === 'reconsidering' || status === 'deciding') {
      setStep('feeling');
    } else {
      // If "picked" and feeling good, skip to next phase
      onComplete({ ...data, courseSelectionStatus: status } as StudentContextData);
    }
  };

  const handleFreeTextSubmit = (feeling: string) => {
    onComplete({ ...data, currentFeeling: feeling } as StudentContextData);
  };

  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl mx-auto">
      {/* Step 1: Year Level */}
      {step === 'year' && (
        <>
          <ChatBubble sender="mirae">
            First—what year are you in right now?
          </ChatBubble>
          <div className="flex gap-3 justify-end flex-wrap">
            <OptionButton onClick={() => handleYearSelect('year1')}>
              Year 1 (고1)
            </OptionButton>
            <OptionButton onClick={() => handleYearSelect('year2')}>
              Year 2 (고2)
            </OptionButton>
            <OptionButton onClick={() => handleYearSelect('year3')}>
              Year 3 (고3)
            </OptionButton>
          </div>
        </>
      )}

      {/* Step 2: Course Selection Status */}
      {step === 'status' && (
        <>
          <ChatBubble sender="student">
            Year {data.yearLevel === 'year1' ? '1' : data.yearLevel === 'year2' ? '2' : '3'}
          </ChatBubble>
          <ChatBubble sender="mirae">
            Got it—Year {data.yearLevel === 'year1' ? '1' : data.yearLevel === 'year2' ? '2' : '3'}. 
            That's when a lot starts to feel real, huh?
            <br/><br/>
            Have you already picked your courses for this year, 
            or are you still thinking about it?
          </ChatBubble>
          <div className="flex gap-3 justify-end flex-wrap">
            <OptionButton onClick={() => handleStatusSelect('picked')}>
              Already picked
            </OptionButton>
            <OptionButton onClick={() => handleStatusSelect('deciding')}>
              Still deciding
            </OptionButton>
            <OptionButton onClick={() => handleStatusSelect('reconsidering')}>
              Picked, but having second thoughts
            </OptionButton>
          </div>
        </>
      )}

      {/* Step 3: Current Feeling (conditional) */}
      {step === 'feeling' && (
        <>
          <ChatBubble sender="student">
            {data.courseSelectionStatus === 'deciding' ? 'Still deciding' : 'Picked, but having second thoughts'}
          </ChatBubble>
          <ChatBubble sender="mirae">
            {data.courseSelectionStatus === 'deciding' 
              ? "That makes sense—it's a big decision. What's making it hard to decide? Is there something specific you're stuck on, or just a general 'too many options' feeling?"
              : "Ah, the second-guessing... I hear you. What's making you wonder if you chose right? Did something happen, or is it more of a nagging feeling?"
            }
          </ChatBubble>
          
          {/* Free text input */}
          <div className="flex gap-2 items-end">
            <input
              type="text"
              placeholder="Share what's on your mind..."
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  handleFreeTextSubmit(e.currentTarget.value);
                }
              }}
            />
            <button 
              className="px-6 py-3 bg-gradient-to-r from-pink-300 to-orange-300 rounded-2xl text-white font-medium"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input?.value.trim()) {
                  handleFreeTextSubmit(input.value);
                }
              }}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

---

## Phase 3: Document Upload

### Component: DocumentUploadPhase.tsx

```typescript
import React from 'react';
import ChatBubble from './shared/ChatBubble';
import OptionButton from './shared/OptionButton';
import FileUploadZone from './shared/FileUploadZone';

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
```

### Component: FileUploadZone.tsx

```typescript
import React, { useCallback } from 'react';
import { validateFiles } from '@/utils/fileValidation';

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
    });

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
```

---

## Phase 4: Keyword Extraction & Review

### Service: aiService.ts

```typescript
// AI Keyword Extraction Service

interface KeywordExtractionResponse {
  keywords: string[];
  confidence: number;
}

export async function extractKeywordsFromDocuments(
  files: File[]
): Promise<KeywordExtractionResponse> {
  try {
    // Convert files to base64 or text
    const fileContents = await Promise.all(
      files.map(file => convertFileToBase64(file))
    );

    // Call Claude API
    const response = await fetch('/api/extract-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: fileContents,
        prompt: getKeywordExtractionPrompt()
      })
    });

    const data = await response.json();
    return {
      keywords: data.keywords || [],
      confidence: data.confidence || 0.8
    };
  } catch (error) {
    console.error('Keyword extraction failed:', error);
    return { keywords: [], confidence: 0 };
  }
}

function getKeywordExtractionPrompt(): string {
  return `You are analyzing uploaded career aptitude test results for a Korean high school student. Extract 3-5 positive traits or interests.

RULES:
- Use warm, non-judgmental language
- Avoid academic performance labels (e.g., "high achiever", "struggling")
- Focus on: working styles, curiosities, tendencies, values
- Keep each trait to 2-4 words max
- Use empowering language (e.g., "Curious explorer" not "Indecisive")

Examples of GOOD keywords:
✅ "Empathy-driven"
✅ "Visual thinker"  
✅ "Loves problem-solving"
✅ "Drawn to creative work"

Examples of BAD keywords:
❌ "Below average in math"
❌ "Should consider humanities"
❌ "Not suited for STEM"

Output ONLY a JSON array of keywords, nothing else:
["keyword1", "keyword2", "keyword3"]`;
}

async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### API Route: /api/extract-keywords

```typescript
// app/api/extract-keywords/route.ts (Next.js App Router API route)

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { files, prompt } = await req.json();

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          ...files.map((fileBase64: string) => ({
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg', // Adjust based on file type
              data: fileBase64.split(',')[1] // Remove data:image/jpeg;base64, prefix
            }
          }))
        ]
      }]
    });

    // Parse keywords from response
    const responseText = message.content[0].text;
    const keywords = JSON.parse(responseText);

    // Delete uploaded files from memory (don't persist)
    // files are already in memory only, no cleanup needed

    return NextResponse.json({
      keywords,
      confidence: 0.85
    });
  } catch (error) {
    console.error('AI extraction error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to extract keywords',
        keywords: [] 
      },
      { status: 500 }
    );
  }
}
```

### Component: KeywordReviewPhase.tsx

```typescript
import React from 'react';
import ChatBubble from './shared/ChatBubble';
import KeywordTag from './shared/KeywordTag';
import OptionButton from './shared/OptionButton';

interface KeywordReviewPhaseProps {
  extractedKeywords: string[];
  onComplete: (finalKeywords: string[]) => void;
}

export const KeywordReviewPhase: React.FC<KeywordReviewPhaseProps> = ({
  extractedKeywords,
  onComplete
}) => {
  const [keywords, setKeywords] = React.useState(
    extractedKeywords.map(text => ({
      id: Math.random().toString(36),
      text,
      isRemoved: false
    }))
  );

  const handleRemoveKeyword = (id: string) => {
    setKeywords(prev =>
      prev.map(kw => kw.id === id ? { ...kw, isRemoved: true } : kw)
    );
  };

  const handleConfirm = () => {
    const finalKeywords = keywords
      .filter(kw => !kw.isRemoved)
      .map(kw => kw.text);
    onComplete(finalKeywords);
  };

  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl mx-auto">
      <ChatBubble sender="mirae">
        Thanks for sharing! Give me a sec to look through these... 🔍
      </ChatBubble>

      {/* Loading animation - show for 2-3 seconds */}
      <div className="flex justify-center py-4">
        <div className="animate-pulse text-gray-400">Analyzing...</div>
      </div>

      <ChatBubble sender="mirae">
        Okay, I noticed a few things that stood out:
      </ChatBubble>

      {/* Keyword tags */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          📝 What I noticed:
        </h3>
        <div className="flex flex-wrap gap-2">
          {keywords.map(keyword => (
            <KeywordTag
              key={keyword.id}
              text={keyword.text}
              isRemoved={keyword.isRemoved}
              onRemove={() => handleRemoveKeyword(keyword.id)}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          These are just things that caught my eye—feel free to remove 
          anything that doesn't feel right!
        </p>
      </div>

      <ChatBubble sender="mirae">
        Cool! These will help me understand you better as we talk.
        <br/>
        <span className="text-sm text-gray-500">
          (You can always change these later if you want.)
        </span>
        <br/><br/>
        Ready to start exploring?
      </ChatBubble>

      <div className="flex justify-end">
        <OptionButton onClick={handleConfirm} variant="primary">
          Let's go! ✨
        </OptionButton>
      </div>
    </div>
  );
};
```

### Component: KeywordTag.tsx

```typescript
import React from 'react';

interface KeywordTagProps {
  text: string;
  isRemoved: boolean;
  onRemove: () => void;
}

export const KeywordTag: React.FC<KeywordTagProps> = ({
  text,
  isRemoved,
  onRemove
}) => {
  if (isRemoved) return null;

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
      <span className="text-sm font-medium text-gray-700">{text}</span>
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Remove keyword"
      >
        ✕
      </button>
    </div>
  );
};
```

---

## Utility Functions

### fileValidation.ts

```typescript
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
```

---

## State Management Hook

### useOnboarding.ts

```typescript
import { useState, useCallback } from 'react';
import { OnboardingState, StudentContextData, Keyword } from '@/types/onboarding.types';

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    currentPhase: 'welcome',
    studentData: {
      yearLevel: null,
      courseSelectionStatus: null,
      currentFeeling: null
    },
    uploadedFiles: [],
    extractedKeywords: [],
    conversationHistory: [],
    hasSkippedUpload: false
  });

  const advancePhase = useCallback((nextPhase: OnboardingState['currentPhase']) => {
    setState(prev => ({ ...prev, currentPhase: nextPhase }));
  }, []);

  const setStudentContext = useCallback((data: StudentContextData) => {
    setState(prev => ({
      ...prev,
      studentData: { ...prev.studentData, ...data }
    }));
    advancePhase('upload');
  }, [advancePhase]);

  const setUploadedFiles = useCallback((files: File[]) => {
    setState(prev => ({ ...prev, uploadedFiles: files }));
  }, []);

  const skipUpload = useCallback(() => {
    setState(prev => ({ ...prev, hasSkippedUpload: true }));
    advancePhase('start');
  }, [advancePhase]);

  const setKeywords = useCallback((keywords: string[]) => {
    const keywordObjects: Keyword[] = keywords.map(text => ({
      id: Math.random().toString(36),
      text,
      isEditable: true,
      isRemoved: false
    }));
    setState(prev => ({ ...prev, extractedKeywords: keywordObjects }));
  }, []);

  const completeOnboarding = useCallback(() => {
    // Save to localStorage (keywords only, no files)
    const dataToSave = {
      yearLevel: state.studentData.yearLevel,
      keywords: state.extractedKeywords
        .filter(k => !k.isRemoved)
        .map(k => k.text),
      onboardingCompleted: true,
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem('mirae_user_data', JSON.stringify(dataToSave));
    
    // Clear uploaded files from memory
    setState(prev => ({ ...prev, uploadedFiles: [] }));
  }, [state]);

  return {
    state,
    advancePhase,
    setStudentContext,
    setUploadedFiles,
    skipUpload,
    setKeywords,
    completeOnboarding
  };
}
```

---

## Main Orchestrator Component

### OnboardingContainer.tsx

```typescript
import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { extractKeywordsFromDocuments } from '@/services/aiService';

import WelcomePhase from './WelcomePhase';
import ContextCollectionPhase from './ContextCollectionPhase';
import DocumentUploadPhase from './DocumentUploadPhase';
import KeywordReviewPhase from './KeywordReviewPhase';
import JourneyStartPhase from './JourneyStartPhase';

export const OnboardingContainer: React.FC = () => {
  const {
    state,
    advancePhase,
    setStudentContext,
    setUploadedFiles,
    skipUpload,
    setKeywords,
    completeOnboarding
  } = useOnboarding();

  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleUploadComplete = async (files: File[]) => {
    setUploadedFiles(files);
    setIsProcessing(true);

    try {
      const { keywords } = await extractKeywordsFromDocuments(files);
      setKeywords(keywords);
      advancePhase('keywords');
    } catch (error) {
      console.error('Failed to process uploads:', error);
      // Fallback: skip to next phase without keywords
      skipUpload();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJourneyStart = () => {
    completeOnboarding();
    // Navigate to main chat interface
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {state.currentPhase === 'welcome' && (
        <WelcomePhase
          onContinue={() => advancePhase('context')}
          onShowDetails={() => {/* handled internally */}}
          onSkipToChat={() => {
            skipUpload();
            handleJourneyStart();
          }}
        />
      )}

      {state.currentPhase === 'context' && (
        <ContextCollectionPhase onComplete={setStudentContext} />
      )}

      {state.currentPhase === 'upload' && (
        <DocumentUploadPhase
          onUploadComplete={handleUploadComplete}
          onSkip={skipUpload}
        />
      )}

      {state.currentPhase === 'keywords' && (
        <KeywordReviewPhase
          extractedKeywords={state.extractedKeywords.map(k => k.text)}
          onComplete={(finalKeywords) => {
            setKeywords(finalKeywords);
            advancePhase('start');
          }}
        />
      )}

      {state.currentPhase === 'start' && (
        <JourneyStartPhase onBegin={handleJourneyStart} />
      )}

      {isProcessing && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Processing your files...</p>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## Security & Privacy Checklist

```markdown
## CRITICAL SECURITY REQUIREMENTS

### ✅ File Upload Security
- [ ] Validate file types on client AND server
- [ ] Scan for malware/viruses before processing
- [ ] Set strict file size limits (5MB max)
- [ ] Use Content-Type validation
- [ ] Sanitize file names

### ✅ Data Privacy
- [ ] NO storage of uploaded files after keyword extraction
- [ ] NO personally identifiable information (PII) collection
- [ ] NO IP address logging
- [ ] Process files in memory only
- [ ] Clear all file data after analysis

### ✅ API Security
- [ ] Rate limit AI API calls (prevent abuse)
- [ ] Use environment variables for API keys
- [ ] Implement CORS restrictions
- [ ] Add request timeout limits
- [ ] Log errors without exposing sensitive data

### ✅ User Data Storage
- [ ] Only store: year level + keywords (localStorage)
- [ ] NO chat history persistence
- [ ] NO user identification tokens
- [ ] Clear all data on logout
- [ ] No server-side session storage
```

---

## Environment Variables

```bash
# .env.local

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Or OpenAI (alternative)
OPENAI_API_KEY=sk-xxxxx

# App Config
NEXT_PUBLIC_MAX_FILE_SIZE=5242880  # 5MB in bytes
NEXT_PUBLIC_MAX_FILES=6
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Testing Checklist

```markdown
## User Flow Testing

### Phase 1: Welcome
- [ ] "Sure, let's go" advances to context phase
- [ ] "What kind of questions?" shows details
- [ ] "I'll just talk instead" skips to main chat

### Phase 2: Context
- [ ] All year level options work
- [ ] Course status selection advances correctly
- [ ] Free text input accepts Korean characters
- [ ] Feeling question shows for "deciding" and "reconsidering"

### Phase 3: Upload
- [ ] Drag-and-drop works
- [ ] File type validation rejects invalid files
- [ ] File size validation works (>5MB rejected)
- [ ] Max 6 files enforced
- [ ] "Skip for now" bypasses upload

### Phase 4: Keywords
- [ ] AI extracts keywords successfully
- [ ] Keywords display as editable tags
- [ ] Remove (✕) button works
- [ ] Keywords save to localStorage

### Phase 5: Journey Start
- [ ] Transition to main chat works
- [ ] User data persists correctly

## Edge Cases
- [ ] No internet connection during upload
- [ ] AI API failure handling
- [ ] Invalid file types
- [ ] Empty keyword responses
- [ ] Back button behavior
```

---

This implementation guide should give Cursor everything needed to build the onboarding flow! Let me know if you need the Korean translations or additional components.

