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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AppIconComponent } from '../../../shared/components/app-icon/app-icon.component';
import {
  CANONICAL_CURRICULUM_TREE,
  CurriculumCode,
  AcademicTermCode
} from '../../../core/constants/curriculum-tree.constant';
import { EGYPT_GOVERNORATES } from '../../../core/constants/governorates.constant';
import { PublicDiscoveryService } from '../../../core/services/public-discovery.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LangService } from '../../../core/seo-theme-i18n/lang.service';

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

  // Constants
  readonly curriculumTree = CANONICAL_CURRICULUM_TREE;
  readonly egyptGovernorates = EGYPT_GOVERNORATES;

  // Computed Properties
  readonly isEgypt = computed<boolean>(() => this.country() === 'EG');

  readonly availableGrades = computed(() => {
    const curr = this.curriculumTree.find(c => c.code === this.curriculum());
    return curr?.grades ?? this.curriculumTree[0].grades;
  });

  ngOnInit(): void {
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
    const grades = this.availableGrades();
    if (grades.length > 0) {
      this.gradeLevel.set(grades[0].code);
    }
  }

  submitProfile(): void {
    const name = this.fullName().trim();
    const stPhone = this.phone().trim();
    const prPhone = this.parentPhone().trim();

    if (!name || name.length < 3) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'يرجى كتابة الاسم ثلاثياً بشكل صحيح'
          : 'Please enter valid student full name'
      );
      return;
    }

    if (!stPhone || stPhone.length < 8) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'يرجى إدخال رقم هاتف الطالب الصحيح'
          : 'Please enter valid student phone number'
      );
      return;
    }

    if (!prPhone || prPhone.length < 8) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'يرجى إدخال رقم هاتف ولي الأمر لمتابعة الدرجات والتقارير'
          : 'Please enter parent phone number for academic reporting'
      );
      return;
    }

    if (this.isEgypt() && !this.governorate()) {
      this.errorMessage.set(
        this.langService.isArabic()
          ? 'يرجى اختيار المحافظة للطلاب المقيمين في مصر'
          : 'Please select governorate for students in Egypt'
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
      country: this.country(),
      governorate: this.isEgypt() ? this.governorate() : null
    }).subscribe({
      next: res => {
        this.isSubmitting.set(false);
        this.issuedHaCode.set(res.studentHaCode);

        // Update active auth session
        this.authService.updateCurrentUser({
          student_ha_code: res.studentHaCode,
          full_name: name,
          curriculum: this.curriculum(),
          grade_level: this.gradeLevel(),
          academic_term: this.academicTerm(),
          governorate: this.isEgypt() ? this.governorate() : undefined
        });
      },
      error: err => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err?.error?.message ||
          (this.langService.isArabic() ? 'تعذر حفظ البيانات. يرجى المحاولة لاحقاً.' : 'Failed to save student profile.')
        );
      }
    });
  }

  goToInactivePortal(): void {
    this.router.navigate(['/inactive-student-portal']);
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
