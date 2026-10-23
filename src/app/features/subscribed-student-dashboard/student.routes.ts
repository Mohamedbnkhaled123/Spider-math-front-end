import { Routes } from '@angular/router';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./student-overview/student-overview.component').then(
        m => m.StudentOverviewComponent
      ),
    title: 'Student Dashboard | لوحة تحكم الطالب المشترك — سبايدر ماث'
  },
  {
    path: 'units/:id',
    loadComponent: () =>
      import('./unit-study-workspace/unit-study-workspace.component').then(
        m => m.UnitStudyWorkspaceComponent
      ),
    title: 'Unit Study Workspace | استوديو مذاكرة الوحدة — سبايدر ماث'
  },
  {
    path: 'assessments/:id',
    loadComponent: () =>
      import('./assessment-attempt-view/assessment-attempt-view.component').then(
        m => m.AssessmentAttemptViewComponent
      ),
    title: 'Assessment Attempt | تقييم المحاضرة التفاعلي — سبايدر ماث'
  },
  {
    path: 'submissions/:id/feedback',
    loadComponent: () =>
      import(
        './submission-feedback-viewer/submission-feedback-viewer.component'
      ).then(m => m.SubmissionFeedbackViewerComponent),
    title: 'Submission Feedback | تقرير درجات وتقييم المعلمة — سبايدر ماث'
  }
];
