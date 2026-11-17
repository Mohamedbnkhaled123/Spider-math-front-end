import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import {
  CANONICAL_CURRICULUM_TREE,
  CurriculumCode,
  AcademicTermCode,
  GULF_COUNTRIES_DATA,
  findGulfCountry,
  INTERNATIONAL_DIVISIONS_DATA,
  findInternationalDivision,
  curriculumHasTerms
} from '../../../core/constants/curriculum-tree.constant';
import { EGYPT_GOVERNORATES } from '../../../core/constants/governorates.constant';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';
import {
  validatePhoneNumber,
  arePhoneNumbersIdentical,
  getPhonePlaceholderByCountry
} from '../../../core/utils/phone-validator.util';

@Component({
  selector: 'app-student-profile-completion',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './student-profile-completion.component.html',
  styleUrl: './student-profile-completion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentProfileCompletionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly discoveryService = inject(PublicDiscoveryService);
  private readonly authService = inject(AuthService);
  readonly langService = inject(LangService);

  // Form Signals
  readonly fullName = signal<string>('');
  readonly phone = signal<string>('');
  readonly parentPhone = signal<string>('');
  readonly curriculum = signal<CurriculumCode>('EGYPTIAN');
  readonly gradeLevel = signal<string>('SEC_3');
  readonly academicTerm = signal<AcademicTermCode>('TERM_1');
  readonly country = signal<string>('EG');
  readonly governorate = signal<string>('CAIRO');

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly issuedHaCode = signal<string | null>(null);

  // Constants & Sub-divisions
  readonly curriculumTree = CANONICAL_CURRICULUM_TREE;
  readonly egyptGovernorates = EGYPT_GOVERNORATES;
  readonly gulfCountries = GULF_COUNTRIES_DATA;
  readonly intlDivisions = INTERNATIONAL_DIVISIONS_DATA;
  readonly selectedIntlDivision = signal<'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'>('AMERICAN_CURRICULUM');

  // Computed Properties
  readonly isEgypt = computed<boolean>(() => this.country() === 'EG');
  readonly hasTerms = computed<boolean>(() => curriculumHasTerms(this.curriculum()));

  readonly phonePlaceholder = computed<string>(() =>
    getPhonePlaceholderByCountry(this.country())
  );

  readonly availableGrades = computed(() => {
    const curr = this.curriculum();
    const subFilter = curr === 'GULF'
      ? this.country()
      : (curr === 'INTERNATIONAL' ? this.selectedIntlDivision() : undefined);
    return this.discoveryService.getAvailableGradesForCurriculum(curr, true, subFilter);
  });

  ngOnInit(): void {
    this.discoveryService.loadActiveGradesAndTracks().subscribe();
    this.discoveryService.getLandingData().subscribe(data => {
      if (data?.activeAcademicTerm) {
        this.academicTerm.set(data.activeAcademicTerm);
      }
    });
    const user = this.authService.currentUser();
    if (user?.full_name && !this.fullName()) {
      this.fullName.set(user.full_name);
    }
    if (user?.phone && !this.phone()) {
      this.phone.set(user.phone);
    }

    this.route.queryParams.subscribe(params => {
      if (params['fullName']) {
        this.fullName.set(params['fullName']);
      }
      if (params['phone']) {
        this.phone.set(params['phone']);
      }
      if (params['curriculum']) {
        this.curriculum.set(params['curriculum'] as CurriculumCode);
      }
      if (params['gradeLevel']) {
        this.gradeLevel.set(params['gradeLevel']);
      }
    });
  }

  onCurriculumChange(code: CurriculumCode): void {
    this.curriculum.set(code);
    if (code === 'GULF') {
      if (!['SA', 'QA', 'AE', 'KW'].includes(this.country())) {
        this.country.set('SA');
      }
    } else if (code === 'EGYPTIAN') {
      this.country.set('EG');
    }
    const grades = this.availableGrades();
    if (grades.length > 0) {
      this.gradeLevel.set(grades[0].code);
    } else {
      const subFilter = code === 'GULF'
        ? this.country()
        : (code === 'INTERNATIONAL' ? this.selectedIntlDivision() : undefined);
      const fallback = this.discoveryService.getAvailableGradesForCurriculum(code, false, subFilter);
      this.gradeLevel.set(fallback.length > 0 ? fallback[0].code : '');
    }
  }

  onGulfCountryChange(countryCode: string): void {
    this.country.set(countryCode);
    const grades = this.availableGrades();
    if (grades.length > 0) {
      this.gradeLevel.set(grades[0].code);
    }
  }

  onIntlDivisionChange(divCode: 'AMERICAN_CURRICULUM' | 'BRITISH_CURRICULUM'): void {
    this.selectedIntlDivision.set(divCode);
    const grades = this.availableGrades();
    if (grades.length > 0) {
      this.gradeLevel.set(grades[0].code);
    }
  }

  submitProfile(): void {
    const name = this.fullName().trim();
    const stPhone = this.phone().trim();
    const prPhone = this.parentPhone().trim();
    const selectedCountry = this.country();

    // 1. Full Name Validation
    if (!name || name.length < 3) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'الاسم لا يقل عن 3 أحرف'
          : 'Name must be at least 3 characters'
      );
      return;
    }

    // 2. Student Phone Country Validation
    const stVal = validatePhoneNumber(stPhone, selectedCountry);
    if (!stVal.isValid) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? `هاتف الطالب: ${stVal.messageAr}`
          : `Student phone: ${stVal.messageEn}`
      );
      return;
    }

    // 3. Parent Phone Country Validation
    const prVal = validatePhoneNumber(prPhone, selectedCountry);
    if (!prVal.isValid) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? `هاتف ولي الأمر: ${prVal.messageAr}`
          : `Parent phone: ${prVal.messageEn}`
      );
      return;
    }

    // 4. Strict Requirement: Parent phone CANNOT be identical to Student phone
    if (arePhoneNumbersIdentical(stPhone, prPhone, selectedCountry)) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'يجب اختلاف رقم ولي الأمر عن الطالب.'
          : 'Parent phone must differ from student phone.'
      );
      return;
    }

    // 5. Egyptian Governorate Validation
    if (this.isEgypt() && !this.governorate()) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'اختر المحافظة'
          : 'Select governorate'
      );
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.discoveryService.completeStudentProfile({
      fullName: name,
      phone: stPhone,
      parentPhone: prPhone,
      curriculum: this.curriculum(),
      gradeLevel: this.gradeLevel(),
      academicTerm: this.academicTerm(),
      country: selectedCountry,
      governorate: this.isEgypt() ? this.governorate() : null
    }).subscribe({
      next: res => {
        this.isSubmitting.set(false);
        this.issuedHaCode.set(res.studentHaCode);

        // Update or establish active student auth session
        const studentUser = {
          _id: res.user?._id || ('usr_' + res.studentHaCode),
          student_ha_code: res.studentHaCode,
          full_name: name,
          email: res.user?.email || `${res.studentHaCode.toLowerCase()}@spidermath.edu`,
          phone: stPhone,
          role: 'STUDENT' as const,
          curriculum: this.curriculum(),
          grade_level: this.gradeLevel(),
          academic_term: this.academicTerm(),
          governorate: this.isEgypt() ? this.governorate() : undefined,
          has_active_subscription: false,
          total_xp: 50
        };

        const finalToken = res.token || this.authService.currentToken() || ('jwt_student_' + res.studentHaCode);
        this.authService.setSession(finalToken, studentUser);

        // Auto-navigate to inactive student portal after 2.5s celebratory badge display
        setTimeout(() => {
          this.goToInactivePortal();
        }, 2500);
      },
      error: err => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err?.error?.error?.message ||
          err?.error?.message ||
          (this.langService.isArabic() ? 'تعذر الحفظ. تحقق من البيانات.' : 'Failed to save. Check data.')
        );
      }
    });
  }

  goToInactivePortal(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/inactive-student-portal']);
    }
  }

  openWhatsAppActivation(): void {
    const haCode = this.issuedHaCode() || 'HA-NEW';
    const name = this.fullName();
    const curr = this.curriculum();
    const grade = this.gradeLevel();

    const msg = encodeURIComponent(
      `مرحباً م/ هبة عبدالوهاب، قمت بالتسجيل في منصة Spider Math وأرغب في تفعيل اشتراكي.\nكود الطالب: ${haCode}\nالاسم: ${name}\nالمسار: ${curr} (${grade})`
    );
    window.open(`https://wa.me/201000000000?text=${msg}`, '_blank');
  }
}
