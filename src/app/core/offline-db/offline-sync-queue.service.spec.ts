import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OfflineSyncQueueService } from './offline-sync-queue.service';

describe('OfflineSyncQueueService', () => {
  let service: OfflineSyncQueueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OfflineSyncQueueService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(OfflineSyncQueueService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate valid UUIDv4 strings', () => {
    const uuid = service.generateUUIDv4();
    expect(uuid).toBeDefined();
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(uuid)).toBeTrue();
  });

  it('should queue attempt and return an idempotency key', async () => {
    const key = await service.queueAttempt(
      'assessment_123',
      [{ question_id: 'q1', selected_option_index: 0 }],
      [],
      new Date().toISOString(),
      120
    );
    expect(key).toBeDefined();
    expect(typeof key).toBe('string');
  });
});
