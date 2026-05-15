'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from '@/store';
import {
  sendReply,
  updateThreadStatus,
  clearSuccess,
  clearError,
  Message
} from '@/slices/messagesSlice';
import {
  selectActiveThread,
  selectSending,
  selectError,
  selectSuccessMessage
} from '@/store/selectors';
import { Avatar } from './shared/Avatar';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** communicatedOn from API → "08:24 PM" */
function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** communicatedOn from API → "May 13, 2026" */
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
// MessageBubble
// ALL messages left-aligned: avatar left → name + time → bubble below
// Bubble color differs: patient = beige, provider = white
// ─────────────────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean; // patient = beige bubble, provider = white bubble
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => (
  <div className="comm-bubble-row">
    {/* Avatar — always left */}
    <div className="comm-bubble-avatar">
      <Avatar name={message.senderName} size={38} />
    </div>

    {/* Name + time + bubble */}
    <div className="comm-bubble-group">
      {/* "Dr. Ethan Sinclair  08:24 PM" */}
      <div className="comm-bubble-meta">
        <span className="comm-bubble-sender">{message.senderName}</span>
        <span className="comm-bubble-time">
          {formatTime(message.timestamp)}
        </span>
      </div>

      {/* Bubble */}
      <div
        className={`comm-bubble${
          isOwn ? ' comm-bubble--own' : ' comm-bubble--other'
        }`}
      >
        {message.content}
      </div>
    </div>
  </div>
);

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
        recipientId: Number(thread.providerId),
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
    console.log('updateThreadStatus payload:', {
      patientId: Number(thread.patientId),
      userId: 1,
      assignedTo: Number(thread.providerId),
      patientCommunicationMediumId: Number(thread.messageType),
      subject: thread.subject,
      priority: thread.priority,
      communicationText: thread.lastMessage
    });
    dispatch(
      updateThreadStatus({
        threadId: thread.id,
        patientCommunicationId: thread.patientCommunicationId,
        status,
        patientId: Number(thread.patientId),
        userId: 1, // from your auth
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

  const statusLabel = thread.status === 'open' ? 'Open Message' : 'Closed';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="comm-thread-view">
      {/* ── Header: patient avatar + name + "to: provider" ── */}
      <div className="comm-thread-view__header">
        <div className="comm-thread-view__header-info">
          <Avatar name={thread.patientName} size={42} />
          <div className="comm-thread-view__header-text">
            <div className="comm-thread-view__patient-name">
              {thread.patientName}
            </div>
            <div className="comm-thread-view__sub">
              to:{' '}
              <span className="comm-thread-view__provider">
                {thread.providerName}
              </span>
            </div>
          </div>
        </div>

        {/* Status dropdown — no priority, no count */}
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
            {/* Date divider */}
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
                  <MessageBubble message={msg} isOwn={isOwn} />
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
      {thread.status === 'open' && (
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

      {thread.status === 'closed' && (
        <div className="comm-thread-closed">
          This thread is closed. Mark as Open to reply.
        </div>
      )}
    </div>
  );
};
