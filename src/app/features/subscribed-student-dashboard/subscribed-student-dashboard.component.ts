import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { LangService } from '../../core/seo-theme-i18n/lang.service';

@Component({
  selector: 'app-subscribed-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscribed-student-dashboard.component.html',
  styleUrl: './subscribed-student-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscribedStudentDashboardComponent {
  readonly authService = inject(AuthService);
  readonly langService = inject(LangService);
}
