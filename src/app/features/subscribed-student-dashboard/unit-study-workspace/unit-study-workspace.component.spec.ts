import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { UnitStudyWorkspaceComponent } from './unit-study-workspace.component';

describe('UnitStudyWorkspaceComponent', () => {
  let component: UnitStudyWorkspaceComponent;
  let fixture: ComponentFixture<UnitStudyWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitStudyWorkspaceComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitStudyWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch between video and PDF tabs', () => {
    expect(component.activeTab()).toBe('video');
    component.setTab('pdf');
    expect(component.activeTab()).toBe('pdf');
  });

  it('should select a lecture and compute active lecture', () => {
    component.selectLecture('lec_diff_1');
    expect(component.selectedLectureId()).toBe('lec_diff_1');
    expect(component.activeLecture().order).toBe(1);
  });
});
