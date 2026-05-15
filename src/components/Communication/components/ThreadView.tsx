'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from '@/store';
import {
  sendReply,
  updateThreadStatus,
  clearSuccess,
  clearError
} from '@/slices/messagesSlice';
import {
  selectActiveThread,
  selectSending,
  selectError,
  selectSuccessMessage
} from '@/store/selectors';
import { Avatar } from './shared/Avatar';
import { MessageBubble } from './MessageBubble';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeader(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString([], {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ThreadView
// ─────────────────────────────────────────────────────────────────────────────

export const ThreadView: React.FC = () => {
  const dispatch = useDispatch();
  const thread = useSelector(selectActiveThread);
  const sending = useSelector(selectSending);
  const error = useSelector(selectError);
  const successMsg = useSelector(selectSuccessMessage);

  const [reply, setReply] = useState('');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages]);

  useEffect(() => {
    if (successMsg) {
      setReply('');
      const t = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg, dispatch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!thread) {
    return (
      <div className="comm-thread-view comm-thread-view--empty">
        <div className="comm-thread-view__placeholder">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>Select a message thread to view the conversation</p>
        </div>
      </div>
    );
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const isClosed = thread.status === 'closed';
  const statusLabel = isClosed ? 'Closed' : 'Open Message';

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSend = () => {
    if (!reply.trim() || !thread) return;
    if (!thread.patientCommunicationId || thread.patientCommunicationId === 0) {
      console.error('Invalid patientCommunicationId — cannot send reply');
      return;
    }
    dispatch(
      sendReply({
        threadId: thread.id,
        patientCommunicationId: thread.patientCommunicationId,
        recipientId: Number(thread.providerId) || 0,
        subject: thread.subject,
        content: reply.trim(),
        createdBy: thread.patientName
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStatusChange = (status: 'open' | 'closed') => {
    if (!thread) return;
    dispatch(
      updateThreadStatus({
        threadId: thread.id,
        patientCommunicationId: thread.patientCommunicationId,
        status,
        patientId: Number(thread.patientId),
        userId: 1,
        assignedTo: Number(thread.providerId),
        patientCommunicationMediumId: Number(thread.messageType),
        subject: thread.subject,
        priority: thread.priority,
        communicationText: thread.lastMessage,
        isPrivate: false
      })
    );
    setStatusMenuOpen(false);
  };

  // ── Group messages by date ─────────────────────────────────────────────────
  const messagesByDate: {
    dateLabel: string;
    messages: typeof thread.messages;
  }[] = [];
  thread.messages.forEach((msg) => {
    const label = formatDateHeader(msg.timestamp) || 'Unknown Date';
    const last = messagesByDate[messagesByDate.length - 1];
    if (!last || last.dateLabel !== label) {
      messagesByDate.push({ dateLabel: label, messages: [msg] });
    } else {
      last.messages.push(msg);
    }
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="comm-thread-view">
      {/* ── Header ── */}
      <div className="comm-thread-view__header">
        <div className="comm-thread-view__header-info">
          <Avatar
            name={thread.initiatorName}
            size={42}
            role={thread.initiatorRole}
            isClosed={isClosed}
          />
          <div className="comm-thread-view__header-text">
            <div className="comm-thread-view__patient-name">
              {thread.initiatorName}
            </div>
            <div className="comm-thread-view__sub">
              to:{' '}
              <span className="comm-thread-view__provider">
                {thread.toName}
              </span>
            </div>
          </div>
        </div>

        {/* Status dropdown */}
        <div className="comm-status-dropdown" ref={menuRef}>
          <button
            className="comm-status-btn"
            onClick={() => setStatusMenuOpen((v) => !v)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {statusLabel}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: statusMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {statusMenuOpen && (
            <div className="comm-status-menu">
              <div className="comm-status-menu__label">Message Status</div>
              <button
                className="comm-status-menu__item"
                onClick={() => handleStatusChange('open')}
              >
                Mark as Open
              </button>
              <button
                className="comm-status-menu__item"
                onClick={() => handleStatusChange('closed')}
              >
                Mark as Closed
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Subject bar ── */}
      <div className="comm-thread-view__subject-bar">
        <span className="comm-thread-view__subject">{thread.subject}</span>
      </div>

      {/* ── Messages ── */}
      <div className="comm-thread-view__messages">
        {messagesByDate.map(({ dateLabel, messages }) => (
          <div key={dateLabel}>
            <div className="comm-date-divider">
              <span>{dateLabel}</span>
            </div>

            {messages.map((msg, idx) => {
              const isOwn = msg.senderRole === 'patient';
              const prevMsg = messages[idx - 1];
              const showNewMsg =
                prevMsg && isOwn !== (prevMsg.senderRole === 'patient');

              return (
                <React.Fragment key={msg.id}>
                  {showNewMsg && (
                    <div className="comm-message-divider">
                      <span>New Message</span>
                    </div>
                  )}
                  {/* ✅ isClosed passed from thread — no reference to thread inside MessageBubble */}
                  <MessageBubble
                    message={msg}
                    isOwn={isOwn}
                    isClosed={isClosed}
                  />
                </React.Fragment>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Notifications ── */}
      {error && (
        <div className="comm-notification comm-notification--error">
          <span>{error}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSend} style={{ fontWeight: 600 }}>
              Retry
            </button>
            <button onClick={() => dispatch(clearError())}>×</button>
          </div>
        </div>
      )}
      {successMsg && (
        <div className="comm-notification comm-notification--success">
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Reply box ── */}
      {!isClosed && (
        <div className="comm-reply-box">
          <textarea
            ref={textareaRef}
            className="comm-reply-box__input"
            placeholder="text message.."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <div className="comm-reply-box__actions">
            <button
              className="comm-send-btn"
              onClick={handleSend}
              disabled={sending || !reply.trim()}
              aria-label="Send"
            >
              {sending ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  className="comm-spin"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray="31.4"
                    strokeDashoffset="10"
                  />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {isClosed && (
        <div className="comm-thread-closed">
          This thread is closed. Mark as Open to reply.
        </div>
      )}
    </div>
  );
};
