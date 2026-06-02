'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from '@/store';
import {
  sendReply,
  updateThreadStatus,
  clearSuccess,
  clearError,
  fetchThreads
} from '@/slices/messagesSlice';
import {
  selectActiveThread,
  selectSending,
  selectError,
  selectSuccessMessage,
  selectGroupOption
} from '@/store/selectors';
import { Avatar } from './shared/Avatar';
import { MessageBubble } from './MessageBubble';
import moment from 'moment';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import { Snackbar, Alert } from '@mui/material';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDateHeader(iso: string | null | undefined): string {
  if (!iso) return '';
  const m = moment(iso);
  if (!m.isValid()) return '';

  const today = moment().startOf('day');
  const yesterday = moment().subtract(1, 'day').startOf('day');
  const msgDay = m.clone().startOf('day');

  if (msgDay.isSame(today)) return 'Today';
  if (msgDay.isSame(yesterday)) return 'Yesterday';
  return m.format('MMMM D, YYYY');
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
  const { patientId, practiceId } = useCurrentPatient();
  const groupOption = useSelector(selectGroupOption);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: ''
  });

  const FILTER_ICONS: Record<string, string> = {
    open: '/statics/Mailopen.svg',
    closed: '/statics/Emailclose.svg'
  };

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReply(e.target.value);
    // Reset height then set to scrollHeight
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages]);

  useEffect(() => {
    if (successMsg) {
      setReply('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '36px';
      }
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
  const statusLabel = isClosed ? 'Closed Message' : 'Open Message';

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
    debugger;
    if (!thread) return;
    console.log('threadData', thread);
    dispatch(
      updateThreadStatus({
        threadId: thread.id,
        patientCommunicationId: thread.patientCommunicationId,
        status,
        patientId: Number(patientId) || Number(thread.practiceId),
        userId: null, //need to change it
        assignedTo: Number(thread.providerId),
        patientCommunicationMediumId: Number(thread.messageType),
        subject: thread.subject,
        priority: thread.priority,
        communicationText: thread.lastMessage,
        isPrivate: false,
        practiceId: Number(thread.practiceId) || Number(practiceId)
      })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setStatusMenuOpen(false);
        setSnackbar({
          open: true,
          message:
            status === 'closed'
              ? 'Message closed successfully'
              : 'Message opened successfully'
        });
        dispatch(
          fetchThreads({
            patientId: Number(patientId),
            practiceId: Number(practiceId),
            status: groupOption
          })
        );
      }
    });
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
              {thread.ccAssigned?.filter((cc) => cc.ccAssignedTo?.trim())
                .length > 0 && (
                <span>
                  &nbsp;·&nbsp;cc:{' '}
                  <span style={{ color: '#006ad4' }}>
                    {thread.ccAssigned
                      .filter((cc) => cc.ccAssignedTo?.trim())
                      .map((cc) => cc.ccAssignedTo.trim())
                      .join(', ')}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status dropdown */}
        <div className="comm-status-dropdown" ref={menuRef}>
          <button
            className="comm-status-btn"
            onClick={() => setStatusMenuOpen((v) => !v)}
          >
            <img
              src={isClosed ? FILTER_ICONS.closed : FILTER_ICONS.open}
              alt={statusLabel}
              width={16}
              height={16}
            />
            {statusLabel}
          </button>

          {statusMenuOpen && (
            <div className="comm-status-menu">
              <div className="comm-status-menu__label">Message Status</div>
              <button
                className="comm-status-menu__item"
                onClick={() => handleStatusChange('open')}
              >
                <img
                  src={FILTER_ICONS.open}
                  alt="open"
                  width={14}
                  height={14}
                />
                Mark as Open
              </button>
              <button
                className="comm-status-menu__item"
                onClick={() => handleStatusChange('closed')}
              >
                <img
                  src={FILTER_ICONS.closed}
                  alt="closed"
                  width={14}
                  height={14}
                />
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

            {messages.map((msg) => {
              const isOwn = msg.senderRole === 'patient';
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={isOwn}
                  isClosed={isClosed}
                />
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
            onChange={handleReplyChange}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{
              height: '36px',
              minHeight: '36px',
              maxHeight: '120px',
              overflowY: 'auto',
              resize: 'none'
            }}
          />
          <div className="comm-reply-box__actions">
            <button
              className="comm-send-btn"
              onClick={handleSend}
              disabled={sending || !reply.trim()}
              aria-label="Send Message"
              data-tooltip="Send Message"
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
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity="success"
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};
