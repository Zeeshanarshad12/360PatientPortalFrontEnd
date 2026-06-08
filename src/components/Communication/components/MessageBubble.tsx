'use client';

import React from 'react';
import { Message } from '@/slices/messagesSlice';
import { Avatar } from './shared/Avatar';
import { formatMessageTime } from '@/utils/helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#EF4444">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline
      points="14,2 14,8 20,8"
      fill="none"
      stroke="white"
      strokeWidth="2"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="8 17 12 21 16 17" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isClosed: boolean; //  ADD — controls avatar gray color
}

function renderMessageContent(content: string): React.ReactNode {
  if (!content) return null;

  const decoded = content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x2F;/g, '/')
    .replace(/&#x60;/g, '`')
    .replace(/&#x3D;/g, '=');

  const withBreaks = decoded
    .replace(/\\\\n/g, '<br/>')
    .replace(/\\n/g, '<br/>');

  const hasHtml = /<[a-z][\s\S]*>/i.test(withBreaks);

  if (hasHtml) {
    const sanitized = withBreaks
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/javascript:/gi, '');

    return (
      <span
        className="comm-bubble__text"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  return (
    <span
      className="comm-bubble__text"
      style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
    >
      {withBreaks}
    </span>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  isClosed
}) => {
  return (
    <div className="comm-bubble-row">
      <div className="comm-bubble-avatar">
        <Avatar
          name={message.senderName}
          size={38}
          role={message.senderRole}
          isClosed={isClosed}
        />
      </div>

      <div className="comm-bubble-group">
        {/* Name + time */}
        <div className="comm-bubble-meta">
          <span className="comm-bubble-sender">{message.senderName}</span>
          <span className="comm-bubble-time">
            {formatMessageTime(message.timestamp)}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={`comm-bubble${
            isOwn ? ' comm-bubble--own' : ' comm-bubble--other'
          }`}
        >
          {renderMessageContent(message.content)}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="comm-message__attachments">
              {message.attachments.map((att) => (
                <div key={att.id} className="comm-attachment">
                  <FileIcon />
                  <div className="comm-attachment__info">
                    <span className="comm-attachment__name">{att.name}</span>
                    <span className="comm-attachment__size">{att.size}</span>
                  </div>
                  <button className="comm-attachment__dl" aria-label="Download">
                    <DownloadIcon />
                  </button>
                  {/*  removed stray 's' character that was here */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
