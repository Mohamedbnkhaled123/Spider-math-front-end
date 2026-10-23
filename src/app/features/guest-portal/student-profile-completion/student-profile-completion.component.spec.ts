import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { StudentProfileCompletionComponent } from './student-profile-completion.component';

describe('StudentProfileCompletionComponent', () => {
  let component: StudentProfileCompletionComponent;
  let fixture: ComponentFixture<StudentProfileCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StudentProfileCompletionComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ar: {} },
          translocoConfig: { availableLangs: ['en', 'ar'], defaultLang: 'en' }
        })
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentProfileCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the StudentProfileCompletionComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should enable governorate validation when country is EG', () => {
    component.country.set('EG');
    expect(component.isEgypt()).toBeTrue();
  });

  it('should disable governorate requirement when country is SA', () => {
    component.country.set('SA');
    expect(component.isEgypt()).toBeFalse();
  });
});
