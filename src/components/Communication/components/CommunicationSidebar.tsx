'use client';

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from '@/store';
import {
  fetchThreads,
  openNewMessage,
  setActiveThread,
  setGroupOption,
  GetAllComments,
  GroupOption
} from '@/slices/messagesSlice';
import {
  selectGroupedThreads,
  selectGroupOption,
  selectActiveThreadId,
  selectLoading
} from '@/store/selectors';
import { Avatar } from './shared/Avatar';
import { formatTimestamp, truncate } from '@/utils/helpers';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';

const GROUP_OPTIONS: { value: GroupOption; label: string }[] = [
  { value: 'all', label: 'All Messages' },
  { value: 'open', label: 'Open Messages' },
  { value: 'closed', label: 'Closed Messages' }
];

const FILTER_ICONS: Record<string, string> = {
  all: '/statics/EmailAll.svg',
  open: '/statics/Mailopen.svg',
  closed: '/statics/Emailclose.svg'
};

export const CommunicationSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const groups: any = useSelector(selectGroupedThreads);
  const group = useSelector(selectGroupOption);
  const activeId = useSelector(selectActiveThreadId);
  const loading = useSelector(selectLoading);

  const [search, setSearch] = React.useState('');
  const [showGroupMenu, setShowGroupMenu] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { patientId, practiceId } = useCurrentPatient();

  useEffect(() => {
    if (!patientId || !practiceId) return;
    dispatch(
      fetchThreads({
        patientId: Number(patientId),
        practiceId: Number(practiceId),
        status: group
      })
    );
  }, [dispatch, patientId, practiceId, group]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowGroupMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredGroups = groups
    .map((g: any) => ({
      ...g,
      items: g.items.filter((t: any) => {
        const q = search.toLowerCase();
        return (
          (t.subject ?? '').toLowerCase().includes(q) ||
          (t.initiatorName ?? '').toLowerCase().includes(q) ||
          (t.toName ?? '').toLowerCase().includes(q) ||
          (t.lastMessage ?? '').toLowerCase().includes(q)
        );
      })
    }))
    .filter((g: any) => g.items.length > 0);

  useEffect(() => {
    if (filteredGroups.length === 0 && search.trim()) {
      dispatch(setActiveThread(null));
    }
  }, [filteredGroups.length, search]);

  const handleFilterChange = (value: GroupOption) => {
    dispatch(setGroupOption(value));
    setShowGroupMenu(false);
  };

  const handleRefresh = () => {
    if (!patientId || !practiceId) return;
    dispatch(
      fetchThreads({
        patientId: Number(patientId),
        practiceId: Number(practiceId),
        status: group
      })
    );
  };

  return (
    <div className="comm-thread-list">
      {/* ── Header ── */}
      <div className="comm-thread-list__header">
        <div className="comm-thread-list__title">
          {/* Left: Messages heading + new message button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h2 className="comm-thread-list__heading">Messages</h2>
            <button
              className="comm-new-btn"
              onClick={() => dispatch(openNewMessage())}
              aria-label="Add New Message"
              data-tooltip="Add New Message"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#006ad4"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="6" x2="12" y2="18" />
                <line x1="6" y1="12" x2="18" y2="12" />
              </svg>
            </button>
          </div>

          {/* Right: refresh + filter dropdown */}
          <div className="comm-thread-list__actions">
            {/* Refresh */}
            <button
              className="comm-icon-btn"
              onClick={handleRefresh}
              aria-label="Refresh Messages"
              data-tooltip="Refresh Messages"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>

            {/* Filter dropdown */}
            <div className="comm-dropdown" ref={menuRef}>
              <button
                className="comm-icon-btn"
                onClick={() => setShowGroupMenu((v) => !v)}
                aria-label="Filter messages"
                data-tooltip="Filter Messages"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="5" r="1.8" />
                  <circle cx="12" cy="12" r="1.8" />
                  <circle cx="12" cy="19" r="1.8" />
                </svg>
              </button>

              {showGroupMenu && (
                <div className="comm-dropdown__menu">
                  {GROUP_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`comm-dropdown__item${
                        group === opt.value
                          ? ' comm-dropdown__item--active'
                          : ''
                      }`}
                      onClick={() => handleFilterChange(opt.value)}
                    >
                      <span className="comm-dropdown__item-icon">
                        <img
                          src={FILTER_ICONS[opt.value]}
                          alt={opt.label}
                          width="18"
                          height="18"
                          style={{ objectFit: 'contain' }}
                        />
                      </span>
                      <span style={{ flex: 1 }}>{opt.label}</span>
                      {group === opt.value && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#006ad4"
                          strokeWidth="2.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="comm-search">
          <svg
            className="comm-search__icon"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="comm-search__input"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Thread list body ── */}
      <div className="comm-thread-list__body">
        {loading ? (
          <div className="comm-thread-list__loading">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="comm-skeleton-row">
                <div className="comm-skeleton-avatar" />
                <div className="comm-skeleton-lines">
                  <div className="comm-skeleton-line comm-skeleton-line--short" />
                  <div className="comm-skeleton-line" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="comm-thread-list__empty">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>No messages found</p>
          </div>
        ) : (
          filteredGroups.map((grp: any) => (
            <div key={grp.label} className="comm-thread-group">
              {grp.label && (
                <div className="comm-thread-group__label">{grp.label}</div>
              )}
              {grp.items.map((thread: any) => {
                const isClosed = thread.status === 'closed';
                const isUrgent =
                  thread.isFlagged || thread.priority === 'Urgent';

                return (
                  <button
                    key={thread.id}
                    className={[
                      'comm-thread-item',
                      activeId === thread.id ? 'comm-thread-item--active' : '',
                      !thread.isRead ? 'comm-thread-item--unread' : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      dispatch(setActiveThread(thread.id));
                      if (thread.id) {
                        dispatch(GetAllComments(thread.id));
                      }
                    }}
                  >
                    {/* ── Avatar — no status dot ── */}
                    <div className="comm-thread-item__avatar">
                      <Avatar
                        name={thread.initiatorName}
                        size={40}
                        role={thread.initiatorRole}
                        isClosed={isClosed}
                      />
                    </div>

                    {/* ── Content ── */}
                    <div className="comm-thread-item__content">
                      {/* Row 1: Name + time + closed/flag stacked */}
                      <div className="comm-thread-item__top">
                        <span
                          className="comm-thread-item__name"
                          style={{
                            color: isClosed
                              ? 'var(--color-text-secondary)'
                              : 'var(--color-text-primary)'
                          }}
                        >
                          {thread.initiatorName}
                        </span>
                        <span className="comm-thread-item__time">
                          {formatTimestamp(thread.lastActivity)}
                        </span>
                      </div>

                      {/* ── Row 2: Preview + Flag + Closed — single row ── */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          minWidth: 0,
                          overflow: 'visible'
                        }}
                      >
                        {/* Preview — truncated, takes remaining space */}
                        <span
                          className="comm-thread-item__preview"
                          style={{
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            color: isClosed
                              ? 'var(--color-text-tertiary)'
                              : 'var(--color-text-secondary)'
                          }}
                        >
                          {truncate(thread.lastMessage, 45)}
                        </span>

                        {isUrgent && (
                          <span
                            className="comm-urgent-flag"
                            data-tooltip="Urgent Priority"
                          >
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="#EF4444"
                            >
                              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                              <line
                                x1="4"
                                y1="22"
                                x2="4"
                                y2="15"
                                stroke="#EF4444"
                                strokeWidth="2"
                              />
                            </svg>
                          </span>
                        )}

                        {isClosed && (
                          <span
                            style={{
                              fontSize: '10px',
                              color: '#888780',
                              fontWeight: 500,
                              lineHeight: 1,
                              backgroundColor: '#f1f0ec',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              flexShrink: 0,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
