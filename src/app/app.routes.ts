import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { activeStudentGuard } from './core/guards/active-student.guard';
import { deviceApprovedGuard } from './core/guards/device-approved.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/guest-portal/landing-page/landing-page.component').then(
        m => m.LandingPageComponent
      ),
    title: 'Spider Math Platform | منصة سبايدر ماث التعليمية'
  },
  {
    path: 'pending-device-approval',
    loadComponent: () =>
      import(
        './features/auth-device/pending-device-approval/pending-device-approval.component'
      ).then(m => m.PendingDeviceApprovalComponent),
    title: 'Device Pending Approval | الجهاز بانتظار الاعتماد'
  },
  {
    path: 'inactive-student-portal',
    canActivate: [authGuard, deviceApprovedGuard],
    loadComponent: () =>
      import(
        './features/inactive-student-portal/inactive-student-portal.component'
      ).then(m => m.InactiveStudentPortalComponent),
    title: 'Inactive Student Portal | بوابة الطالب غير المشترك'
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
