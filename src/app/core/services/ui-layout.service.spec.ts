import { TestBed } from '@angular/core/testing';
import { UiLayoutService } from './ui-layout.service';

describe('UiLayoutService', () => {
  let service: UiLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UiLayoutService]
    });
    service = TestBed.inject(UiLayoutService);
  });

  it('should initialize with footer not suppressed', () => {
    expect(service.isFooterSuppressed()).toBe(false);
  });

  it('should suppress footer when suppressFooter() is called', () => {
    service.suppressFooter(true);
    expect(service.isFooterSuppressed()).toBe(true);
  });

  it('should restore footer when restoreFooter() is called', () => {
    service.suppressFooter(true);
    expect(service.isFooterSuppressed()).toBe(true);

    service.restoreFooter();
    expect(service.isFooterSuppressed()).toBe(false);
  });
});
