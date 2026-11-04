import { CurriculumCode, AcademicTermCode } from '../constants/curriculum-tree.constant';

export interface ITermTreeItem {
  term: AcademicTermCode;
  publishedUnitsCount: number;
  hasPublishedUnits: boolean;
  hasPlacementTest: boolean;
}

export interface IGradeLevelTreeItem {
  gradeLevel: string;
  terms: ITermTreeItem[];
  hasPublishedUnits: boolean;
  totalPublishedUnitsCount: number;
  isAvailable: boolean; // Dynamic availability: true if content exists, false = 'Coming Soon'
}

export interface ICurriculumTreeItem {
  curriculum: CurriculumCode;
  gradeLevels: IGradeLevelTreeItem[];
  totalPublishedUnitsCount: number;
  hasPublishedUnits: boolean;
}

export interface ITeacherBio {
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  bioAr: string;
  bioEn: string;
  yearsOfExperience: number;
  totalStudentsTaught: number;
  avatarUrl: string;
  qualifications: string[];
}

export interface IScheduleItem {
  curriculum: CurriculumCode;
  gradeLevel: string;
  term: AcademicTermCode;
  dayOfWeekAr?: string;
  dayOfWeekEn?: string;
  dayOfWeek?: string;
  timeSlot: string;
  lectureTitleAr?: string;
  lectureTitleEn?: string;
  lectureSubject?: string;
}

export interface IPricingPackage {
  _id: string;
  curriculum: CurriculumCode;
  gradeLevel: string;
  term: AcademicTermCode;
  type: 'STUDY_UNIT' | 'FINAL_REVISION';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  priceEgp: number;
  originalPriceEgp?: number;
  featuresAr: string[];
  featuresEn: string[];
  isPopular?: boolean;
}

export interface IContactChannels {
  subscription_whatsapp?: string;
  support_whatsapp?: string;
  facebook_url?: string;
  facebook_page?: string;
  youtube_channel_url?: string;
  youtube_channel?: string;
  telegram_url?: string;
  telegram_channel?: string;
}

export interface IPublicLandingData {
  heroHeadlineAr?: string;
  heroHeadlineEn?: string;
  heroSubheadlineAr?: string;
  heroSubheadlineEn?: string;
  heroVideoUrl?: string;
  announcementBannerText?: string;
  isAnnouncementActive?: boolean;
  announcementBannerTextEn?: string;
  activeAcademicYear?: string;
  activeAcademicTerm?: AcademicTermCode;

  // Bilingual Elements
  heroBadgeAr?: string;
  heroBadgeEn?: string;
  heroCtaPrimaryAr?: string;
  heroCtaPrimaryEn?: string;
  heroCtaSecondaryAr?: string;
  heroCtaSecondaryEn?: string;

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

  curriculumBadgeAr?: string;
  curriculumBadgeEn?: string;
  curriculumTitleAr?: string;
  curriculumTitleEn?: string;
  curriculumSubtitleAr?: string;
  curriculumSubtitleEn?: string;

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

  scheduleBadgeAr?: string;
  scheduleBadgeEn?: string;
  scheduleTitleAr?: string;
  scheduleTitleEn?: string;
  scheduleSubtitleAr?: string;
  scheduleSubtitleEn?: string;

  pricingBadgeAr?: string;
  pricingBadgeEn?: string;
  pricingTitleAr?: string;
  pricingTitleEn?: string;
  pricingSubtitleAr?: string;
  pricingSubtitleEn?: string;

  teacherBio: ITeacherBio;
  schedules: IScheduleItem[];
  pricingPackages: IPricingPackage[];
  whatsappSupportNumber: string;
  contactChannels?: IContactChannels;
  landingUnitIds?: string[];
}

export interface IPlacementQuestionOption {
  option_id?: string;
  option_text: string;
}

export interface IPlacementQuestion {
  question_id: string;
  question_text: string;
  question_image_url?: string | null;
  options: IPlacementQuestionOption[];
  points: number;
  has_desmos_calculator?: boolean;
}

export interface IPlacementTestResponse {
  assessment_id: string;
  title: string;
  curriculum: CurriculumCode;
  grade_level: string;
  academic_term: AcademicTermCode;
  total_questions: number;
  time_limit_minutes: number;
  questions: IPlacementQuestion[];
  hasTest?: boolean;
}

export interface IPublicUnitSummary {
  _id: string;
  title_ar: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  curriculum: string;
  grade_level: string;
  academic_term: string;
  package_type?: string;
  price_egp?: number;
  total_lectures_count?: number;
  total_assessments_count?: number;
  is_published?: boolean;
  order_index?: number;
  isSubscribed?: boolean;
}

export interface ISubmitPlacementPayload {
  curriculum: CurriculumCode;
  gradeLevel: string;
  academicTerm: AcademicTermCode;
  answers: Array<{
    questionId: string;
    selectedOption: number;
  }>;
}

export interface ISubmitPlacementResult {
  attemptId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswersCount: number;
  isUnlocked: boolean;
}

export interface IUnlockPlacementPayload {
  fullName: string;
  phone: string;
  email?: string;
  googleId?: string;
}

export interface IUnlockPlacementResult {
  attemptId: string;
  fullName: string;
  phone: string;
  score: number;
  percentage: number;
  academicLevelBadgeAr: string;
  academicLevelBadgeEn: string;
  strengths: string[];
  weaknesses: string[];
  whatsAppAlertUrl: string;
  suggestedUnitPackages: Array<{
    unitId: string;
    title: string;
    priceEgp: number;
  }>;
}

export interface ICompleteProfilePayload {
  fullName: string;
  phone: string;
  parentPhone: string;
  curriculum: CurriculumCode;
  gradeLevel: string;
  academicTerm: AcademicTermCode;
  country: string;
  governorate?: string | null;
}

export interface ICompleteProfileResult {
  studentHaCode: string;
  token?: string;
  user: {
    _id: string;
    full_name: string;
    email: string;
    role: string;
    student_ha_code: string;
    curriculum: string;
    grade_level: string;
    academic_term: string;
    governorate?: string;
  };
}
