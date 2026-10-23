import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthRoleModalComponent } from './auth-role-modal.component';

describe('AuthRoleModalComponent', () => {
  let component: AuthRoleModalComponent;
  let fixture: ComponentFixture<AuthRoleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthRoleModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthRoleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the auth role modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should list all 5 role presets', () => {
    expect(component.rolePresets.length).toBe(5);
  });
});
