'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from '@/store';
import {
  closeNewMessage,
  createThread,
  Priority,
  fetchThreads,
  clearError
} from '@/slices/messagesSlice';
import {
  selectIsNewMessageOpen,
  selectProviders,
  selectProvidersLoading,
  selectSending,
  selectError,
  selectGroupOption
} from '@/store/selectors';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';

interface FormErrors {
  subject?: string;
  providerId?: string;
  body?: string;
}

const TOOLTIP_ID = 'comm-provider-tooltip';

export const NewMessageModal: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsNewMessageOpen);
  const providers = useSelector(selectProviders);
  const sending = useSelector(selectSending);
  const apiError = useSelector(selectError);
  const providersLoading = useSelector(selectProvidersLoading);
  const groupOption = useSelector(selectGroupOption);

  const { patientId, practiceId } = useCurrentPatient();

  const [subject, setSubject] = useState('');
  const [providerId, setProviderId] = useState('');
  const [priority, setPriority] = useState<Priority>('Normal');
  const [body, setBody] = useState('');
  const [mediumId, setMediumId] = useState<number>(5);
  const [isPrivate, setIsPrivate] = useState(false);
  const [ccProviderIds, setCcProviderIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [providerSearch, setProviderSearch] = useState('');
  const providerDropdownRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) dispatch(clearError());
    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        providerDropdownRef.current &&
        !providerDropdownRef.current.contains(e.target as Node)
      ) {
        setShowProviderMenu(false);
        setProviderSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!showProviderMenu) {
      removeTooltip();
      return;
    }

    const items = document.querySelectorAll<HTMLElement>(
      '.comm-provider-item[data-tooltip]'
    );

    const onEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const name = el.getAttribute('data-tooltip');
      if (!name) return;

      removeTooltip();

      const rect = el.getBoundingClientRect();
      const tip = document.createElement('div');
      tip.id = TOOLTIP_ID;
      Object.assign(tip.style, {
        position: 'fixed',
        top: `${rect.top - 34}px`,
        left: `${rect.left}px`,
        background: '#006ad4',
        color: '#fff',
        fontSize: '11px',
        fontWeight: '500',
        fontFamily: 'Open Sans, sans-serif',
        padding: '5px 10px',
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: '9999',
        boxShadow: '0 2px 8px rgba(0,106,212,0.2)',
        transition: 'opacity 0.15s ease',
        opacity: '0'
      });
      tip.textContent = name;
      document.body.appendChild(tip);

      requestAnimationFrame(() => {
        const t = document.getElementById(TOOLTIP_ID);
        if (t) t.style.opacity = '1';
      });
    };

    const onLeave = () => removeTooltip();

    items.forEach((item) => {
      item.addEventListener('mouseenter', onEnter);
      item.addEventListener('mouseleave', onLeave);
    });

    return () => {
      items.forEach((item) => {
        item.removeEventListener('mouseenter', onEnter);
        item.removeEventListener('mouseleave', onLeave);
      });
      removeTooltip();
    };
  }, [showProviderMenu, providerSearch]);

  useEffect(() => {
    return () => removeTooltip();
  }, []);

  if (!isOpen) return null;

  function removeTooltip() {
    const tip = document.getElementById(TOOLTIP_ID);
    if (tip) tip.remove();
  }

  const filteredProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(providerSearch.toLowerCase())
  );

  const selectedProviderName =
    providers.find((p) => p.id === providerId)?.name || '';

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!subject.trim()) e.subject = 'Subject is required';
    if (!providerId) e.providerId = 'Provider is required';
    if (!body.trim()) e.body = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const selectedProvider = providers.find((p) => p.id === providerId);
    if (!selectedProvider) return;

    dispatch(
      createThread({
        patientId: Number(patientId),
        patientEmergencyContactId: null,
        patientCommunicationMediumId: mediumId,
        userId: 1,
        assignedTo: selectedProvider.numericId,
        subject: subject.trim(),
        priority,
        body: body.trim(),
        communicationStatus: 'open',
        isPrivate,
        providerId: selectedProvider.numericId,
        providerName: selectedProvider.name,
        patientName: '',
        messageType: String(mediumId),
        practiceId: Number(practiceId)
      })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        resetForm();
        dispatch(closeNewMessage());
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

  const resetForm = () => {
    setSubject('');
    setProviderId('');
    setPriority('Normal');
    setBody('');
    setMediumId(5);
    setIsPrivate(false);
    setCcProviderIds([]);
    setErrors({});
    setProviderSearch('');
    setShowProviderMenu(false);
    removeTooltip();
  };

  const handleClose = () => {
    resetForm();
    dispatch(closeNewMessage());
  };

  const triggerRect = providerDropdownRef.current?.getBoundingClientRect();
  const spaceBelow = triggerRect
    ? window.innerHeight - triggerRect.bottom
    : 300;
  const openUpward = spaceBelow < 240;

  return (
    <div
      className="comm-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="New Message"
    >
      <div className="comm-modal">
        {/* ── Header ── */}
        <div className="comm-modal__header">
          <h3 className="comm-modal__title">New Message</h3>
          <button
            className="comm-modal__close"
            onClick={handleClose}
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="comm-modal__body">
          {/* Subject */}
          <div className="comm-form-group">
            <label className="comm-label">
              Subject <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              ref={firstInputRef}
              className={`comm-input${
                errors.subject ? ' comm-input--error' : ''
              }`}
              placeholder="Please enter subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setErrors((p) => ({ ...p, subject: undefined }));
              }}
            />
            {errors.subject && (
              <span className="comm-error-text">{errors.subject}</span>
            )}
          </div>

          {/* Description */}
          <div className="comm-form-group">
            <label className="comm-label">
              Description <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              className={`comm-textarea${
                errors.body ? ' comm-input--error' : ''
              }`}
              placeholder="Add Description"
              value={body}
              rows={4}
              onChange={(e) => {
                setBody(e.target.value);
                setErrors((p) => ({ ...p, body: undefined }));
              }}
            />
            {errors.body && (
              <span className="comm-error-text">{errors.body}</span>
            )}
          </div>

          <div className="comm-form-row">
            <div className="comm-form-group comm-form-group--half">
              <label className="comm-label">
                Provider <span style={{ color: 'red' }}>*</span>
              </label>

              <div ref={providerDropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className={`comm-input${
                    errors.providerId ? ' comm-input--error' : ''
                  }`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    background: providersLoading ? '#f8fafc' : '#ffffff'
                  }}
                  onClick={() => {
                    if (!providersLoading) setShowProviderMenu((v) => !v);
                  }}
                  disabled={providersLoading}
                >
                  <span
                    style={{
                      color: selectedProviderName ? '#1e293b' : '#94a3b8',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}
                  >
                    {providersLoading
                      ? 'Loading providers...'
                      : selectedProviderName || 'Please Select'}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    style={{
                      flexShrink: 0,
                      marginLeft: 6,
                      transform: showProviderMenu
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Dropdown */}
                {showProviderMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      ...(openUpward
                        ? { bottom: 'calc(100% + 4px)', top: 'auto' }
                        : { top: 'calc(100% + 4px)', bottom: 'auto' }),
                      left: 0,
                      right: 0,
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      zIndex: 1400,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      maxHeight: '220px',
                      minWidth: '100%',
                      width: 'max-content',
                      maxWidth: '400px'
                    }}
                  >
                    <div
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid #f1f5f9',
                        flexShrink: 0
                      }}
                    >
                      <input
                        className="comm-input"
                        placeholder="Search provider..."
                        value={providerSearch}
                        onChange={(e) => setProviderSearch(e.target.value)}
                        autoFocus
                        style={{
                          padding: '6px 10px',
                          fontSize: '13px',
                          marginBottom: 0
                        }}
                      />
                    </div>

                    {/* List */}
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                      {filteredProviders.length === 0 ? (
                        <div
                          style={{
                            padding: '12px 14px',
                            color: '#94a3b8',
                            fontSize: '13px',
                            textAlign: 'center'
                          }}
                        >
                          No providers found
                        </div>
                      ) : (
                        filteredProviders.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="comm-provider-item"
                            data-tooltip={
                              p.name.length > 30 ? p.name : undefined
                            }
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '9px 14px',
                              background:
                                providerId === p.id ? '#eff6ff' : 'none',
                              border: 'none',
                              borderBottom: '1px solid #f8fafc',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '13.5px',
                              color:
                                providerId === p.id ? '#006ad4' : '#1e293b',
                              fontWeight: providerId === p.id ? 600 : 400,
                              fontFamily: 'Open Sans, sans-serif',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            onClick={() => {
                              setProviderId(p.id);
                              setCcProviderIds((prev) =>
                                prev.filter((id) => id !== p.numericId)
                              );
                              setErrors((e) => ({
                                ...e,
                                providerId: undefined
                              }));
                              setShowProviderMenu(false);
                              setProviderSearch('');
                            }}
                          >
                            {p.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {errors.providerId && (
                <span className="comm-error-text">{errors.providerId}</span>
              )}
            </div>

            {/* Priority */}
            <div className="comm-form-group comm-form-group--half">
              <label className="comm-label">Priority</label>
              <div className="comm-priority-toggle">
                {(['Normal', 'Urgent'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`comm-priority-btn${
                      priority === p ? ' comm-priority-btn--active' : ''
                    }`}
                    onClick={() => setPriority(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* API Error */}
          {apiError && (
            <div
              className="comm-notification comm-notification--error"
              style={{ marginTop: 0, marginBottom: 8 }}
            >
              <span>{apiError}</span>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="comm-modal__footer">
          <button
            className="comm-btn comm-btn--ghost"
            onClick={handleClose}
            disabled={sending}
          >
            Cancel
          </button>
          <button
            className="comm-btn comm-btn--primary"
            onClick={handleSubmit}
            disabled={sending}
          >
            {sending ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  className="comm-spin"
                  style={{ marginRight: 6 }}
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
                Sending...
              </>
            ) : (
              'Create'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
