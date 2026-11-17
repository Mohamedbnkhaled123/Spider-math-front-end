import { TestBed } from '@angular/core/testing';
import { ModalNavigationService, ModalNavigationEntry } from '../core/services/modal-navigation.service';
import { ConfirmDialogService } from '../core/services/confirm-dialog.service';

describe('Requirement R6: Modal Dismissal on Back Button Navigation with Draft Preservation', () => {
  let modalNav: ModalNavigationService;
  let confirmDialogService: ConfirmDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalNavigationService, ConfirmDialogService]
    });

    modalNav = TestBed.inject(ModalNavigationService);
    confirmDialogService = TestBed.inject(ConfirmDialogService);
    modalNav.clearStack();
  });

  afterEach(() => {
    modalNav.clearStack();
  });

  it('should push history state and register modal on open', () => {
    let closed = false;
    const entry: ModalNavigationEntry = {
      id: 'test-modal-1',
      close: () => {
        closed = true;
      }
    };

    modalNav.registerModal(entry);

    expect(modalNav.openModalCount()).toBe(1);
    expect(modalNav.topModalId()).toBe('test-modal-1');
    expect(closed).toBeFalse();
  });

  it('should intercept popstate, invoke saveDraft, and close the active modal without route departure', async () => {
    let draftSaved = false;
    let modalClosed = false;

    const entry: ModalNavigationEntry = {
      id: 'assessment-editor-modal',
      saveDraft: async () => {
        draftSaved = true;
      },
      close: () => {
        modalClosed = true;
      }
    };

    modalNav.registerModal(entry);

    // Simulate browser Back button / popstate event
    await modalNav.handlePopState(new PopStateEvent('popstate'));

    expect(draftSaved).toBeTrue();
    expect(modalClosed).toBeTrue();
    expect(modalNav.openModalCount()).toBe(0);
    expect(modalNav.topModalId()).toBeNull();
  });

  it('should dismiss nested modals in strict LIFO order upon consecutive back navigation', async () => {
    let modal1Closed = false;
    let modal2Closed = false;
    let modal2DraftSaved = false;

    // 1. Open Assessment Editor
    modalNav.registerModal({
      id: 'assessment-editor',
      close: () => {
        modal1Closed = true;
      }
    });

    // 2. Open AI Extraction Modal on top of Assessment Editor
    modalNav.registerModal({
      id: 'ai-extraction-modal',
      saveDraft: () => {
        modal2DraftSaved = true;
      },
      close: () => {
        modal2Closed = true;
      }
    });

    expect(modalNav.openModalCount()).toBe(2);
    expect(modalNav.topModalId()).toBe('ai-extraction-modal');

    // First Back press: closes AI extraction modal only, saving its draft
    await modalNav.handlePopState(new PopStateEvent('popstate'));

    expect(modal2DraftSaved).toBeTrue();
    expect(modal2Closed).toBeTrue();
    expect(modal1Closed).toBeFalse(); // Modal 1 remains open!
    expect(modalNav.openModalCount()).toBe(1);
    expect(modalNav.topModalId()).toBe('assessment-editor');

    // Second Back press: closes Assessment Editor
    await modalNav.handlePopState(new PopStateEvent('popstate'));

    expect(modal1Closed).toBeTrue();
    expect(modalNav.openModalCount()).toBe(0);
  });

  it('should handle programmatic dismissal without duplicate popstate triggers', async () => {
    let closed = false;
    modalNav.registerModal({
      id: 'programmatic-modal',
      close: () => {
        closed = true;
      }
    });

    expect(modalNav.openModalCount()).toBe(1);

    await modalNav.dismissModal('programmatic-modal');
    expect(modalNav.openModalCount()).toBe(0);

    // If a popstate event arrives from window.history.back(), it should be safely swallowed
    await modalNav.handlePopState(new PopStateEvent('popstate'));
    expect(modalNav.openModalCount()).toBe(0);
  });

  it('should register ConfirmDialog with ModalNavigationService and cancel on popstate', async () => {
    let confirmedResult: boolean | null = null;

    // Trigger confirm dialog
    confirmDialogService
      .confirm({
        title: 'تأكيد الحذف',
        message: 'هل أنت متأكد؟'
      })
      .then((res) => {
        confirmedResult = res;
      });

    expect(confirmDialogService.state().isOpen).toBeTrue();
    expect(modalNav.topModalId()).toBe('confirm-dialog');

    // Simulate Back button popstate event
    await modalNav.handlePopState(new PopStateEvent('popstate'));

    expect(confirmDialogService.state().isOpen).toBeFalse();
    // Resolves false when cancelled via back button
    expect(confirmedResult).toBeFalse();
  });
});
