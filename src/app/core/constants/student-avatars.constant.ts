/**
 * Spider Math Educational Platform (v2.2)
 * Student Preset Avatars Constant
 * High-performance compressed WebP avatars optimized for students, parents, teacher studio and honor roll.
 */

export interface StudentPresetAvatar {
  id: string;
  labelAr: string;
  labelEn: string;
  url: string;
}

export const STUDENT_PRESET_AVATARS: readonly StudentPresetAvatar[] = [
  {
    id: 'student_av_01',
    labelAr: 'رائدة الفضاء وعالمة الفلك',
    labelEn: 'Cosmic Explorer & Astronomer',
    url: '/assets/avatars/student-avatar-01.webp'
  },
  {
    id: 'student_av_02',
    labelAr: 'أميرة الرياضيات والورد',
    labelEn: 'Math Princess & Blossom',
    url: '/assets/avatars/student-avatar-02.webp'
  },
  {
    id: 'student_av_03',
    labelAr: 'مستكشف النجوم اللامع',
    labelEn: 'Bright Star Explorer',
    url: '/assets/avatars/student-avatar-03.webp'
  },
  {
    id: 'student_av_04',
    labelAr: 'أميرة ديسموس الذهبية',
    labelEn: 'Golden Desmos Analyst',
    url: '/assets/avatars/student-avatar-04.webp'
  },
  {
    id: 'student_av_05',
    labelAr: 'فارس الجبر المخملي',
    labelEn: 'Velvet Algebra Scholar',
    url: '/assets/avatars/student-avatar-05.webp'
  },
  {
    id: 'student_av_06',
    labelAr: 'عبقرية الهندسة الفراغية',
    labelEn: 'Solid Geometry Master',
    url: '/assets/avatars/student-avatar-06.webp'
  },
  {
    id: 'student_av_07',
    labelAr: 'سيدة التفاضل والجليد',
    labelEn: 'Frost Calculus Prodigy',
    url: '/assets/avatars/student-avatar-07.webp'
  },
  {
    id: 'student_av_08',
    labelAr: 'بطلة سبايدر ماث الفيروزية',
    labelEn: 'Turquoise Spider Math Hero',
    url: '/assets/avatars/student-avatar-08.webp'
  },
  {
    id: 'student_av_09',
    labelAr: 'كابتن الرياضيات المغامر',
    labelEn: 'Adventurous Math Captain',
    url: '/assets/avatars/student-avatar-09.webp'
  },
  {
    id: 'student_av_10',
    labelAr: 'حارس الطبيعة والأرقام',
    labelEn: 'Forest Numbers Guardian',
    url: '/assets/avatars/student-avatar-10.webp'
  },
  {
    id: 'student_av_11',
    labelAr: 'عالم الفيزياء الفلكية الصغير',
    labelEn: 'Junior Astrophysics Scholar',
    url: '/assets/avatars/student-avatar-11.webp'
  },
  {
    id: 'student_av_12',
    labelAr: 'ملكة المعادلات الخضراء',
    labelEn: 'Emerald Equations Queen',
    url: '/assets/avatars/student-avatar-12.webp'
  },
  {
    id: 'student_av_13',
    labelAr: 'قائد التميز الأكاديمي',
    labelEn: 'Academic Elite Leader',
    url: '/assets/avatars/student-avatar-13.webp'
  }
] as const;

export const DEFAULT_STUDENT_AVATAR_URL = STUDENT_PRESET_AVATARS[0].url;

