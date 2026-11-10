import { Component, signal, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  standalone: true,
  imports: [ClickOutsideDirective],
  template: `
    <div id="root-container">
      <div id="outside-area">
        Outside Element
        <button id="outside-stopping-button" (click)="onOutsideStopClick($event)">Outside Stop</button>
        <button id="outside-self-destruct-button" (click)="onOutsideDestructClick($event)">Outside Self-Destruct</button>
        <svg id="outside-svg" width="20" height="20">
          <circle id="outside-svg-circle" cx="10" cy="10" r="8" />
        </svg>
      </div>

      <div
        #targetContainer
        id="target-container"
        [appClickOutside]
        [clickOutsideEnabled]="enabled()"
        (appClickOutside)="onClickedOutside($event)"
      >
        <button id="inside-button">Inside Normal</button>
        <button id="inside-stopping-button" (click)="onInsideStopClick($event)">Inside Stop</button>
        <button id="inside-self-destruct-button" (click)="onInsideDestructClick($event)">Inside Self-Destruct</button>
        <svg id="inside-svg" width="20" height="20">
          <circle id="inside-svg-circle" cx="10" cy="10" r="8" />
        </svg>
        <div id="inside-nested-parent">
          <div id="inside-nested-child">
            <span id="inside-nested-leaf">Deep Leaf</span>
          </div>
        </div>
      </div>
    </div>
  `
})
class StressTestHostComponent {
  @ViewChild('targetContainer', { read: ElementRef }) targetContainerRef!: ElementRef<HTMLElement>;

  enabled = signal<boolean>(true);
  outsideClickCount = 0;
  lastEvent: MouseEvent | null = null;

  onClickedOutside(event: MouseEvent): void {
    this.outsideClickCount++;
    this.lastEvent = event;
  }

  onInsideStopClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onOutsideStopClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onInsideDestructClick(event: MouseEvent): void {
    const el = event.target as HTMLElement;
    if (el && el.parentElement) {
      el.parentElement.removeChild(el);
    }
  }

  onOutsideDestructClick(event: MouseEvent): void {
    const el = event.target as HTMLElement;
    if (el && el.parentElement) {
      el.parentElement.removeChild(el);
    }
  }
}

describe('ClickOutsideDirective Adversarial Stress & Edge Cases', () => {
  let fixture: ComponentFixture<StressTestHostComponent>;
  let component: StressTestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StressTestHostComponent, ClickOutsideDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(StressTestHostComponent);
    component = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture.nativeElement.parentNode) {
      fixture.nativeElement.parentNode.removeChild(fixture.nativeElement);
    }
    fixture.destroy();
  });

  describe('1. Rapid Clicking Inside and Outside Stress', () => {
    it('should accurately count 100 alternating clicks (50 inside, 50 outside)', () => {
      const outsideEl = fixture.nativeElement.querySelector('#outside-area') as HTMLElement;
      const insideEl = fixture.nativeElement.querySelector('#inside-button') as HTMLElement;

      for (let i = 0; i < 50; i++) {
        insideEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }

      expect(component.outsideClickCount).toBe(50);
    });

    it('should handle rapid burst of 100 outside clicks without dropping events or memory leakage', () => {
      const outsideEl = fixture.nativeElement.querySelector('#outside-area') as HTMLElement;

      for (let i = 0; i < 100; i++) {
        outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }

      expect(component.outsideClickCount).toBe(100);
    });

    it('should handle rapid toggling of clickOutsideEnabled during click barrage', () => {
      const outsideEl = fixture.nativeElement.querySelector('#outside-area') as HTMLElement;

      // 20 clicks when enabled -> 20
      for (let i = 0; i < 20; i++) {
        outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
      expect(component.outsideClickCount).toBe(20);

      // Disable
      component.enabled.set(false);
      fixture.detectChanges();

      // 20 clicks when disabled -> still 20
      for (let i = 0; i < 20; i++) {
        outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
      expect(component.outsideClickCount).toBe(20);

      // Re-enable
      component.enabled.set(true);
      fixture.detectChanges();

      // 20 clicks when re-enabled -> 40
      for (let i = 0; i < 20; i++) {
        outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
      expect(component.outsideClickCount).toBe(40);
    });
  });

  describe('2. Detached DOM Elements & Component Teardown', () => {
    it('should NOT trigger click-outside when an inside element removes itself from DOM on click', () => {
      const destructBtn = fixture.nativeElement.querySelector('#inside-self-destruct-button') as HTMLElement;
      expect(destructBtn).toBeTruthy();

      // Dispatches click which causes button to remove itself from DOM before document:click processes
      destructBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      // Button is now detached from DOM
      expect(destructBtn.isConnected).toBeFalse();

      // Because the click originated inside #target-container, composedPath includes hostEl, so it must NOT emit
      expect(component.outsideClickCount).toBe(0);
    });

    it('should trigger click-outside when an outside element removes itself from DOM on click', () => {
      const outsideDestructBtn = fixture.nativeElement.querySelector('#outside-self-destruct-button') as HTMLElement;
      expect(outsideDestructBtn).toBeTruthy();

      outsideDestructBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      expect(outsideDestructBtn.isConnected).toBeFalse();
      expect(component.outsideClickCount).toBe(1);
    });

    it('should NOT trigger click-outside when the directive host element is detached from DOM', () => {
      const outsideEl = fixture.nativeElement.querySelector('#outside-area') as HTMLElement;
      const targetContainer = component.targetContainerRef.nativeElement;

      // Detach host container from DOM
      targetContainer.remove();
      expect(targetContainer.isConnected).toBeFalse();

      outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      expect(component.outsideClickCount).toBe(0);
    });

    it('should NOT trigger after component fixture is destroyed', () => {
      const outsideEl = fixture.nativeElement.querySelector('#outside-area') as HTMLElement;

      fixture.destroy();

      outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      expect(component.outsideClickCount).toBe(0);
    });
  });

  describe('3. Nested stopPropagation Handlers', () => {
    it('should NOT emit when an inside child element stops propagation', () => {
      const insideStopBtn = fixture.nativeElement.querySelector('#inside-stopping-button') as HTMLElement;
      insideStopBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      expect(component.outsideClickCount).toBe(0);
    });

    it('should NOT emit when an outside element stops propagation before reaching document', () => {
      const outsideStopBtn = fixture.nativeElement.querySelector('#outside-stopping-button') as HTMLElement;
      outsideStopBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      // Because propagation is stopped at the outside element, document listener never fires
      expect(component.outsideClickCount).toBe(0);
    });

    it('should correctly ignore clicks originating deep in nested DOM inside host', () => {
      const deepLeaf = fixture.nativeElement.querySelector('#inside-nested-leaf') as HTMLElement;
      deepLeaf.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      expect(component.outsideClickCount).toBe(0);
    });
  });

  describe('4. Touch Events, Pointer Events, and SVG Elements', () => {
    it('should handle PointerEvent with pointerType=touch originating outside', () => {
      const outsideEl = fixture.nativeElement.querySelector('#outside-area') as HTMLElement;
      const touchPointerEvent = new PointerEvent('click', {
        bubbles: true,
        cancelable: true,
        pointerType: 'touch',
        clientX: 10,
        clientY: 10
      });

      outsideEl.dispatchEvent(touchPointerEvent);
      expect(component.outsideClickCount).toBe(1);
      expect(component.lastEvent).toBe(touchPointerEvent);
    });

    it('should handle PointerEvent with pointerType=touch originating inside', () => {
      const insideBtn = fixture.nativeElement.querySelector('#inside-button') as HTMLElement;
      const touchPointerEvent = new PointerEvent('click', {
        bubbles: true,
        cancelable: true,
        pointerType: 'touch',
        clientX: 50,
        clientY: 50
      });

      insideBtn.dispatchEvent(touchPointerEvent);
      expect(component.outsideClickCount).toBe(0);
    });

    it('should correctly identify SVG child elements inside host element as inside clicks', () => {
      const insideSvgCircle = fixture.nativeElement.querySelector('#inside-svg-circle') as SVGElement;
      insideSvgCircle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      expect(component.outsideClickCount).toBe(0);
    });

    it('should correctly identify SVG child elements outside host element as outside clicks', () => {
      const outsideSvgCircle = fixture.nativeElement.querySelector('#outside-svg-circle') as SVGElement;
      outsideSvgCircle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      expect(component.outsideClickCount).toBe(1);
    });

    it('should safely fallback when composedPath is missing or returns empty array', () => {
      const insideBtn = fixture.nativeElement.querySelector('#inside-button') as HTMLElement;
      const clickEvt = new MouseEvent('click', { bubbles: true, cancelable: true });

      // Override composedPath to return undefined simulating legacy/fallback environments
      Object.defineProperty(clickEvt, 'composedPath', {
        value: undefined,
        configurable: true
      });

      insideBtn.dispatchEvent(clickEvt);
      // hostEl.contains(target) should identify it as inside
      expect(component.outsideClickCount).toBe(0);
    });
  });
});
