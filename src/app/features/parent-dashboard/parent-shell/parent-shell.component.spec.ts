import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ParentShellComponent } from './parent-shell.component';

describe('ParentShellComponent', () => {
  let component: ParentShellComponent;
  let fixture: ComponentFixture<ParentShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentShellComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ParentShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the parent shell component', () => {
    expect(component).toBeTruthy();
  });

  it('should load linked children and select the first child by default', () => {
    expect(component.linkedChildren().length).toBeGreaterThan(0);
    expect(component.selectedChildId()).toBe('child-ahmed-01');
    expect(component.selectedChild()?.fullName).toBe('أحمد محمد علي');
  });

  it('should allow switching between children', () => {
    component.selectChild('child-sara-02');
    expect(component.selectedChildId()).toBe('child-sara-02');
    expect(component.selectedChild()?.fullName).toBe('سارة محمد علي');
  });

  it('should toggle link child modal', () => {
    expect(component.isLinkModalOpen()).toBeFalse();
    component.openLinkModal();
    expect(component.isLinkModalOpen()).toBeTrue();
    component.closeLinkModal();
    expect(component.isLinkModalOpen()).toBeFalse();
  });
});
