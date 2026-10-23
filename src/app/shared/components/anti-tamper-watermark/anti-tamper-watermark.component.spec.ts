import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AntiTamperWatermarkComponent } from './anti-tamper-watermark.component';

describe('AntiTamperWatermarkComponent', () => {
  let component: AntiTamperWatermarkComponent;
  let fixture: ComponentFixture<AntiTamperWatermarkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AntiTamperWatermarkComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AntiTamperWatermarkComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('watermarkText', 'Mohamed Khaled | HA1001 | +201000000000');
    fixture.detectChanges();
  });

  it('should create the AntiTamperWatermarkComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render the dynamic watermark text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('HA1001');
  });

  it('should randomize coordinates within valid boundaries', () => {
    const pos = component.position();
    expect(pos.top).toContain('%');
    expect(pos.left).toContain('%');
    expect(pos.rotate).toContain('deg');
  });
});
