/**
 * Spider Math Educational Platform (v2.2)
 * Phase 18 (Final Phase): AI Question Extraction Modal Models
 */

import { AssessmentQuestionItem } from '../assessment-studio.models';

export type AiExtractionMode = 'TEXT_LATEX_ONLY' | 'FULL_IMAGE_CROP' | 'SMART_HYBRID';

export interface IStagedQuestion {
  id: string;
  checked: boolean;
  pageNumber?: number;
  pageDataUrl?: string | null;
  question_text: string;
  type: 'MCQ' | 'ESSAY';
  options: string[];
  correct_option_index: number;
  points: number;
  has_geometry_diagram: boolean;
  box_2d?: [number, number, number, number];
  localCropBlob?: Blob | null;
  localCropPreviewUrl?: string | null;
  question_image_url?: string | null;
}

export interface IConfirmationDialogState {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
}

export interface ICachedFileSession {
  fileName: string;
  fileType: 'pdf' | 'image';
  file: File | Blob | null;
  pageNumber: number;
  canvas: HTMLCanvasElement | null;
  dataUrl: string | null;
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

