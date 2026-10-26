import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SuperAdminDashboardComponent } from './super-admin-dashboard.component';

describe('SuperAdminDashboardComponent', () => {
  let component: SuperAdminDashboardComponent;
  let fixture: ComponentFixture<SuperAdminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperAdminDashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SuperAdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the admin dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize admin signals properly as arrays', () => {
    expect(Array.isArray(component.pendingDevices())).toBeTrue();
    expect(Array.isArray(component.pendingGrading())).toBeTrue();
    expect(Array.isArray(component.unitsList())).toBeTrue();
    expect(Array.isArray(component.leadsList())).toBeTrue();
  });
});
