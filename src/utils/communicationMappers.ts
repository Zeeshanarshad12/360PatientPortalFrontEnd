import {
  ApiThread,
  Thread,
  Message,
  Provider,
  CommunicationComment,
  CommunicationCommentDetail
} from '@/slices/messagesSlice';
import moment from 'moment';
import { decodeHtmlEntities } from '@/utils/helpers';

// ─────────────────────────────────────────────────────────────────────────────
// mapApiThreadToThread
// ─────────────────────────────────────────────────────────────────────────────

const toLocalISO = (iso: string | null | undefined): string => {
  if (!iso) return moment().format();
  const m = moment(iso); // handles +05:00 offsets correctly
  return m.isValid() ? m.local().format() : moment().format();
};

export function mapApiThreadToThread(item: ApiThread): Thread {
  //  Use API-provided initiator field directly — no guessing
  const isPatientInitiated = item.initiator === 'patient';

  const toName = item.recipient?.trim() || 'Unknown';

  // Sidebar shows who started the conversation (like Outlook inbox "From")
  const initiatorName = isPatientInitiated
    ? item.patientName?.trim() || 'Patient'
    : item.createdBy?.trim() || 'Provider';

  const initiatorRole: 'patient' | 'provider' = isPatientInitiated
    ? 'patient'
    : 'provider';

  // recipientId is always the provider/staff being messaged, regardless of
  // who initiated the thread — the list endpoint no longer returns a
  // separate providerID field.
  const providerId = String(item.recipientId || 0);

  // ── Root message ────────────────────────────────────────────────────────────
  const rootMessage: Message = {
    id: `comm-${item.id}`,
    senderId: isPatientInitiated ? String(item.recipientId) : item.createdBy,
    senderName: initiatorName,
    senderAvatar: '',
    senderRole: initiatorRole,
    content: item.communicationText,
    timestamp: toLocalISO(item.createdAt ?? item.communicatedOn)
  };

  // ── Deduplicate + sort comments oldest → newest ──────────────────────────────
  const uniqueComments = Array.from(
    new Map((item.communicationComments ?? []).map((c) => [c.id, c])).values()
  ).sort(
    (a, b) =>
      moment(a.createdAt || a.communicatedOn).valueOf() -
      moment(b.createdAt || b.communicatedOn).valueOf()
  );

  const firstComment = uniqueComments[0];
  const rootDuplicatesFirstComment =
    firstComment &&
    firstComment.communicationText?.trim() === item.communicationText?.trim();

  const commentMessages: Message[] = uniqueComments.map((c) =>
    mapCommentToMessage(c, item.patientName, item.recipient)
  );

  const allMessages = rootDuplicatesFirstComment
    ? commentMessages
    : [rootMessage, ...commentMessages];
  const lastMsg = allMessages[allMessages.length - 1];

  // ── Normalize priority ───────────────────────────────────────────────────────
  const normalizedPriority = (() => {
    const p = item.priority?.toLowerCase();
    if (p === 'urgent' || p === 'high') return 'Urgent' as const;
    return 'Normal' as const;
  })();

  function stripHtmlForPreview(text: string): string {
    if (!text) return '';
    return decodeHtmlEntities(text)
      .replace(/\\\\n/g, ' ')
      .replace(/\\n/g, ' ')
      .replace(/&lt;br\s*\/?&gt;/gi, ' ')
      .replace(/&lt;[^&gt;]*&gt;/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return {
    id: String(item.id),
    patientCommunicationId: item.id,
    recipientId: item.recipientId,
    subject: decodeHtmlEntities(
      item.communicationSubject?.trim() || 'No Subject'
    ),
    providerId: String(providerId),
    providerName: item.recipient?.trim() || 'Unknown Provider',
    providerAvatar: '',
    patientId: String(item.patientId),
    patientName: item.patientName?.trim() || 'Unknown Patient',
    patientAvatar: '',
    priority: normalizedPriority,
    isFlagged: normalizedPriority === 'Urgent',
    status: item.status?.toLowerCase() === 'closed' ? 'closed' : 'open',
    messageType: String(item.patientCommunicationMediumId),
    messages: allMessages,
    lastMessage: stripHtmlForPreview(lastMsg?.content ?? ''),
    lastActivity: toLocalISO(
      lastMsg?.timestamp ?? item.createdAt ?? item.communicatedOn
    ),
    unreadCount: 0,
    isRead: true,
    initiatorName,
    initiatorRole,
    toName,
    practiceId: item.practiceId ?? 0,
    ccAssigned: item.ccAssigned ?? []
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// mapCommentToMessage
// Uses comment.isProvider field from API
// ─────────────────────────────────────────────────────────────────────────────

export function mapCommentToMessage(
  comment: CommunicationComment,
  patientNameFallback?: string,
  providerNameFallback?: string
): Message {
  const isProviderComment = comment.isProvider === true;

  // Sender name — use createdBy first, then fallback
  const senderName = (() => {
    if (comment.createdBy?.trim()) return comment.createdBy.trim();
    if (isProviderComment) return providerNameFallback?.trim() || 'Provider';
    return patientNameFallback?.trim() || 'Patient';
  })();

  return {
    id: `comment-${comment.id}`,
    senderId: String(comment.recipientId ?? 0),
    senderName,
    senderAvatar: '',
    senderRole: isProviderComment ? 'provider' : 'patient', // from API isProvider
    content: comment.communicationText,
    timestamp: toLocalISO(comment.createdAt ?? comment.communicatedOn)
  };
}

// Map GetAllComments response item to Message
export function mapCommentDetailToMessage(
  item: CommunicationCommentDetail
): Message {
  const isProvider = item.initiator === 'provider';

  return {
    id: `comment-${item.id}`,
    senderId: String(item.providerId ?? item.recipientId ?? 0),
    senderName:
      item.createdBy?.trim() ||
      (isProvider ? item.recipient : item.patientName),
    senderAvatar: '',
    senderRole: isProvider ? 'provider' : 'patient',
    content: item.communicationText ?? '',
    timestamp: item.createdAt
      ? moment(item.createdAt).toISOString()
      : moment(item.communicatedOn).toISOString()
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// extractProviders
// ─────────────────────────────────────────────────────────────────────────────

export function extractProviders(data: ApiThread[]): Provider[] {
  const seen = new Set<number>();
  return data.reduce<Provider[]>((acc, item) => {
    if (!seen.has(item.recipientId)) {
      seen.add(item.recipientId);
      acc.push({
        id: String(item.recipientId),
        numericId: item.recipientId,
        name: item.recipient?.trim() || 'Unknown Provider',
        specialty: '',
        avatar: ''
      });
    }
    return acc;
  }, []);
}
