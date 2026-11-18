/**
 * Spider Math Educational Platform (v2.2)
 * Phase 18 (Final Phase): AI Question Extraction Modal Models
 */

import { AssessmentQuestionItem } from '../assessment-studio.models';

export type AiExtractionMode = 'TEXT_LATEX_ONLY' | 'FULL_IMAGE_CROP' | 'SMART_HYBRID' | 'MANUAL_CROP';

export type PageScopeMode = 'CURRENT_PAGE' | 'PAGE_RANGE';

export interface IPageRangeConfig {
  mode: PageScopeMode;
  startPage: number;
  endPage: number;
  pageCount: number;
}

export interface IStagedQuestion {
  id: string;
  checked: boolean;
  pageNumber?: number;
  pageDataUrl?: string | null;
  question_text: string;
  type: 'MCQ' | 'ESSAY' | 'INPUT_TEXT';
  options: string[];
  correct_option_index: number;
  accepted_answers?: string[];
  acceptedAnswers?: string[];
  points: number;
  has_geometry_diagram: boolean;
  box_2d?: [number, number, number, number];
  localCropBlob?: Blob | null;
  localCropPreviewUrl?: string | null;
  question_image_url?: string | null;
  moduleIndex?: 1 | 2;
}

export interface IConfirmationDialogState {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
}

export interface IPersistedImageEntry {
  fileName: string;
  dataUrl: string;
}

export interface ICachedFileSession {
  fileName: string;
  fileType: 'pdf' | 'image';
  file: File | Blob | null;
  pageNumber: number;
  canvas: HTMLCanvasElement | null;
  dataUrl: string | null;
  totalPages?: number;
  lastSelectedRange?: { startPage: number; endPage: number };
  uploadedImages?: IPersistedImageEntry[];
  pageScopeMode?: PageScopeMode;
  extractionMode?: AiExtractionMode;
  stagedQuestions?: IStagedQuestion[];
  targetModuleIndex?: 1 | 2;
}

export interface IAiExtractionSessionRecord {
  assessmentId: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  fileBlob: File | Blob | null;
  uploadedImages: IPersistedImageEntry[];
  pageNumber: number;
  totalPages: number;
  currentDataUrl: string | null;
  lastSelectedRange?: { startPage: number; endPage: number };
  pageScopeMode: PageScopeMode;
  extractionMode: AiExtractionMode;
  stagedQuestions: IStagedQuestion[];
  targetModuleIndex?: 1 | 2;
  currentStep: 'UPLOAD_AND_SELECT' | 'PREVIEW_AND_PAGE' | 'STAGING_REVIEW';
  updatedAt: number;
}

export interface IAiExtractionBackendResponse {
  success: boolean;
  data: {
    questions: Array<{
      question_text: string;
      options: string[];
      correct_option_index: number;
      has_geometry_diagram: boolean;
      box_2d?: [number, number, number, number];
      points: number;
    }>;
    count: number;
  };
}

