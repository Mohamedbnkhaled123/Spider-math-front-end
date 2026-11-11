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

export interface HonorBoardItem {
  id?: string;
  rank: number;
  nameAr: string;
  nameEn?: string;
  systemAr: string;
  systemEn?: string;
  achievementAr: string;
  achievementEn?: string;
  locationAr?: string;
  locationEn?: string;
  xp?: number;
  accuracy?: number;
  badgeAr?: string;
  badgeEn?: string;
  avatarUrl?: string;
  is_active?: boolean;
}

export interface CmsConfigAdminItem {
  // Announcement
  announcementBannerText?: string;
  announcementBannerTextEn?: string;
  isAnnouncementActive?: boolean;

  // Hero Section
  heroHeadlineAr?: string;
  heroHeadlineEn?: string;
  heroSubheadlineAr?: string;
  heroSubheadlineEn?: string;
  heroBadgeAr?: string;
  heroBadgeEn?: string;
  heroCtaPrimaryAr?: string;
  heroCtaPrimaryEn?: string;
  heroCtaSecondaryAr?: string;
  heroCtaSecondaryEn?: string;
  heroVideoUrl?: string;

  // Teacher Profile
  teacherNameAr?: string;
  teacherNameEn?: string;
  teacherTitleAr?: string;
  teacherTitleEn?: string;
  teacherBioAr?: string;
  teacherBioEn?: string;
  teacherQualificationsAr?: string[];
  teacherQualificationsEn?: string[];
  teacherWhatsappCtaAr?: string;
  teacherWhatsappCtaEn?: string;

  // Curriculum Section
  curriculumBadgeAr?: string;
  curriculumBadgeEn?: string;
  curriculumTitleAr?: string;
  curriculumTitleEn?: string;
  curriculumSubtitleAr?: string;
  curriculumSubtitleEn?: string;

  // Placement Test Section
  placementBadgeAr?: string;
  placementBadgeEn?: string;
  placementHeadlineAr?: string;
  placementHeadlineEn?: string;
  placementSubtitleAr?: string;
  placementSubtitleEn?: string;
  placementFeature1Ar?: string;
  placementFeature1En?: string;
  placementFeature2Ar?: string;
  placementFeature2En?: string;
  placementFeature3Ar?: string;
  placementFeature3En?: string;
  placementCtaAr?: string;
  placementCtaEn?: string;

  // Schedules Section
  scheduleBadgeAr?: string;
  scheduleBadgeEn?: string;
  scheduleTitleAr?: string;
  scheduleTitleEn?: string;
  scheduleSubtitleAr?: string;
  scheduleSubtitleEn?: string;

  // Pricing Section
  pricingBadgeAr?: string;
  pricingBadgeEn?: string;
  pricingTitleAr?: string;
  pricingTitleEn?: string;
  pricingSubtitleAr?: string;
  pricingSubtitleEn?: string;

  // Hall of Fame / Honor Board
  hallOfFameBadgeAr?: string;
  hallOfFameBadgeEn?: string;
  hallOfFameTitleAr?: string;
  hallOfFameTitleEn?: string;
  hallOfFameSubtitleAr?: string;
  hallOfFameSubtitleEn?: string;
  honorBoardList?: HonorBoardItem[];

  // General & Contact
  supportWhatsapp?: string;
  supportTelegram?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  activeAcademicYear?: string;
  activeAcademicTerm?: 'TERM_1' | 'TERM_2';
  schedulesTable?: ScheduleRow[];
  landingUnitIds?: string[];
}
