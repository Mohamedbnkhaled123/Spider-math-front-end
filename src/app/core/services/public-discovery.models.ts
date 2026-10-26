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

export interface ITestimonial {
  _id: string;
  studentNameAr: string;
  studentNameEn: string;
  curriculum: CurriculumCode;
  gradeLevel: string;
  score: string;
  quoteAr: string;
  quoteEn: string;
  avatarUrl?: string;
  academicYear: string;
}

export interface IPublicLandingData {
  heroHeadlineAr?: string;
  heroHeadlineEn?: string;
  heroSubheadlineAr?: string;
  heroSubheadlineEn?: string;
  announcementBannerText?: string;
  isAnnouncementActive?: boolean;
  activeAcademicYear?: string;
  teacherBio: ITeacherBio;
  schedules: IScheduleItem[];
  pricingPackages: IPricingPackage[];
  testimonials: ITestimonial[];
  whatsappSupportNumber: string;
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
