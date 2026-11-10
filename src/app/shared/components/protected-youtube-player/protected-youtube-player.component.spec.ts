import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { ProtectedYoutubePlayerComponent } from './protected-youtube-player.component';
import { AppIconComponent } from '../app-icon/app-icon.component';

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

  describe('Universal Video Player UI Simplification (R3)', () => {
    it('should display only play/pause button, progress scrubber, and audio icon in controls', () => {
      const controlsBar = fixture.debugElement.query(By.css('.player-controls-bar'));
      expect(controlsBar).toBeTruthy();

      // Scrubber progress bar present
      const scrubber = fixture.debugElement.query(By.css('.scrubber-thumb-orb'));
      expect(scrubber).toBeTruthy();

      // Play button present
      const playBtn = fixture.debugElement.query(By.css('button[aria-label="Play"]'));
      expect(playBtn).toBeTruthy();

      // Audio button present
      const audioBtn = fixture.debugElement.query(By.css('button[aria-label="Mute sound"], button[aria-label="Unmute sound"]'));
      expect(audioBtn).toBeTruthy();

      // NO volume slider
      const volumeSlider = fixture.debugElement.query(By.css('input[type="range"]'));
      expect(volumeSlider).toBeNull();

      // NO speed buttons
      const speedButtons = fixture.debugElement.queryAll(By.css('button')).filter(btn => {
        const text = btn.nativeElement.textContent.trim();
        return ['1x', '1.25x', '1.5x', '2x'].includes(text);
      });
      expect(speedButtons.length).toBe(0);

      // NO fullscreen button
      const fullscreenBtn = fixture.debugElement.query(By.css('button[aria-label*="Fullscreen"]'));
      expect(fullscreenBtn).toBeNull();

      // NO 90px glass play orb
      const glassOrb = fixture.debugElement.query(By.css('.glass-play-orb'));
      expect(glassOrb).toBeNull();

      // NO medal (award) or lock icon in controls
      const icons = fixture.debugElement.queryAll(By.directive(AppIconComponent));
      const iconNames = icons.map(icon => icon.componentInstance.name());
      expect(iconNames).not.toContain('award');
      expect(iconNames).not.toContain('lock');
    });

    it('should render volume-2 icon when unmuted and volume-x when muted', () => {
      // By default: unmuted, volume = 100
      component.isMuted.set(false);
      component.volume.set(100);
      fixture.detectChanges();

      let audioIcon = fixture.debugElement.query(By.css('button[aria-label="Mute sound"] app-icon'));
      expect(audioIcon).toBeTruthy();
      expect(audioIcon.componentInstance.name()).toBe('volume-2');

      // When muted: volume-x
      component.isMuted.set(true);
      fixture.detectChanges();

      audioIcon = fixture.debugElement.query(By.css('button[aria-label="Unmute sound"] app-icon'));
      expect(audioIcon).toBeTruthy();
      expect(audioIcon.componentInstance.name()).toBe('volume-x');

      // When volume is 0: volume-x
      component.isMuted.set(false);
      component.volume.set(0);
      fixture.detectChanges();

      audioIcon = fixture.debugElement.query(By.css('button[aria-label="Unmute sound"] app-icon'));
      expect(audioIcon).toBeTruthy();
      expect(audioIcon.componentInstance.name()).toBe('volume-x');
    });

    it('should toggle mute state when toggleMute is called with active ytPlayer', () => {
      const mockPlayer = {
        mute: jasmine.createSpy('mute'),
        unMute: jasmine.createSpy('unMute')
      };
      (component as any).ytPlayer = mockPlayer;
      component.isMuted.set(false);
      component.volume.set(80);
      fixture.detectChanges();

      // Click audio button to mute
      const audioBtn = fixture.debugElement.query(By.css('button[aria-label="Mute sound"]'));
      audioBtn.nativeElement.click();
      fixture.detectChanges();

      expect(mockPlayer.mute).toHaveBeenCalled();
      expect(component.isMuted()).toBeTrue();

      // Click audio button to unmute
      const unmuteBtn = fixture.debugElement.query(By.css('button[aria-label="Unmute sound"]'));
      unmuteBtn.nativeElement.click();
      fixture.detectChanges();

      expect(mockPlayer.unMute).toHaveBeenCalled();
      expect(component.isMuted()).toBeFalse();
    });

    it('should preserve underlying signals for telemetry and backend chunk reporting', () => {
      expect(component.currentTimeSec).toBeDefined();
      expect(component.duration).toBeDefined();
      expect(component.volume).toBeDefined();
      expect(component.isMuted).toBeDefined();
      expect(component.watchPercentage).toBeDefined();
      expect(component.playbackRate).toBeDefined();
      expect(component.chunkCompleted).toBeDefined();
      expect(component.progressUpdated).toBeDefined();
    });
  });

  describe('Adversarial Viewport Immunity & Control Bar Integrity (M3 Challenger 1)', () => {
    let testHost: HTMLElement;

    beforeEach(() => {
      testHost = document.createElement('div');
      testHost.id = 'viewport-test-host';
      document.body.appendChild(testHost);
      testHost.appendChild(fixture.nativeElement);
    });

    afterEach(() => {
      if (testHost && testHost.parentNode) {
        testHost.parentNode.removeChild(testHost);
      }
    });

    const viewports = [
      { name: 'Ultra-narrow Mobile (320px)', width: 320 },
      { name: 'Compact Mobile (360px)', width: 360 },
      { name: 'Standard Mobile (375px)', width: 375 },
      { name: 'Large Mobile (414px)', width: 414 },
      { name: 'Tablet Portrait (768px)', width: 768 },
      { name: 'Standard Desktop (1024px)', width: 1024 },
      { name: 'Wide Desktop (1440px)', width: 1440 }
    ];

    viewports.forEach(({ name, width }) => {
      it(`should maintain zero overflow, zero wrapping, and zero truncation at ${name}`, () => {
        testHost.style.width = `${width}px`;
        testHost.style.maxWidth = `${width}px`;
        testHost.style.overflow = 'hidden';
        fixture.detectChanges();

        const controlsBar = fixture.nativeElement.querySelector('.player-controls-bar') as HTMLElement;
        expect(controlsBar).toBeTruthy();
        // Controls bar must have zero horizontal overflow
        expect(controlsBar.scrollWidth).toBeLessThanOrEqual(controlsBar.clientWidth);

        // Find the controls row containing the action buttons
        const controlsRow = controlsBar.querySelector('.flex.items-center.text-white') as HTMLElement;
        expect(controlsRow).toBeTruthy();
        expect(controlsRow.scrollWidth).toBeLessThanOrEqual(controlsRow.clientWidth);

        const buttons = Array.from(controlsRow.querySelectorAll('button'));
        expect(buttons.length).toBe(2);

        const [playBtn, audioBtn] = buttons;
        expect(playBtn.offsetWidth).toBeGreaterThan(0);
        expect(audioBtn.offsetWidth).toBeGreaterThan(0);

        // Verify elements do NOT wrap onto multiple lines (same vertical plane)
        const playRect = playBtn.getBoundingClientRect();
        const audioRect = audioBtn.getBoundingClientRect();
        expect(Math.abs(playRect.top - audioRect.top)).toBeLessThan(5);

        // Verify scrubber bar width fits perfectly inside controlsBar without overflow
        const scrubberTrack = controlsBar.querySelector('.relative.w-full.h-4') as HTMLElement;
        expect(scrubberTrack).toBeTruthy();
        expect(scrubberTrack.scrollWidth).toBeLessThanOrEqual(scrubberTrack.clientWidth);

        // Verify entire chassis has zero horizontal overflow
        const chassis = fixture.nativeElement.querySelector('.player-screen-chassis') as HTMLElement;
        expect(chassis).toBeTruthy();
        expect(chassis.scrollWidth).toBeLessThanOrEqual(chassis.clientWidth);
      });
    });

    it('should maintain zero overflow and proper layout under RTL mode at 320px viewport', () => {
      testHost.style.width = '320px';
      testHost.style.maxWidth = '320px';
      testHost.setAttribute('dir', 'rtl');
      fixture.detectChanges();

      const controlsBar = fixture.nativeElement.querySelector('.player-controls-bar') as HTMLElement;
      expect(controlsBar).toBeTruthy();
      expect(controlsBar.scrollWidth).toBeLessThanOrEqual(controlsBar.clientWidth);

      const controlsRow = controlsBar.querySelector('.flex.items-center.text-white') as HTMLElement;
      expect(controlsRow).toBeTruthy();

      const buttons = Array.from(controlsRow.querySelectorAll('button'));
      expect(buttons.length).toBe(2);

      const [playBtn, audioBtn] = buttons;
      const playRect = playBtn.getBoundingClientRect();
      const audioRect = audioBtn.getBoundingClientRect();
      expect(Math.abs(playRect.top - audioRect.top)).toBeLessThan(5);
    });

    it('should strictly exclude removed elements across all playback states', () => {
      const playbackStates = [
        { isPlaying: false, showControls: true },
        { isPlaying: true, showControls: true },
        { isPlaying: true, showControls: false }
      ];

      for (const st of playbackStates) {
        component.isPlaying.set(st.isPlaying);
        component.showControls.set(st.showControls);
        fixture.detectChanges();

        const el = fixture.nativeElement as HTMLElement;

        // 1. No volume slider range input
        expect(el.querySelector('input[type="range"]')).toBeNull();

        // 2. No speed selector buttons (1x, 1.25x, 1.5x, 2x)
        const allButtons = Array.from(el.querySelectorAll('button'));
        const speedTexts = allButtons.map(b => (b.textContent || '').trim());
        expect(speedTexts).not.toContain('1x');
        expect(speedTexts).not.toContain('1.25x');
        expect(speedTexts).not.toContain('1.5x');
        expect(speedTexts).not.toContain('2x');

        // 3. No fullscreen button
        const fullscreenBtn = allButtons.find(b => {
          const aria = b.getAttribute('aria-label') || '';
          return aria.toLowerCase().includes('fullscreen');
        });
        expect(fullscreenBtn).toBeUndefined();

        // 4. No 90px glass play orb
        expect(el.querySelector('.glass-play-orb')).toBeNull();

        // 5. No medal icon (award) anywhere
        const appIcons = Array.from(el.querySelectorAll('app-icon'));
        const iconNames = appIcons.map(i => i.getAttribute('ng-reflect-name') || i.getAttribute('name'));
        expect(iconNames).not.toContain('award');
        expect(iconNames).not.toContain('lock');
        expect(iconNames).not.toContain('target');

        // 6. No watch percentage pill badge in controls
        const controlsBar = el.querySelector('.player-controls-bar');
        if (controlsBar) {
          const barText = controlsBar.textContent || '';
          expect(barText).not.toContain('% Completed');
          expect(barText).not.toContain('% مكتمل');
          expect(barText).not.toContain('00:');
          expect(barText).not.toContain('18:');
        }
      }
    });

    it('should strictly retain only the 3 required elements in the controls bar', () => {
      const controlsBar = fixture.debugElement.query(By.css('.player-controls-bar'));
      expect(controlsBar).toBeTruthy();

      // Exactly 1 scrubber
      const scrubbers = controlsBar.queryAll(By.css('.scrubber-thumb-orb'));
      expect(scrubbers.length).toBe(1);

      // Exactly 2 buttons in controls row (Play and Audio)
      const buttons = controlsBar.queryAll(By.css('button'));
      expect(buttons.length).toBe(2);

      const ariaLabels = buttons.map(b => b.nativeElement.getAttribute('aria-label'));
      expect(ariaLabels.some((l: string) => l === 'Play' || l === 'Pause')).toBeTrue();
      expect(ariaLabels.some((l: string) => l === 'Mute sound' || l === 'Unmute sound')).toBeTrue();
    });
  });
});
