'use client';

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from '@/store';
import {
  fetchThreads,
  openNewMessage,
  setActiveThread,
  setGroupOption,
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

const FilterIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

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
        status: group === 'all' ? undefined : group
      })
    );
  }, [dispatch, patientId, practiceId, group]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowGroupMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleFilterChange = (value: GroupOption) => {
    dispatch(setGroupOption(value));
    setShowGroupMenu(false);
  };

  const filteredGroups = groups
    .map((g: any) => ({
      ...g,
      items: g.items.filter(
        (t: any) =>
          t.subject.toLowerCase().includes(search.toLowerCase()) ||
          t.providerName.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter((g: any) => g.items.length > 0);

  return (
    <div className="comm-thread-list">
      {/* Header */}
      <div className="comm-thread-list__header">
        <div className="comm-thread-list__title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="comm-thread-list__heading">Messages</h2>
            <button
              className="comm-new-btn"
              onClick={() => dispatch(openNewMessage())}
              aria-label="New message"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
          </div>

          {/* Filter dropdown */}
          <div className="comm-thread-list__actions">
            <div className="comm-dropdown" ref={menuRef}>
              <button
                className="comm-icon-btn"
                onClick={() => setShowGroupMenu((v) => !v)}
                aria-label="Filter messages"
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
                      <span
                        style={{
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <FilterIcon />
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

      {/* Thread list body */}
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
              {grp.items.map((thread: any) => (
                <button
                  key={thread.id}
                  className={`comm-thread-item${
                    activeId === thread.id ? ' comm-thread-item--active' : ''
                  }${!thread.isRead ? ' comm-thread-item--unread' : ''}`}
                  onClick={() => dispatch(setActiveThread(thread.id))}
                >
                  <div className="comm-thread-item__avatar">
                    <Avatar name={thread.providerName} size={40} />
                    {!thread.isRead && (
                      <span className="comm-thread-item__dot" />
                    )}
                  </div>
                  <div className="comm-thread-item__content">
                    <div className="comm-thread-item__top">
                      <span className="comm-thread-item__name">
                        {thread.providerName}
                      </span>
                      <span className="comm-thread-item__time">
                        {formatTimestamp(thread.lastActivity)}
                      </span>
                    </div>
                    <div className="comm-thread-item__preview">
                      {truncate(thread.lastMessage, 45)}
                    </div>
                  </div>
                  {thread.isFlagged ||
                    (thread.priority === 'Urgent' && (
                      <svg
                        className="comm-thread-item__flag"
                        width="14"
                        height="14"
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
                    ))}
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
