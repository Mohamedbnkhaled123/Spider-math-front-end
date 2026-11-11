import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { activeStudentGuard } from './core/guards/active-student.guard';
import { deviceApprovedGuard } from './core/guards/device-approved.guard';
import { rootRedirectGuard } from './core/guards/root-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [rootRedirectGuard],
    loadComponent: () =>
      import('./features/guest-portal/landing-home/landing-home.component').then(
        m => m.LandingHomeComponent
      ),
    title: 'Spider Math Platform | منصة سبايدر ماث التعليمية'
  },
  {
    path: 'landing',
    loadComponent: () =>
      import('./features/guest-portal/landing-home/landing-home.component').then(
        m => m.LandingHomeComponent
      ),
    title: 'Spider Math Platform | منصة سبايدر ماث التعليمية'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login-page/login-page.component').then(
        m => m.LoginPageComponent
      ),
    title: 'تسجيل الدخول ومحاكاة الأدوار | Spider Math Platform'
  },
  {
    path: 'parent-login',
    loadComponent: () =>
      import('./features/auth/login-page/login-page.component').then(
        m => m.LoginPageComponent
      ),
    title: 'تسجيل دخول ولي الأمر | Spider Math Platform'
  },
  {
    path: 'placement-test',
    loadComponent: () =>
      import(
        './features/guest-portal/placement-exam-runner/placement-exam-runner.component'
      ).then(m => m.PlacementExamRunnerComponent),
    title: 'Placement Assessment | امتحان تحديد المستوى التفاعلي'
  },
  {
    path: 'topics',
    loadComponent: () =>
      import(
        './features/guest-portal/seo-topics-index/seo-topics-index.component'
      ).then(m => m.SeoTopicsIndexComponent),
    title: 'فهرس مواضيع ومناهج سبايدر ماث | Spider Math Topics & Curricula'
  },
  {
    path: 'topics/:slug',
    redirectTo: 'topic/:slug',
    pathMatch: 'full'
  },
  {
    path: 'topic/:slug',
    loadComponent: () =>
      import(
        './features/guest-portal/seo-keyword-page/seo-keyword-page.component'
      ).then(m => m.SeoKeywordPageComponent)
  },
  {
    path: 'complete-profile',
    loadComponent: () =>
      import(
        './features/guest-portal/student-profile-completion/student-profile-completion.component'
      ).then(m => m.StudentProfileCompletionComponent),
    title: 'Complete Student Profile | استكمال بيانات الطالب'
  },
  {
    path: 'pending-device-approval',
    loadComponent: () =>
      import(
        './features/inactive-student-portal/pending-device-approval/pending-device-approval.component'
      ).then(m => m.PendingDeviceApprovalComponent),
    title: 'Device Pending Approval | الجهاز بانتظار الاعتماد'
  },
  {
    path: 'device-pending',
    redirectTo: 'pending-device-approval',
    pathMatch: 'full'
  },
  {
    path: 'inactive-student-portal',
    canActivate: [authGuard, roleGuard(['STUDENT']), deviceApprovedGuard],
    loadComponent: () =>
      import(
        './features/inactive-student-portal/inactive-dashboard/inactive-dashboard.component'
      ).then(m => m.InactiveDashboardComponent),
    title: 'Inactive Student Portal | بوابة الطالب غير المشترك'
  },
  {
    path: 'inactive-student',
    redirectTo: 'inactive-student-portal',
    pathMatch: 'full'
  },
  {
    path: 'student',
    canActivate: [authGuard, roleGuard(['STUDENT']), deviceApprovedGuard, activeStudentGuard],
    loadChildren: () =>
      import('./features/subscribed-student-dashboard/student.routes').then(
        m => m.STUDENT_ROUTES
      )
  },
  {
    path: 'parent',
    canActivate: [authGuard, roleGuard(['PARENT']), deviceApprovedGuard],
    loadChildren: () =>
      import('./features/parent-dashboard/parent.routes').then(
        m => m.PARENT_ROUTES
      )
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN']), deviceApprovedGuard],
    loadChildren: () =>
      import('./features/super-admin-dashboard/admin.routes').then(
        m => m.ADMIN_ROUTES
      )
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(
        m => m.NotFoundComponent
      ),
    title: 'Page Not Found | الصفحة غير موجودة'
  }
];
