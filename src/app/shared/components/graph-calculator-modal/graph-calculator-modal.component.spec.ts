import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphCalculatorModalComponent } from './graph-calculator-modal.component';
import { CalculatorModalFactory } from './calculator-modal.factory';

describe('GraphCalculatorModalComponent & CalculatorModalFactory', () => {
  let component: GraphCalculatorModalComponent;
  let fixture: ComponentFixture<GraphCalculatorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphCalculatorModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GraphCalculatorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('CalculatorModalFactory should resolve DESMOS configuration correctly', () => {
    const config = CalculatorModalFactory.resolveCalculator('DESMOS');
    expect(config.type).toBe('DESMOS');
    expect(config.isSupported).toBeTrue();
    expect(config.embedUrl).toContain('desmos.com/calculator');
  });

  it('CalculatorModalFactory should STRICTLY reject GEOGEBRA with an architectural error', () => {
    expect(() => {
      CalculatorModalFactory.resolveCalculator('GEOGEBRA');
    }).toThrowError(/GeoGebra is strictly excluded from Spider Math/);
  });

  it('should toggle collapse and maximize states', () => {
    expect(component.isCollapsed()).toBeFalse();
    component.toggleCollapse();
    expect(component.isCollapsed()).toBeTrue();

    expect(component.isMaximized()).toBeFalse();
    component.toggleMaximize();
    expect(component.isMaximized()).toBeTrue();
  });

  it('should close modal when closeModal is called', () => {
    let closedEmitted = false;
    component.closed.subscribe(() => (closedEmitted = true));

    component.isOpen.set(true);
    component.closeModal();

    expect(component.isOpen()).toBeFalse();
    expect(closedEmitted).toBeTrue();
  });
});
