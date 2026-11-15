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

  describe('Navbar Clearance, Layering & Boundaries Contract', () => {
    it('should assign z-layer-calculator to modal wrapper when open', () => {
      component.isOpen.set(true);
      fixture.detectChanges();

      const wrapper: HTMLElement | null = fixture.nativeElement.querySelector('.graph-modal-wrapper');
      expect(wrapper).toBeTruthy();
      expect(wrapper?.classList.contains('z-layer-calculator')).toBeTrue();
    });

    it('should clamp vertical dragging to remain safely below the sticky navbar', () => {
      component.isOpen.set(true);
      fixture.detectChanges();

      // Simulate starting drag
      component.startDrag(new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));
      expect(component.isDragging()).toBeTrue();

      // Attempt to drag upward past the navbar to clientY = 0
      component.onDragMove(new MouseEvent('mousemove', { clientX: 100, clientY: 0 }));

      // Position Y should be clamped to at least navbar height (>= 68px on mobile, >= 84px on desktop)
      expect(component.position().y).toBeGreaterThanOrEqual(68);

      component.onDragEnd();
      expect(component.isDragging()).toBeFalse();
    });

    it('should contain zero Unicode emojis in rendered template', () => {
      component.isOpen.set(true);
      fixture.detectChanges();
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
      expect(emojiRegex.test(fixture.nativeElement.innerHTML)).toBeFalse();
    });
  });
});
