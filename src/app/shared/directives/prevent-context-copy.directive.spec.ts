import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreventContextCopyDirective } from './prevent-context-copy.directive';

@Component({
  standalone: true,
  imports: [PreventContextCopyDirective],
  template: `<div appPreventContextCopy id="test-target">Protected Content</div>`
})
class TestHostComponent {}

describe('PreventContextCopyDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, PreventContextCopyDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should prevent default on contextmenu event', () => {
    const target = fixture.nativeElement.querySelector('#test-target');
    const event = new MouseEvent('contextmenu', { cancelable: true });
    target.dispatchEvent(event);
    expect(event.defaultPrevented).toBeTrue();
  });

  it('should prevent default on Ctrl+S keydown event', () => {
    const target = fixture.nativeElement.querySelector('#test-target');
    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, cancelable: true });
    target.dispatchEvent(event);
    expect(event.defaultPrevented).toBeTrue();
  });
});
