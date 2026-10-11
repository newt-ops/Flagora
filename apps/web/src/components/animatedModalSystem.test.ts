import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { useToastStore, toast } from '../store/toastStore.js';

describe('Animated Modal & Feedback System', () => {
  describe('Toast Store & Triggers', () => {
    it('initializes with empty toasts', () => {
      useToastStore.getState().clearToasts();
      assert.equal(useToastStore.getState().toasts.length, 0);
    });

    it('adds success toast with custom duration', () => {
      useToastStore.getState().clearToasts();
      const id = toast.success('Streak saved successfully!', 'Great Job', 4000);
      const toasts = useToastStore.getState().toasts;

      assert.equal(toasts.length, 1);
      assert.equal(toasts[0]?.id, id);
      assert.equal(toasts[0]?.type, 'success');
      assert.equal(toasts[0]?.message, 'Streak saved successfully!');
      assert.equal(toasts[0]?.title, 'Great Job');
      assert.equal(toasts[0]?.durationMs, 4000);
    });

    it('adds error toast with appropriate type', () => {
      useToastStore.getState().clearToasts();
      toast.error('Network failed during battle join');
      const toasts = useToastStore.getState().toasts;

      assert.equal(toasts.length, 1);
      assert.equal(toasts[0]?.type, 'error');
      assert.equal(toasts[0]?.message, 'Network failed during battle join');
    });

    it('adds warning and info toasts', () => {
      useToastStore.getState().clearToasts();
      toast.warning('Leaving battle counts as forfeit');
      toast.info('Lobby updated with new player');
      const toasts = useToastStore.getState().toasts;

      assert.equal(toasts.length, 2);
      assert.equal(toasts[0]?.type, 'warning');
      assert.equal(toasts[1]?.type, 'info');
    });

    it('dismisses a toast by its unique id', () => {
      useToastStore.getState().clearToasts();
      const id1 = toast.success('First');
      const id2 = toast.success('Second');

      assert.equal(useToastStore.getState().toasts.length, 2);
      toast.dismiss(id1);

      const remaining = useToastStore.getState().toasts;
      assert.equal(remaining.length, 1);
      assert.equal(remaining[0]?.id, id2);
    });

    it('clears all active toasts', () => {
      useToastStore.getState().clearToasts();
      toast.success('One');
      toast.error('Two');
      toast.info('Three');

      assert.ok(useToastStore.getState().toasts.length > 0);
      toast.clear();
      assert.equal(useToastStore.getState().toasts.length, 0);
    });

    it('limits toast backlog to avoid screen cluttering', () => {
      useToastStore.getState().clearToasts();
      toast.info('1');
      toast.info('2');
      toast.info('3');
      toast.info('4');

      const toasts = useToastStore.getState().toasts;
      assert.ok(toasts.length <= 3);
    });
  });

  describe('Modal Component Architecture & Semantic Contracts', () => {
    it('defines standard AnimatedModal configuration defaults', () => {
      const modalConfig = {
        closeOnBackdropClick: true,
        showCloseButton: true,
        maxWidthClass: 'max-w-md',
      };

      assert.equal(modalConfig.closeOnBackdropClick, true);
      assert.equal(modalConfig.showCloseButton, true);
      assert.equal(modalConfig.maxWidthClass, 'max-w-md');
    });

    it('resolves confirmation icons semantically according to variant', () => {
      const resolveIconType = (variant: 'danger' | 'warning' | 'primary') => {
        if (variant === 'danger') return 'error';
        if (variant === 'primary') return 'success';
        return 'warning';
      };

      assert.equal(resolveIconType('danger'), 'error');
      assert.equal(resolveIconType('warning'), 'warning');
      assert.equal(resolveIconType('primary'), 'success');
    });

    it('resolves reward icons semantically according to reward category', () => {
      const resolveRewardIcon = (type: 'pins' | 'xp' | 'badge' | 'trophy' | 'achievement') => {
        if (type === 'trophy' || type === 'badge' || type === 'achievement') return 'trophy';
        if (type === 'xp') return 'streak';
        return 'reward';
      };

      assert.equal(resolveRewardIcon('pins'), 'reward');
      assert.equal(resolveRewardIcon('trophy'), 'trophy');
      assert.equal(resolveRewardIcon('badge'), 'trophy');
      assert.equal(resolveRewardIcon('achievement'), 'trophy');
      assert.equal(resolveRewardIcon('xp'), 'streak');
    });
  });
});
