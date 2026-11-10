export const SUPPORTED_COUNTRIES = ['EG', 'SA', 'AE', 'KW', 'QA', 'OTHER'] as const;
export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

export interface CountryOption {
  readonly code: SupportedCountry;
  readonly nameAr: string;
  readonly nameEn: string;
  readonly dialCode: string;
}

export interface CountryGroup {
  readonly id: 'EG' | 'GCC' | 'OTHER';
  readonly labelAr: string;
  readonly labelEn: string;
  readonly countries: readonly CountryOption[];
}

export const COUNTRY_GROUPS: readonly CountryGroup[] = [
  {
    id: 'EG',
    labelAr: 'جمهورية مصر العربية',
    labelEn: 'Arab Republic of Egypt',
    countries: [
      { code: 'EG', nameAr: 'جمهورية مصر العربية (+20)', nameEn: 'Egypt (+20)', dialCode: '+20' }
    ]
  },
  {
    id: 'GCC',
    labelAr: 'دول الخليج العربي',
    labelEn: 'Gulf Countries (GCC)',
    countries: [
      { code: 'SA', nameAr: 'المملكة العربية السعودية (+966)', nameEn: 'Saudi Arabia (+966)', dialCode: '+966' },
      { code: 'AE', nameAr: 'الإمارات العربية المتحدة (+971)', nameEn: 'United Arab Emirates (+971)', dialCode: '+971' },
      { code: 'KW', nameAr: 'دولة الكويت (+965)', nameEn: 'Kuwait (+965)', dialCode: '+965' },
      { code: 'QA', nameAr: 'دولة قطر (+974)', nameEn: 'Qatar (+974)', dialCode: '+974' }
    ]
  },
  {
    id: 'OTHER',
    labelAr: 'دول أخرى',
    labelEn: 'Other Countries',
    countries: [
      { code: 'OTHER', nameAr: 'دولة أخرى', nameEn: 'Other Country', dialCode: '' }
    ]
  }
] as const;

/**
 * Returns available country groups based on the selected curriculum track.
 * When curriculum is 'GULF', Egypt ('EG') is strictly excluded so only GCC and OTHER countries are selectable.
 */
export function getAvailableCountryGroups(curriculum?: string | null): CountryGroup[] {
  if (curriculum === 'GULF') {
    return COUNTRY_GROUPS.filter(g => g.id !== 'EG');
  }
  return [...COUNTRY_GROUPS];
}

export interface PhoneValidationResult {
  isValid: boolean;
  messageAr: string;
  messageEn: string;
}

/**
 * Validates a mobile phone number according to the selected country's telecom regulations.
 */
export function validatePhoneNumber(phone: string, country: string = 'EG'): PhoneValidationResult {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return {
      isValid: false,
      messageAr: 'يرجى إدخال رقم الهاتف.',
      messageEn: 'Phone number is required.'
    };
  }

  const clean = phone.replace(/[\s\-\(\)\.]/g, '');

  switch (country.toUpperCase()) {
    case 'EG': {
      // Egypt: Vodafone (010), Etisalat (011), Orange (012), WE (015) - 11 digits
      // Accepts: 010..., 011..., 012..., 015..., +201..., 00201..., 201...
      const egRegex = /^(\+20|0020|20)?0?1[0125]\d{8}$/;
      if (!egRegex.test(clean)) {
        return {
          isValid: false,
          messageAr: 'رقم الهاتف غير صالح لجمهورية مصر العربية. يجب أن يتكون من 11 رقماً ويبدأ بـ (010 أو 011 أو 012 أو 015).',
          messageEn: 'Invalid Egyptian phone number. Must be 11 digits starting with (010, 011, 012, or 015).'
        };
      }
      return { isValid: true, messageAr: '', messageEn: '' };
    }

    case 'SA': {
      // Saudi Arabia: starts with 05 (10 digits) or +9665 (9 digits after country code)
      const saRegex = /^(\+966|00966|966)?0?5\d{8}$/;
      if (!saRegex.test(clean)) {
        return {
          isValid: false,
          messageAr: 'رقم الهاتف غير صالح للمملكة العربية السعودية. يجب أن يتكون من 10 أرقام ويبدأ بـ (05) أو (+9665).',
          messageEn: 'Invalid Saudi phone number. Must be 10 digits starting with (05) or (+9665).'
        };
      }
      return { isValid: true, messageAr: '', messageEn: '' };
    }

    case 'AE': {
      // UAE: starts with 050, 052, 054, 055, 056, 058 (10 digits) or +9715...
      const aeRegex = /^(\+971|00971|971)?0?5[024568]\d{7}$/;
      if (!aeRegex.test(clean)) {
        return {
          isValid: false,
          messageAr: 'رقم الهاتف غير صالح لدولة الإمارات. يجب أن يتكون من 10 أرقام ويبدأ بـ (050، 052، 054، 055، 056، 058).',
          messageEn: 'Invalid UAE phone number. Must be 10 digits starting with (050, 052, 054, 055, 056, 058).'
        };
      }
      return { isValid: true, messageAr: '', messageEn: '' };
    }

    case 'KW': {
      // Kuwait: 8 digits starting with 5, 6, or 9
      const kwRegex = /^(\+965|00965|965)?[569]\d{7}$/;
      if (!kwRegex.test(clean)) {
        return {
          isValid: false,
          messageAr: 'رقم الهاتف غير صالح لدولة الكويت. يجب أن يتكون من 8 أرقام ويبدأ بـ (5، 6، 9) أو (+965).',
          messageEn: 'Invalid Kuwaiti phone number. Must be 8 digits starting with (5, 6, 9) or (+965).'
        };
      }
      return { isValid: true, messageAr: '', messageEn: '' };
    }

    case 'QA': {
      // Qatar: 8 digits starting with 3, 5, 6, or 7
      const qaRegex = /^(\+974|00974|974)?[3567]\d{7}$/;
      if (!qaRegex.test(clean)) {
        return {
          isValid: false,
          messageAr: 'رقم الهاتف غير صالح لدولة قطر. يجب أن يتكون من 8 أرقام ويبدأ بـ (3، 5، 6، 7) أو (+974).',
          messageEn: 'Invalid Qatari phone number. Must be 8 digits starting with (3, 5, 6, 7) or (+974).'
        };
      }
      return { isValid: true, messageAr: '', messageEn: '' };
    }

    case 'OTHER':
    default: {
      // International E.164: + followed by 8 to 15 digits or 8-15 digits
      const intlRegex = /^(\+)?\d{8,15}$/;
      if (!intlRegex.test(clean)) {
        return {
          isValid: false,
          messageAr: 'يرجى إدخال رقم هاتف دولي صحيح يتراوح بين 8 و 15 رقماً مع رمز الدولة.',
          messageEn: 'Please enter a valid international phone number (8 to 15 digits with country code).'
        };
      }
      return { isValid: true, messageAr: '', messageEn: '' };
    }
  }
}

/**
 * Normalizes a phone number to bare local digits for strict identity comparison.
 */
export function normalizePhoneForComparison(phone: string, country: string = 'EG'): string {
  if (!phone || typeof phone !== 'string') return '';
  let clean = phone.replace(/[\s\-\(\)\.]/g, '');

  switch (country.toUpperCase()) {
    case 'EG':
      clean = clean.replace(/^(\+20|0020|20)/, '');
      clean = clean.replace(/^0+/, '');
      break;
    case 'SA':
      clean = clean.replace(/^(\+966|00966|966)/, '');
      clean = clean.replace(/^0+/, '');
      break;
    case 'AE':
      clean = clean.replace(/^(\+971|00971|971)/, '');
      clean = clean.replace(/^0+/, '');
      break;
    case 'KW':
      clean = clean.replace(/^(\+965|00965|965)/, '');
      clean = clean.replace(/^0+/, '');
      break;
    case 'QA':
      clean = clean.replace(/^(\+974|00974|974)/, '');
      clean = clean.replace(/^0+/, '');
      break;
    default:
      clean = clean.replace(/^\+/, '');
      clean = clean.replace(/^0+/, '');
      break;
  }

  return clean;
}

/**
 * Returns true if student phone and parent phone are identical after normalization.
 */
export function arePhoneNumbersIdentical(studentPhone: string, parentPhone: string, country: string = 'EG'): boolean {
  const normStudent = normalizePhoneForComparison(studentPhone, country);
  const normParent = normalizePhoneForComparison(parentPhone, country);
  return Boolean(normStudent && normParent && normStudent === normParent);
}

/**
 * Provides an example placeholder based on country.
 */
export function getPhonePlaceholderByCountry(country: string = 'EG'): string {
  switch (country.toUpperCase()) {
    case 'EG':
      return 'مثال: 01012345678 أو +2010...';
    case 'SA':
      return 'مثال: 0501234567 أو +9665...';
    case 'AE':
      return 'مثال: 0501234567 أو +9715...';
    case 'KW':
      return 'مثال: 51234567 أو +965...';
    case 'QA':
      return 'مثال: 31234567 أو +974...';
    default:
      return '+1 555 123 4567';
  }
}
