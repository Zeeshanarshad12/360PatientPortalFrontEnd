'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from '@/store';
import {
  closeNewMessage,
  createThread,
  Priority,
  Provider,
  fetchThreads
} from '@/slices/messagesSlice';
import {
  selectIsNewMessageOpen,
  selectProviders,
  selectProvidersLoading,
  selectSending,
  selectError
} from '@/store/selectors';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FormErrors {
  subject?: string;
  providerId?: string;
  body?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MEDIUM_OPTIONS = [
  { label: 'Other', value: 1 },
  { label: 'Medication Refill', value: 2 },
  { label: 'General', value: 3 },
  { label: 'Lab Results', value: 4 },
  { label: 'Appointment', value: 5 }
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const NewMessageModal: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsNewMessageOpen);
  const providers = useSelector(selectProviders);
  const sending = useSelector(selectSending);
  const apiError = useSelector(selectError);
  const providersLoading = useSelector(selectProvidersLoading);
  // ── Auth / context ─────────────────────────────────────────────────────────
  const userId = 1; // replace with actual auth selector
  const { patientId, practiceId } = useCurrentPatient();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [subject, setSubject] = useState('');
  const [providerId, setProviderId] = useState(''); // string id for <select>
  const [priority, setPriority] = useState<Priority>('Normal');
  const [body, setBody] = useState('');
  const [mediumId, setMediumId] = useState<number>(5); // patientCommunicationMediumId
  const [isPrivate, setIsPrivate] = useState(false);
  const [ccProviderIds, setCcProviderIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Refs ───────────────────────────────────────────────────────────────────
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // ── Auto-select if only one provider ──────────────────────────────────────
  useEffect(() => {
    if (providers.length > 0 && !providerId) setProviderId(providers[0].id);
  }, [providers]);

  // ── Focus first input on open ──────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [isOpen]);

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!subject.trim()) e.subject = 'Subject is required';
    if (!providerId) e.providerId = 'Please select a provider';
    if (!body.trim()) e.body = 'Message body is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CC Provider toggle
  // ─────────────────────────────────────────────────────────────────────────

  const handleCcToggle = (numericId: number) => {
    setCcProviderIds(
      (prev) =>
        prev.includes(numericId)
          ? prev.filter((id) => id !== numericId) // remove if already selected
          : [...prev, numericId] // add if not selected
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!validate()) return;

    const selectedProvider = providers.find((p) => p.id === providerId);
    console.log('selectedProvider:', selectedProvider);
    if (!selectedProvider) return;

    dispatch(
      createThread({
        patientId: Number(patientId),
        patientEmergencyContactId: null,
        patientCommunicationMediumId: mediumId,
        userId: Number(userId),
        assignedTo: selectedProvider.numericId,
        assignedToIds: ccProviderIds,
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
            status: 'open'
          })
        );
      }
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Reset / Close
  // ─────────────────────────────────────────────────────────────────────────

  const resetForm = () => {
    setSubject('');
    setProviderId(providers.length > 0 ? providers[0].id : '');
    setPriority('Normal');
    setBody('');
    setMediumId(5);
    setIsPrivate(false);
    setCcProviderIds([]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    dispatch(closeNewMessage());
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) handleClose();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Guard
  // ─────────────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────────────────
  // Derived
  // ─────────────────────────────────────────────────────────────────────────

  // Providers available for CC (exclude the primary selected provider)
  const ccProviderOptions = providers.filter((p) => p.id !== providerId);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="comm-modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="New Message"
    >
      <div className="comm-modal">
        {/* ── Header ────────────────────────────────────────────────────────── */}
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

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <div className="comm-modal__body">
          {/* Subject */}
          <div className="comm-form-group">
            <label className="comm-label">Subject</label>
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
            <label className="comm-label">Description</label>
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

          {/* Provider + Priority */}
          <div className="comm-form-row">
            {/* Primary Provider */}
            <div className="comm-form-group comm-form-group--half">
              <label className="comm-label">Provider</label>
              <div className="comm-select-wrapper">
                <select
                  className={`comm-select${
                    errors.providerId ? ' comm-input--error' : ''
                  }`}
                  value={providerId}
                  disabled={providersLoading}
                  onChange={(e) => {
                    setProviderId(e.target.value);
                    const selected = providers.find(
                      (p) => p.id === e.target.value
                    );
                    if (selected) {
                      setCcProviderIds((prev) =>
                        prev.filter((id) => id !== selected.numericId)
                      );
                    }
                    setErrors((p) => ({ ...p, providerId: undefined }));
                  }}
                >
                  <option value="">
                    {providersLoading
                      ? 'Loading providers...'
                      : 'Please Select'}{' '}
                    {/* */}
                  </option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="comm-select__chevron"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
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

          {/* CC Providers — only shown when a primary provider is selected and
              there are other providers available to CC                        */}
          {/* {providerId && ccProviderOptions.length > 0 && (
            <div className="comm-form-group">
              <label className="comm-label">CC Providers</label>
              <div className="comm-cc-providers">
                {ccProviderOptions.map((p: Provider) => (
                  <label
                    key={p.id}
                    className={`comm-cc-chip${
                      ccProviderIds.includes(p.numericId)
                        ? ' comm-cc-chip--selected'
                        : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={ccProviderIds.includes(p.numericId)}
                      onChange={() => handleCcToggle(p.numericId)}
                      style={{ display: 'none' }}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          )} */}

          {/* Channel 
          <div className="comm-form-group">
            <label className="comm-label">Channel</label>
            <div className="comm-select-wrapper">
              <select
                className="comm-select"
                value={mediumId}
                onChange={(e) => setMediumId(Number(e.target.value))}
              >
                {MEDIUM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <svg
                className="comm-select__chevron"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          Private toggle 
          <div
            className="comm-form-group"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
          >
            <label className="comm-label" style={{ marginBottom: 0 }}>
              Private Message
            </label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
          </div> */}

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

        {/* ── Footer ────────────────────────────────────────────────────────── */}
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
