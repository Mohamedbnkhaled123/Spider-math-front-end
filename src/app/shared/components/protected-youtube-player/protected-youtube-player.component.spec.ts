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

  describe('Interactive Video Player Controls & Seeking', () => {
    it('should display play/pause, -5s/+5s skip, scrubber slider, mute, time display, speed, and fullscreen controls', () => {
      const controlsBar = fixture.debugElement.query(By.css('.player-controls-bar'));
      expect(controlsBar).toBeTruthy();

      const scrubber = fixture.debugElement.query(By.css('[role="slider"]'));
      expect(scrubber).toBeTruthy();
      expect(scrubber.nativeElement.getAttribute('dir')).toBe('ltr');
      expect(fixture.debugElement.query(By.css('.scrubber-thumb-orb'))).toBeTruthy();

      expect(fixture.debugElement.query(By.css('button[aria-label="Play"]'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('[data-testid="skip-back-btn"]'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('[data-testid="skip-forward-btn"]'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('button[aria-label="Mute sound"], button[aria-label="Unmute sound"]'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('[data-testid="player-time-display"]'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('[data-testid="speed-toggle-btn"]')).nativeElement.textContent.trim()).toBe('1x');
      expect(fixture.debugElement.query(By.css('[data-testid="fullscreen-toggle-btn"]'))).toBeTruthy();

      expect(fixture.debugElement.query(By.css('input[type="range"]'))).toBeNull();
      expect(fixture.debugElement.query(By.css('.glass-play-orb'))).toBeNull();

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

    it('should seek +5s on right-half double-tap and -5s on left-half double-tap without toggling play', () => {
      let current = 20;
      const mockPlayer = {
        seekTo: jasmine.createSpy('seekTo').and.callFake((sec: number) => {
          current = sec;
        }),
        getCurrentTime: () => current,
        getDuration: () => 120,
        playVideo: jasmine.createSpy('playVideo'),
        pauseVideo: jasmine.createSpy('pauseVideo'),
        getPlayerState: () => 1
      };
      (component as any).ytPlayer = mockPlayer;
      component.hasStarted.set(true);
      component.isPlaying.set(true);
      component.duration.set(120);
      component.currentTimeSec.set(20);
      fixture.detectChanges();

      const shield = fixture.nativeElement.querySelector('.yt-security-shield') as HTMLElement;
      expect(shield).toBeTruthy();
      spyOn(shield, 'getBoundingClientRect').and.returnValue({
        left: 0,
        right: 400,
        width: 400,
        top: 0,
        bottom: 225,
        height: 225,
        x: 0,
        y: 0,
        toJSON: () => ({})
      });

      // Double-tap right half -> +5s
      shield.dispatchEvent(new MouseEvent('click', { clientX: 320, bubbles: true }));
      shield.dispatchEvent(new MouseEvent('click', { clientX: 320, bubbles: true }));
      fixture.detectChanges();

      expect(mockPlayer.seekTo).toHaveBeenCalledWith(25, true);
      expect(component.currentTimeSec()).toBe(25);
      expect(mockPlayer.pauseVideo).not.toHaveBeenCalled();
      expect(component.seekFeedback()?.side).toBe('right');
      const rightIndicator = fixture.nativeElement.querySelector('[data-testid="seek-feedback-indicator"]') as HTMLElement;
      expect(rightIndicator.textContent).toContain('+5s');

      // Double-tap left half -> -5s
      shield.dispatchEvent(new MouseEvent('click', { clientX: 80, bubbles: true }));
      shield.dispatchEvent(new MouseEvent('click', { clientX: 80, bubbles: true }));
      fixture.detectChanges();

      expect(mockPlayer.seekTo).toHaveBeenCalledWith(20, true);
      expect(component.currentTimeSec()).toBe(20);
      expect(component.seekFeedback()?.side).toBe('left');
      const leftIndicator = fixture.nativeElement.querySelector('[data-testid="seek-feedback-indicator"]') as HTMLElement;
      expect(leftIndicator.textContent).toContain('-5s');
    });

    it('should skip +5s and -5s via explicit skip buttons', () => {
      let current = 30;
      const mockPlayer = {
        seekTo: jasmine.createSpy('seekTo').and.callFake((sec: number) => {
          current = sec;
        }),
        getCurrentTime: () => current,
        getDuration: () => 120
      };
      (component as any).ytPlayer = mockPlayer;
      component.duration.set(120);
      component.currentTimeSec.set(30);
      fixture.detectChanges();

      const forwardBtn = fixture.nativeElement.querySelector('[data-testid="skip-forward-btn"]') as HTMLButtonElement;
      forwardBtn.click();
      fixture.detectChanges();
      expect(mockPlayer.seekTo).toHaveBeenCalledWith(35, true);

      const backBtn = fixture.nativeElement.querySelector('[data-testid="skip-back-btn"]') as HTMLButtonElement;
      backBtn.click();
      fixture.detectChanges();
      expect(mockPlayer.seekTo).toHaveBeenCalledWith(30, true);
    });

    it('should scrub smoothly across timeline on pointerdown/pointermove/pointerup even under RTL', () => {
      const mockPlayer = {
        seekTo: jasmine.createSpy('seekTo'),
        getDuration: () => 100
      };
      (component as any).ytPlayer = mockPlayer;
      component.hasStarted.set(true);
      component.duration.set(100);
      fixture.detectChanges();

      const slider = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;
      spyOn(slider, 'getBoundingClientRect').and.returnValue({
        left: 0,
        right: 200,
        width: 200,
        top: 0,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => ({})
      });

      // Set ancestor RTL to verify scrubber stays LTR left-to-right
      (fixture.nativeElement as HTMLElement).setAttribute('dir', 'rtl');
      slider.dispatchEvent(new PointerEvent('pointerdown', { clientX: 50, bubbles: true }));
      expect(component.isScrubbing()).toBeTrue();
      expect(mockPlayer.seekTo).toHaveBeenCalledWith(25, true);

      document.dispatchEvent(new PointerEvent('pointermove', { clientX: 150, bubbles: true }));
      expect(mockPlayer.seekTo).toHaveBeenCalledWith(75, true);
      expect(component.currentTimeSec()).toBe(75);

      document.dispatchEvent(new PointerEvent('pointerup', { clientX: 150, bubbles: true }));
      expect(component.isScrubbing()).toBeFalse();
      (fixture.nativeElement as HTMLElement).removeAttribute('dir');
    });

    it('should open speed popover and update playbackRate', () => {
      const mockPlayer = {
        setPlaybackRate: jasmine.createSpy('setPlaybackRate'),
        getAvailablePlaybackRates: () => [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
      };
      (component as any).ytPlayer = mockPlayer;
      fixture.detectChanges();

      const speedToggle = fixture.nativeElement.querySelector('[data-testid="speed-toggle-btn"]') as HTMLButtonElement;
      speedToggle.click();
      fixture.detectChanges();

      expect(component.isSpeedMenuOpen()).toBeTrue();
      const speedMenuButtons = Array.from(
        fixture.nativeElement.querySelectorAll('.speed-popover-menu button')
      ) as HTMLButtonElement[];
      expect(speedMenuButtons.length).toBe(6);

      const rate15Btn = speedMenuButtons.find(b => b.textContent?.trim() === '1.5x') as HTMLButtonElement;
      expect(rate15Btn).toBeTruthy();
      rate15Btn.click();
      fixture.detectChanges();

      expect(mockPlayer.setPlaybackRate).toHaveBeenCalledWith(1.5);
      expect(component.playbackRate()).toBe(1.5);
      expect(component.isSpeedMenuOpen()).toBeFalse();
      expect(speedToggle.textContent?.trim()).toBe('1.5x');
    });

    it('should fall back to CSS pseudo-fullscreen when native requestFullscreen is unavailable and exit on Escape', () => {
      const containerEl = (component as any).playerContainer().nativeElement as HTMLElement;
      Object.defineProperty(containerEl, 'requestFullscreen', { value: undefined, configurable: true });
      Object.defineProperty(containerEl, 'webkitRequestFullscreen', { value: undefined, configurable: true });

      const fsBtn = fixture.nativeElement.querySelector('[data-testid="fullscreen-toggle-btn"]') as HTMLButtonElement;
      fsBtn.click();
      fixture.detectChanges();

      expect(component.isPseudoFullscreen()).toBeTrue();
      expect(component.isEffectiveFullscreen()).toBeTrue();
      expect(containerEl.classList.contains('player-pseudo-fullscreen')).toBeTrue();

      containerEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(component.isPseudoFullscreen()).toBeFalse();
      expect(component.isEffectiveFullscreen()).toBeFalse();
    });
  });

  describe('Viewport Immunity & Control Bar Integrity (Responsive + RTL)', () => {
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
        expect(controlsBar.scrollWidth).toBeLessThanOrEqual(controlsBar.clientWidth);

        const controlsRow = controlsBar.querySelector('.player-controls-row') as HTMLElement;
        expect(controlsRow).toBeTruthy();
        expect(controlsRow.scrollWidth).toBeLessThanOrEqual(controlsRow.clientWidth);

        const buttons = Array.from(controlsRow.querySelectorAll('button'));
        expect(buttons.length).toBe(6);

        const firstRect = buttons[0].getBoundingClientRect();
        for (const btn of buttons) {
          expect(btn.offsetWidth).toBeGreaterThan(0);
          expect(Math.abs(btn.getBoundingClientRect().top - firstRect.top)).toBeLessThan(5);
        }

        const scrubberTrack = controlsBar.querySelector('[role="slider"]') as HTMLElement;
        expect(scrubberTrack).toBeTruthy();
        expect(scrubberTrack.scrollWidth).toBeLessThanOrEqual(scrubberTrack.clientWidth);

        const chassis = fixture.nativeElement.querySelector('.player-screen-chassis') as HTMLElement;
        expect(chassis).toBeTruthy();
        expect(chassis.scrollWidth).toBeLessThanOrEqual(chassis.clientWidth);
      });
    });

    it('should maintain zero overflow and single-row layout under RTL mode at 320px viewport', () => {
      testHost.style.width = '320px';
      testHost.style.maxWidth = '320px';
      testHost.setAttribute('dir', 'rtl');
      fixture.detectChanges();

      const controlsBar = fixture.nativeElement.querySelector('.player-controls-bar') as HTMLElement;
      expect(controlsBar).toBeTruthy();
      expect(controlsBar.getAttribute('dir')).toBe('ltr');
      expect(controlsBar.scrollWidth).toBeLessThanOrEqual(controlsBar.clientWidth);

      const controlsRow = controlsBar.querySelector('.player-controls-row') as HTMLElement;
      expect(controlsRow).toBeTruthy();

      const buttons = Array.from(controlsRow.querySelectorAll('button'));
      expect(buttons.length).toBe(6);

      const firstRect = buttons[0].getBoundingClientRect();
      for (const btn of buttons) {
        expect(Math.abs(btn.getBoundingClientRect().top - firstRect.top)).toBeLessThan(5);
      }
    });

    it('should retain required interactive controls across playback states', () => {
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
        expect(el.querySelector('input[type="range"]')).toBeNull();
        expect(el.querySelector('.glass-play-orb')).toBeNull();
        expect(el.querySelector('[data-testid="speed-toggle-btn"]')).toBeTruthy();
        expect(el.querySelector('[data-testid="fullscreen-toggle-btn"]')).toBeTruthy();
        expect(el.querySelector('[data-testid="skip-back-btn"]')).toBeTruthy();
        expect(el.querySelector('[data-testid="skip-forward-btn"]')).toBeTruthy();
      }
    });
  });
});
