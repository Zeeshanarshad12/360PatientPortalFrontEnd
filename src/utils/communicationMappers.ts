import {
  ApiThread,
  Thread,
  Message,
  Provider,
  CommunicationComment
} from '@/slices/messagesSlice';

export function mapApiThreadToThread(item: ApiThread): Thread {
  console.log(
    'Thread priority raw value:',
    item.id,
    JSON.stringify(item.priority)
  );

  const rootMessage: Message = {
    id: `comm-${item.id}`,
    senderId: String(item.recipientId),
    senderName: item.recipient,
    senderAvatar: '',
    senderRole: 'provider',
    content: item.communicationText,
    timestamp:
      item.communicatedOn ??
      item.communicationComments?.[0]?.communicatedOn ??
      new Date().toISOString()
  };

  const uniqueComments = Array.from(
    new Map((item.communicationComments ?? []).map((c) => [c.id, c])).values()
  ).sort(
    (a, b) =>
      new Date(a.communicatedOn).getTime() -
      new Date(b.communicatedOn).getTime()
  );

  const commentMessages: Message[] = uniqueComments.map(mapCommentToMessage);
  const allMessages = [rootMessage, ...commentMessages];
  const lastMsg = allMessages[allMessages.length - 1];

  const normalizedPriority = (() => {
    const p = item.priority?.toLowerCase();
    if (p === 'urgent' || p === 'high') return 'Urgent';
    return 'Normal';
  })();

  console.log('normalizedPriority:', item.id, normalizedPriority); // 👇 check this
  return {
    id: String(item.id),
    patientCommunicationId: item.id,
    recipientId: item.recipientId,
    subject: item.communicationSubject,
    providerId: String(item.recipientId),
    providerName: item.recipient,
    providerAvatar: '',
    patientId: String(item.recipientId),
    patientName: item.patientName,
    patientAvatar: '',
    priority: normalizedPriority,
    status: item.status?.toLowerCase() === 'closed' ? 'closed' : 'open',
    messageType: String(item.patientCommunicationMediumId),
    messages: allMessages,
    lastMessage: lastMsg?.content ?? '',
    lastActivity: lastMsg?.timestamp ?? item.communicatedOn,
    unreadCount: 0,
    isRead: true,
    isFlagged: normalizedPriority === 'Urgent'
  };
}

export function mapCommentToMessage(comment: CommunicationComment): Message {
  return {
    id: `comment-${comment.id}`,
    senderId: comment.createdBy,
    senderName: comment.createdBy,
    senderAvatar: '',
    senderRole: 'patient', // adjust: if createdBy matches provider id → 'provider'
    content: comment.communicationText,
    timestamp: comment.communicatedOn
  };
}
export function extractProviders(data: ApiThread[]): Provider[] {
  const seen = new Set<number>();
  return data.reduce<Provider[]>((acc, item) => {
    if (!seen.has(item.recipientId)) {
      seen.add(item.recipientId);
      acc.push({
        id: String(item.recipientId),
        numericId: item.recipientId, // ← raw numeric id
        name: item.recipient,
        specialty: '',
        avatar: ''
      });
    }
    return acc;
  }, []);
}
