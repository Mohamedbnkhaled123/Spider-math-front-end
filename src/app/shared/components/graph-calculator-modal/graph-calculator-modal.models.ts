/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12: Graphing Calculator Modal Models & Strict Desmos Engine Contract
 */

export type CalculatorType = 'NONE' | 'DESMOS';

export interface CalculatorConfig {
  type: CalculatorType;
  titleAr: string;
  titleEn: string;
  embedUrl: string;
  isSupported: boolean;
  features: string[];
}

export interface CalculatorPreset {
  labelAr: string;
  labelEn: string;
  latex: string;
}

export interface CalculatorCoordinates {
  x: number;
  y: number;
}
