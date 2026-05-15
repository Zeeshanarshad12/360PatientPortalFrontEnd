'use client';

import React from 'react';
import { useDispatch, useSelector } from '@/store';
import { openNewMessage } from '@/slices/messagesSlice';
import { selectTotalUnread } from '@/store/selectors';

export const CommunicationHeader: React.FC = () => {
  const dispatch = useDispatch();
  const totalUnread: any = useSelector(selectTotalUnread);

  return (
    <div className="comm-header">
      <div className="comm-header__left">
        <div className="comm-header__breadcrumb">
          <span className="comm-header__breadcrumb-item">Home</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="comm-header__breadcrumb-item comm-header__breadcrumb-item--active">
            Messages
          </span>
        </div>
        <div className="comm-header__title-row">
          <h1 className="comm-header__title">
            Messages
            {totalUnread > 0 && (
              <span className="comm-header__unread-badge">{totalUnread}</span>
            )}
          </h1>
          <p className="comm-header__subtitle">
            Communicate securely with your care team
          </p>
        </div>
      </div>

      <div className="comm-header__right">
        <button
          className="comm-header__new-btn"
          onClick={() => dispatch(openNewMessage())}
          aria-label="New Message"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Message
        </button>
      </div>
    </div>
  );
};
