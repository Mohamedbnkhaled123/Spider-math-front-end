/**
 * Spider Math Educational Platform (v2.2)
 * Phase 14: Leads CRM & Landing Page CMS Models
 * 
 * Strict Constraint: Pure CMS without any SEO meta configuration fields (RULES.md Section 1.3 & 5.6).
 */

export interface LeadAdminItem {
  readonly id: string;
  readonly fullName: string;
  readonly studentPhone: string;
  readonly parentPhone: string;
  readonly curriculum: string;
  readonly gradeLevel: string;
  readonly governorate: string;
  readonly placementScore?: number | null;
  readonly status: 'NEW' | 'CONTACTED' | 'REGISTERED';
  readonly createdAt: string;
}

export interface ScheduleRow {
  curriculum: string;
  gradeLevel: string;
  term: string;
  dayOfWeek: string;
  timeSlot: string;
  lectureSubject: string;
}

export interface CmsConfigAdminItem {
  heroHeadlineAr: string;
  heroSubheadlineAr: string;
  announcementBannerText: string;
  isAnnouncementActive: boolean;
  supportWhatsapp: string;
  activeAcademicYear: string;
  schedulesTable: ScheduleRow[];
}
