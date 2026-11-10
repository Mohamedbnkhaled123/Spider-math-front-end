import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  standalone: true,
  imports: [ClickOutsideDirective],
  template: `
    <div id="outside-area">Outside Element</div>
    <div
      id="target-container"
      [appClickOutside]
      [clickOutsideEnabled]="enabled()"
      (appClickOutside)="onClickedOutside($event)"
    >
      <button id="inside-button">Inside Element</button>
    </div>
  `
})
class TestHostComponent {
  enabled = signal<boolean>(true);
  outsideClickCount = 0;

  onClickedOutside(_event: MouseEvent): void {
    this.outsideClickCount++;
  }
}

describe('ClickOutsideDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ClickOutsideDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
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

  it('should emit appClickOutside when clicking outside host element', () => {
    const outsideEl = fixture.nativeElement.querySelector('#outside-area');
    outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.outsideClickCount).toBe(1);
  });

  it('should NOT emit appClickOutside when clicking inside host element', () => {
    const insideBtn = fixture.nativeElement.querySelector('#inside-button');
    insideBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.outsideClickCount).toBe(0);
  });

  it('should NOT emit appClickOutside when clickOutsideEnabled is false', () => {
    component.enabled.set(false);
    fixture.detectChanges();

    const outsideEl = fixture.nativeElement.querySelector('#outside-area');
    outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.outsideClickCount).toBe(0);
  });

  it('should pass the native MouseEvent payload to output emitter', () => {
    let capturedEvent: any = null;
    component.onClickedOutside = (e: MouseEvent) => {
      capturedEvent = e;
    };

    const outsideEl = fixture.nativeElement.querySelector('#outside-area');
    const clickEvt = new MouseEvent('click', { bubbles: true });
    outsideEl.dispatchEvent(clickEvt);

    expect(capturedEvent).toBe(clickEvt);
  });

  it('should NOT emit appClickOutside when clicking child elements inside host', () => {
    const insideBtn = fixture.nativeElement.querySelector('#inside-button');
    insideBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.outsideClickCount).toBe(0);
  });
});
