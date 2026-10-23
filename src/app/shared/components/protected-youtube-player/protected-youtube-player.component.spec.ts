import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProtectedYoutubePlayerComponent } from './protected-youtube-player.component';

describe('ProtectedYoutubePlayerComponent', () => {
  let component: ProtectedYoutubePlayerComponent;
  let fixture: ComponentFixture<ProtectedYoutubePlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtectedYoutubePlayerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProtectedYoutubePlayerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('lectureId', 'lec_123');
    fixture.detectChanges();
  });

  it('should create the ProtectedYoutubePlayerComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should compute progress and format time correctly', () => {
    component.duration.set(120);
    component.currentTimeSec.set(60);
    expect(component.formattedCurrentTime()).toBe('01:00');
    expect(component.formattedDuration()).toBe('02:00');
    expect(component.progressPercentage()).toBe(50);
  });
});
