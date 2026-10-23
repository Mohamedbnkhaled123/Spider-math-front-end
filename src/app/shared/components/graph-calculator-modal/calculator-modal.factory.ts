import { CalculatorConfig, CalculatorType } from './graph-calculator-modal.models';

/**
 * Spider Math Educational Platform (v2.2)
 * Phase 12: Calculator Modal Factory
 * 
 * Factory resolving strictly 'NONE' or 'DESMOS' interactive graphing embeds.
 * CRITICAL ARCHITECTURAL CONSTRAINT:
 * GeoGebra is completely excluded from Spider Math platform to maintain
 * clean curriculum alignment, predictable load latency, and zero licensing friction.
 */
export class CalculatorModalFactory {
  private static readonly DESMOS_CONFIG: CalculatorConfig = {
    type: 'DESMOS',
    titleAr: 'آلة ديسموس البيانية المعتمدة (Desmos)',
    titleEn: 'Official Desmos Graphing Calculator',
    embedUrl: 'https://www.desmos.com/calculator?embed',
    isSupported: true,
    features: ['graphing', 'table', 'keypad', 'functions', 'derivatives', 'integrals']
  };

  private static readonly NONE_CONFIG: CalculatorConfig = {
    type: 'NONE',
    titleAr: 'الآلة الحاسبة غير مفعلة',
    titleEn: 'Calculator Disabled',
    embedUrl: '',
    isSupported: false,
    features: []
  };

  /**
   * Resolves configuration for the requested calculator type.
   * Explicitly throws an error if GeoGebra or any unsupported engine is supplied.
   */
  static resolveCalculator(type: string | CalculatorType): CalculatorConfig {
    const normalized = (type || 'NONE').toUpperCase().trim();

    if (normalized === 'GEOGEBRA') {
      throw new Error(
        'Architectural Violation: GeoGebra is strictly excluded from Spider Math. Only DESMOS is permitted.'
      );
    }

    if (normalized === 'DESMOS') {
      return this.DESMOS_CONFIG;
    }

    return this.NONE_CONFIG;
  }

  /**
   * Validates if a calculator type is allowed.
   */
  static isAllowed(type: string): boolean {
    const normalized = (type || '').toUpperCase().trim();
    return normalized === 'DESMOS' || normalized === 'NONE';
  }
}
