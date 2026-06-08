import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store/index';
import { Thread } from '@/slices/messagesSlice';

// ─────────────────────────────────────────────────────────────────────────────
// Base Selectors
// ─────────────────────────────────────────────────────────────────────────────

export const selectAllThreads = (state: RootState) => state.messages.threads;
export const selectProviders = (state: RootState) => state.messages.providers;
export const selectActiveThreadId = (state: RootState) =>
  state.messages.activeThreadId;
export const selectSortOption = (state: RootState) => state.messages.sortOption;
export const selectGroupOption = (state: RootState) =>
  state.messages.groupOption;
export const selectIsNewMessageOpen = (state: RootState) =>
  state.messages.isNewMessageOpen;
export const selectLoading = (state: RootState) => state.messages.loading;
export const selectSending = (state: RootState) => state.messages.sending;
export const selectError = (state: RootState) => state.messages.error;
export const selectSuccessMessage = (state: RootState) =>
  state.messages.successMessage;
export const selectProvidersLoading = (state: RootState) =>
  state.messages.providersLoading;

// ─────────────────────────────────────────────────────────────────────────────
// selectActiveThread
// Returns the full Thread object for the currently selected thread id
// ─────────────────────────────────────────────────────────────────────────────

export const selectActiveThread = createSelector(
  selectAllThreads,
  selectActiveThreadId,
  (threads, id) => threads.find((t) => t.id === id) ?? null
);

// Comments Selectos

export const selectCommentsLoading = (state: any) =>
  state.messages.commentsLoading;

// ─────────────────────────────────────────────────────────────────────────────
// selectSortedThreads
// Sorts threads by lastActivity descending, then filters by sortOption
// sortOption: 'all' | 'unread' | 'read'
// ─────────────────────────────────────────────────────────────────────────────

export const selectSortedThreads = createSelector(
  selectAllThreads,
  selectSortOption,
  (threads, sort) => {
    // Always sort newest activity first
    const sorted = [...threads].sort((a, b) => {
      const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
      const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
      return bTime - aTime;
    });

    if (sort === 'unread') return sorted.filter((t) => !t.isRead);
    if (sort === 'read') return sorted.filter((t) => t.isRead);
    return sorted; // 'all'
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// selectGroupedThreads
// Groups threads based on groupOption which matches DB status values:
// 'all' | 'pending' | 'open' | 'closed'
// ─────────────────────────────────────────────────────────────────────────────

export const selectGroupedThreads = createSelector(
  selectSortedThreads,
  selectGroupOption,
  (threads, group): { label: string; items: Thread[] }[] => {
    // ── Filter by DB status ──────────────────────────────────────────────────
    // 'all'     → no filter, show everything
    // 'pending' → status === 'open' (pending maps to open in UI Thread shape)
    // 'open'    → status === 'open'
    // 'closed'  → status === 'closed'
    const filtered = (() => {
      if (group === 'closed')
        return threads.filter((t) => t.status === 'closed');
      if (group === 'open') return threads.filter((t) => t.status === 'open');
      return threads;
    })();

    return [{ label: '', items: filtered }];
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// selectTotalUnread
// Sum of unreadCount across all threads — used for badge in header
// ─────────────────────────────────────────────────────────────────────────────

export const selectTotalUnread = createSelector(selectAllThreads, (threads) =>
  threads.reduce((sum, t) => sum + (t.unreadCount ?? 0), 0)
);
