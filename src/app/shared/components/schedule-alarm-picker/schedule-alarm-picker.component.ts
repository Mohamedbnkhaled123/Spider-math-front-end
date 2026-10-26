import {
  Component,
  ChangeDetectionStrategy,
  model,
  input,
  signal,
  computed,
  effect,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppIconComponent } from '../app-icon/app-icon.component';

export interface CalendarDay {
  dayNumber: number;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-schedule-alarm-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './schedule-alarm-picker.component.html',
  styleUrl: './schedule-alarm-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ScheduleAlarmPickerComponent),
      multi: true
    }
  ]
})
export class ScheduleAlarmPickerComponent implements ControlValueAccessor {
  // Two-way binding for ISO string or null
  readonly value = model<string | null>(null);

  readonly label = input<string>('موعد الامتحان:');
  readonly placeholder = input<string>('حددي اليوم وضبط وقت المنبه...');

  // Modal / Dropdown Open State
  readonly isOpen = signal<boolean>(false);
  readonly disabled = signal<boolean>(false);

  private onChange: (val: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  // Calendar View State
  readonly viewYear = signal<number>(new Date().getFullYear());
  readonly viewMonth = signal<number>(new Date().getMonth() + 1); // 1-12

  // Selected Values (LOCAL, Zero Timezone Drift)
  readonly selectedYear = signal<number | null>(null);
  readonly selectedMonth = signal<number | null>(null); // 1-12
  readonly selectedDay = signal<number | null>(null); // 1-31

  // Alarm Clock State
  readonly selectedHour12 = signal<number>(10); // 1-12
  readonly selectedMinute = signal<number>(0); // 0-59
  readonly selectedPeriod = signal<'AM' | 'PM'>('AM');

  readonly monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  readonly dayNamesAr = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

  constructor() {
    effect(
      () => {
        const val = this.value();
        this.parseValue(val);
      },
      { allowSignalWrites: true }
    );
  }

  // Parse ISO string using LOCAL getters to completely prevent 3-hour timezone drift
  private parseValue(iso: string | null): void {
    if (!iso) {
      this.selectedYear.set(null);
      this.selectedMonth.set(null);
      this.selectedDay.set(null);
      return;
    }

    const d = new Date(iso);
    if (isNaN(d.getTime())) return;

    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const h24 = d.getHours();
    const min = d.getMinutes();

    this.selectedYear.set(y);
    this.selectedMonth.set(m);
    this.selectedDay.set(day);
    this.viewYear.set(y);
    this.viewMonth.set(m);

    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    this.selectedHour12.set(h12);
    this.selectedMinute.set(min);
    this.selectedPeriod.set(h24 >= 12 ? 'PM' : 'AM');
  }

  // Days grid computation
  readonly calendarDays = computed<CalendarDay[]>(() => {
    const y = this.viewYear();
    const m = this.viewMonth();
    const now = new Date();
    const todayY = now.getFullYear();
    const todayM = now.getMonth() + 1;
    const todayD = now.getDate();

    const daysCount = new Date(y, m, 0).getDate();
    // In Egypt/Arab world, week starts Saturday (index 0).
    // JS getDay(): 0 is Sunday, 6 is Saturday.
    // Saturday: (6 + 1) % 7 = 0; Sunday: (0 + 1) % 7 = 1; etc.
    const firstDayOfWeekJs = new Date(y, m - 1, 1).getDay();
    const padOffset = (firstDayOfWeekJs + 1) % 7;

    const days: CalendarDay[] = [];

    // Empty offset days
    for (let i = 0; i < padOffset; i++) {
      days.push({
        dayNumber: 0,
        dateString: '',
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysCount; d++) {
      const isToday = y === todayY && m === todayM && d === todayD;
      const isSelected =
        y === this.selectedYear() &&
        m === this.selectedMonth() &&
        d === this.selectedDay();

      days.push({
        dayNumber: d,
        dateString: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: true,
        isToday,
        isSelected
      });
    }

    return days;
  });

  // Human-readable summary for display
  readonly formattedSummary = computed<string>(() => {
    const y = this.selectedYear();
    const m = this.selectedMonth();
    const d = this.selectedDay();
    if (!y || !m || !d) return '';

    const h = this.selectedHour12();
    const min = String(this.selectedMinute()).padStart(2, '0');
    const pAr = this.selectedPeriod() === 'AM' ? 'صباحاً' : 'مساءً';
    const monthName = this.monthNamesAr[m - 1] || '';

    // Day of week
    const dateObj = new Date(y, m - 1, d);
    const dayIndex = (dateObj.getDay() + 1) % 7;
    const dayName = this.dayNamesAr[dayIndex] || '';

    return `${dayName}، ${d} ${monthName} ${y} — ${h}:${min} ${pAr}`;
  });

  // ControlValueAccessor Implementation
  writeValue(val: string | null): void {
    this.value.set(val || null);
    this.parseValue(val || null);
  }

  registerOnChange(fn: (val: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  openPicker(): void {
    if (this.disabled()) return;
    if (!this.selectedYear()) {
      // Default to today if nothing selected
      const now = new Date();
      this.selectedYear.set(now.getFullYear());
      this.selectedMonth.set(now.getMonth() + 1);
      this.selectedDay.set(now.getDate());
      this.viewYear.set(now.getFullYear());
      this.viewMonth.set(now.getMonth() + 1);

      let h12 = now.getHours() % 12;
      if (h12 === 0) h12 = 12;
      this.selectedHour12.set(h12);
      this.selectedMinute.set(Math.ceil(now.getMinutes() / 5) * 5 % 60);
      this.selectedPeriod.set(now.getHours() >= 12 ? 'PM' : 'AM');
    }
    this.isOpen.set(true);
  }

  closePicker(): void {
    // If closed without confirm, revert uncommitted changes to active value
    this.parseValue(this.value());
    this.isOpen.set(false);
  }

  prevMonth(): void {
    let m = this.viewMonth() - 1;
    let y = this.viewYear();
    if (m < 1) {
      m = 12;
      y--;
    }
    this.viewMonth.set(m);
    this.viewYear.set(y);
  }

  nextMonth(): void {
    let m = this.viewMonth() + 1;
    let y = this.viewYear();
    if (m > 12) {
      m = 1;
      y++;
    }
    this.viewMonth.set(m);
    this.viewYear.set(y);
  }

  selectDay(dayNumber: number): void {
    if (dayNumber <= 0) return;
    this.selectedYear.set(this.viewYear());
    this.selectedMonth.set(this.viewMonth());
    this.selectedDay.set(dayNumber);
  }

  // Alarm Clock Hour Controls
  incrementHour(): void {
    let h = this.selectedHour12() + 1;
    if (h > 12) h = 1;
    this.selectedHour12.set(h);
  }

  decrementHour(): void {
    let h = this.selectedHour12() - 1;
    if (h < 1) h = 12;
    this.selectedHour12.set(h);
  }

  onHourInputChange(raw: any): void {
    let num = parseInt(raw, 10);
    if (isNaN(num)) return;
    if (num > 12) num = 12;
    if (num < 1) num = 1;
    this.selectedHour12.set(num);
  }

  onHourWheel(event: WheelEvent): void {
    event.preventDefault();
    if (event.deltaY < 0) {
      this.incrementHour();
    } else {
      this.decrementHour();
    }
  }

  // Alarm Clock Minute Controls
  incrementMinute(step = 5): void {
    let m = this.selectedMinute() + step;
    if (m >= 60) m = 0;
    this.selectedMinute.set(m);
  }

  decrementMinute(step = 5): void {
    let m = this.selectedMinute() - step;
    if (m < 0) m = 55;
    this.selectedMinute.set(m);
  }

  onMinuteInputChange(raw: any): void {
    let num = parseInt(raw, 10);
    if (isNaN(num)) return;
    if (num > 59) num = 59;
    if (num < 0) num = 0;
    this.selectedMinute.set(num);
  }

  onMinuteWheel(event: WheelEvent): void {
    event.preventDefault();
    if (event.deltaY < 0) {
      this.incrementMinute(5);
    } else {
      this.decrementMinute(5);
    }
  }

  setQuickMinute(minute: number): void {
    this.selectedMinute.set(minute);
  }

  setPeriod(period: 'AM' | 'PM'): void {
    this.selectedPeriod.set(period);
  }

  // Quick presets
  setPresetNow(): void {
    const now = new Date();
    this.selectedYear.set(now.getFullYear());
    this.selectedMonth.set(now.getMonth() + 1);
    this.selectedDay.set(now.getDate());
    this.viewYear.set(now.getFullYear());
    this.viewMonth.set(now.getMonth() + 1);

    let h12 = now.getHours() % 12;
    if (h12 === 0) h12 = 12;
    this.selectedHour12.set(h12);
    this.selectedMinute.set(now.getMinutes());
    this.selectedPeriod.set(now.getHours() >= 12 ? 'PM' : 'AM');
  }

  setPresetTomorrow(): void {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    this.selectedYear.set(t.getFullYear());
    this.selectedMonth.set(t.getMonth() + 1);
    this.selectedDay.set(t.getDate());
    this.viewYear.set(t.getFullYear());
    this.viewMonth.set(t.getMonth() + 1);
    this.selectedHour12.set(10);
    this.selectedMinute.set(0);
    this.selectedPeriod.set('AM');
  }

  setPresetNextWeek(): void {
    const t = new Date();
    t.setDate(t.getDate() + 7);
    this.selectedYear.set(t.getFullYear());
    this.selectedMonth.set(t.getMonth() + 1);
    this.selectedDay.set(t.getDate());
    this.viewYear.set(t.getFullYear());
    this.viewMonth.set(t.getMonth() + 1);
    this.selectedHour12.set(10);
    this.selectedMinute.set(0);
    this.selectedPeriod.set('AM');
  }

  // Save / Apply confirmation
  confirm(): void {
    const y = this.selectedYear();
    const m = this.selectedMonth();
    const d = this.selectedDay();

    if (!y || !m || !d) {
      this.value.set(null);
      this.onChange(null);
      this.onTouched();
      this.closePicker();
      return;
    }

    let h24 = this.selectedHour12();
    if (this.selectedPeriod() === 'AM') {
      if (h24 === 12) h24 = 0;
    } else {
      if (h24 !== 12) h24 += 12;
    }
    const min = this.selectedMinute();

    // Construct exact local date without UTC offset skew
    const localDate = new Date(y, m - 1, d, h24, min, 0, 0);
    const isoString = localDate.toISOString();
    this.value.set(isoString);
    this.onChange(isoString);
    this.onTouched();
    this.closePicker();
  }

  clear(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.selectedYear.set(null);
    this.selectedMonth.set(null);
    this.selectedDay.set(null);
    this.value.set(null);
    this.onChange(null);
    this.onTouched();
    this.closePicker();
  }
}
