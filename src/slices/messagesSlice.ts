import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import SnackbarUtils from '../content/snackbar';
import apiServicesV2 from '@/services/requestHandler';
import {
  mapApiThreadToThread,
  mapCommentToMessage,
  extractProviders
} from '@/utils/communicationMappers';
import moment from 'moment';

export type Priority = 'Normal' | 'Urgent';
export type MessageStatus = 'open' | 'closed';
export type SortOption = 'all' | 'unread' | 'read';
export type GroupOption = 'all' | 'open' | 'closed';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: 'patient' | 'provider';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

export interface Thread {
  id: string;
  patientCommunicationId: number;
  recipientId: number;
  subject: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  priority: Priority;
  status: MessageStatus;
  messageType: string;
  messages: Message[];
  lastMessage: string;
  lastActivity: string;
  unreadCount: number;
  isRead: boolean;
  isFlagged?: boolean;
  initiatorName: string;
  initiatorRole: 'patient' | 'provider';
  toName: string;
  practiceId: number;
}

export interface Provider {
  id: string;
  name: string;
  numericId: number;
  specialty: string;
  avatar?: string;
}
export interface PatientProvider {
  providerId: number;
  practiceId: number;
  providerName: string;
  specialty?: string;
}

export interface MessagesState {
  threads: Thread[];
  providers: Provider[];
  providersLoading: boolean;
  activeThreadId: string | null;
  sortOption: SortOption;
  groupOption: GroupOption;
  isNewMessageOpen: boolean;
  loading: boolean;
  sending: boolean;
  error: string | null;
  successMessage: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CommunicationComment {
  id: number;
  patientCommunicationId: number;
  recipientId: number;
  practiceId: number;
  subject: string;
  communicationText: string;
  createdBy: string;
  communicatedOn: string;
  isPrivate: boolean;
  providerID: number;
  initiator: 'patient' | 'provider';
  createdAt: string;
}

export interface ApiThread {
  id: number;
  recipient: string;
  patientName: string;
  recipientId: number;
  providerID: number;
  priority: string;
  patientCommunicationMediumId: number;
  communicationSubject: string;
  communicationText: string;
  communicatedOn: string;
  status: string;
  createdBy: string;
  communicationComments: CommunicationComment[];
  initiator: 'patient' | 'provider';
  createdAt: string;
  practiceId: number;
  patientId: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch Params Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FetchThreadsParams {
  patientId: number;
  practiceId: number;
  status?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Thunk Payload Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateThreadPayload {
  subject: string;
  priority: Priority;
  body: string;
  patientId: number;
  practiceId: number;
  userId: number;
  assignedTo: number; // primary provider id
  //assignedToIds: number[]; // CC'd provider ids (can include assignedTo too)
  patientEmergencyContactId: number | null;
  patientCommunicationMediumId: number;
  communicationStatus?: string;
  isPrivate?: boolean;
  providerId: number;
  providerName: string;
  patientName: string;
  messageType: string;
}
export interface SendReplyPayload {
  threadId: string;
  patientCommunicationId: number;
  recipientId: number; // from thread.recipientId (GET response)
  subject: string;
  content: string;
  createdBy: string;
}

export interface UpdateThreadStatusPayload {
  threadId: string;
  patientCommunicationId: number;
  status: MessageStatus;
  patientId: number;
  userId: number;
  assignedTo: number;
  patientCommunicationMediumId: number;
  subject: string;
  priority: string;
  communicationText: string;
  isPrivate: boolean;
  practiceId: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Async Thunks
// ─────────────────────────────────────────────────────────────────────────────

export const fetchThreads = createAsyncThunk<
  { threads: Thread[]; providers: Provider[] },
  FetchThreadsParams
>('messages/fetchThreads', async (data, thunkAPI) => {
  try {
    const params: Record<string, any> = {
      patientId: data.patientId,
      practiceId: data.practiceId,
      status: data?.status
    };
    const res = await apiServicesV2.GetCommunications(params, 'ApiVersion2Req');

    if (res?.status === 200 || res?.status === 201) {
      const apiThreads: ApiThread[] = res.data?.result ?? res.data ?? [];

      const uniqueApiThreads = Array.from(
        new Map(apiThreads.map((t) => [t.id, t])).values()
      );

      const mapped = uniqueApiThreads.map(mapApiThreadToThread);

      const sorted = [...mapped].sort(
        (a, b) =>
          moment(b.lastActivity).valueOf() - moment(a.lastActivity).valueOf()
      );

      return {
        threads: sorted,
        providers: extractProviders(uniqueApiThreads)
      };
    }

    return thunkAPI.rejectWithValue({
      message: 'Unexpected response status',
      status: res?.status
    }) as any;
  } catch (error: any) {
    const message = error?.response?.data?.message ?? 'Failed to load messages';
    SnackbarUtils.error(message, false);
    return thunkAPI.rejectWithValue({
      message,
      status: error?.response?.status
    }) as any;
  }
});

// Get Providers Section//

export const fetchPatientProviders = createAsyncThunk<Provider[], number>(
  'messages/fetchPatientProviders',
  async (practiceId, thunkAPI) => {
    try {
      const res = await apiServicesV2.GetPatientProviders(
        { practiceId },
        'ApiVersion2Req'
      );

      if (res?.status === 200 || res?.status === 201) {
        const result: PatientProvider[] = res.data?.result ?? res.data ?? [];
        // Map API response to Provider shape
        return result.map((p) => ({
          id: String(p.providerId),
          numericId: p.providerId,
          name: p.providerName,
          specialty: p.specialty ?? '',
          avatar: ''
        }));
      }

      return thunkAPI.rejectWithValue({
        message: 'Failed to load providers',
        status: res?.status
      }) as any;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Failed to load providers';
      SnackbarUtils.error(message, false);
      return thunkAPI.rejectWithValue({ message }) as any;
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────

export const sendReply = createAsyncThunk<
  { threadId: string; message: Message },
  SendReplyPayload
>('messages/sendReply', async (payload, thunkAPI) => {
  try {
    const res = await apiServicesV2.AddCommunicationComment(
      {
        id: 0,
        patientCommunicationId: payload.patientCommunicationId,
        recipientId: payload.recipientId,
        subject: payload.subject,
        communicationText: payload.content,
        createdBy: payload.createdBy,
        communicatedOn: new Date().toISOString(),
        isPrivate: false
      },
      'ApiVersion2Req'
    );

    if (res?.status === 200 || res?.status === 201) {
      const saved: CommunicationComment = res.data?.result ?? res.data;
      const optimisticMessage: Message = {
        id: `comment-${saved?.id ?? Date.now()}`,
        senderId: String(payload.recipientId),
        senderName: payload.createdBy,
        senderRole: 'patient',
        content: payload.content,
        timestamp: saved?.createdAt
          ? moment(saved.createdAt).local().format()
          : moment().format()
      };
      return {
        threadId: payload.threadId,
        message: optimisticMessage
      };
    }

    return thunkAPI.rejectWithValue({
      message: 'Unexpected response status',
      status: res?.status
    }) as any;
  } catch (error: any) {
    const message = error?.response?.data?.message ?? 'Failed to send reply';
    SnackbarUtils.error(message, false);
    return thunkAPI.rejectWithValue({
      message,
      status: error?.response?.status
    }) as any;
  }
});

// ─────────────────────────────────────────────────────────────────────────────

export const createThread = createAsyncThunk<Thread, CreateThreadPayload>(
  'messages/createThread',
  async (payload, thunkAPI) => {
    try {
      const res = await apiServicesV2.AddUpdateCommunication(
        {
          id: 0,
          patientId: payload.patientId,
          patientEmergencyContactId: payload.patientEmergencyContactId,
          patientCommunicationMediumId: payload.patientCommunicationMediumId,
          userId: payload.userId,
          assignedTo: payload.assignedTo,
          //assignedToIds: payload.assignedToIds,
          subject: payload.subject,
          priority: payload.priority,
          communicationText: payload.body,
          communicatedOn: new Date().toISOString(),
          communicationStatus: payload.communicationStatus ?? 'open',
          isDeleted: false,
          isPrivate: payload.isPrivate ?? false,
          providerId: payload.providerId,
          practiceId: payload.practiceId
        },
        'ApiVersion2Req'
      );

      if (res?.status === 200 || res?.status === 201) {
        const created: ApiThread = res.data?.result ?? res.data;

        // If API returns a full thread object — map and return it
        if (created?.id) {
          return mapApiThreadToThread(created);
        }

        const newId = typeof created === 'number' ? created : created?.id;

        // Fallback: build local Thread from payload when API only echoes id
        const fallbackThread: Thread = {
          id: String(newId ?? Date.now()),
          patientCommunicationId: newId ?? 0,
          recipientId: payload.providerId,
          subject: payload.subject,
          providerId: String(payload.providerId),
          providerName: payload.providerName,
          providerAvatar: '',
          patientId: String(payload.patientId),
          patientName: payload.patientName,
          patientAvatar: '',
          priority: payload.priority,
          status: 'open',
          messageType: payload.messageType,
          lastMessage: payload.body,
          lastActivity: new Date().toISOString(),
          unreadCount: 0,
          isRead: true,
          isFlagged: payload.priority === 'Urgent',
          initiatorName: payload.patientName || 'Patient', // patient creates from portal
          initiatorRole: 'patient',
          toName: payload.providerName,
          practiceId: payload.practiceId,
          messages: [
            {
              id: `msg-${Date.now()}`,
              senderId: String(payload.userId),
              senderName: payload.patientName,
              senderAvatar: '',
              senderRole: 'patient',
              content: payload.body,
              timestamp: new Date().toISOString()
            }
          ]
        };
        return fallbackThread;
      }

      return thunkAPI.rejectWithValue({
        message: 'Unexpected response status',
        status: res?.status
      }) as any;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Failed to send message';
      SnackbarUtils.error(message, false);
      return thunkAPI.rejectWithValue({
        message,
        status: error?.response?.status
      }) as any;
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────

export const updateThreadStatus = createAsyncThunk<
  { threadId: string; status: MessageStatus },
  UpdateThreadStatusPayload
>('messages/updateThreadStatus', async (payload, thunkAPI) => {
  try {
    const res = await apiServicesV2.AddUpdateCommunication(
      {
        id: payload.patientCommunicationId,
        patientId: payload.patientId,
        patientEmergencyContactId: null,
        patientCommunicationMediumId: payload.patientCommunicationMediumId,
        userId: payload.userId,
        assignedTo: payload.assignedTo,
        //assignedToIds: [payload.assignedTo],
        subject: payload.subject,
        priority: payload.priority,
        communicationText: payload.communicationText,
        communicatedOn: new Date().toISOString(),
        communicationStatus: payload.status === 'open' ? 'open' : 'closed',
        isDeleted: false,
        isPrivate: payload.isPrivate,
        providerId: payload.assignedTo,
        practiceId: payload?.practiceId
      },
      'ApiVersion2Req'
    );

    if (res?.status === 200 || res?.status === 201) {
      return { threadId: payload.threadId, status: payload.status };
    }

    return thunkAPI.rejectWithValue({
      message: 'Unexpected response status',
      status: res?.status
    }) as any;
  } catch (error: any) {
    const message = error?.response?.data?.message ?? 'Failed to update status';
    SnackbarUtils.error(message, false);
    return thunkAPI.rejectWithValue({
      message,
      status: error?.response?.status
    }) as any;
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState: MessagesState = {
  threads: [],
  providers: [],
  providersLoading: false,
  activeThreadId: null,
  sortOption: 'all',
  groupOption: 'open',
  isNewMessageOpen: false,
  loading: false,
  sending: false,
  error: null,
  successMessage: null
};

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const messagesSlice = createSlice({
  name: 'messages',
  initialState,

  // ── Sync reducers ──────────────────────────────────────────────────────────
  reducers: {
    setActiveThread(state, action: PayloadAction<string | null>) {
      state.activeThreadId = action.payload;
      if (action.payload) {
        const thread = state.threads.find((t) => t.id === action.payload);
        if (thread) {
          thread.isRead = true;
          thread.unreadCount = 0;
        }
      }
    },
    setSortOption(state, action: PayloadAction<SortOption>) {
      state.sortOption = action.payload;
    },
    setGroupOption(state, action: PayloadAction<GroupOption>) {
      state.groupOption = action.payload;
    },
    openNewMessage(state) {
      state.isNewMessageOpen = true;
    },
    closeNewMessage(state) {
      state.isNewMessageOpen = false;
    },
    clearSuccess(state) {
      state.successMessage = null;
    },
    clearError(state) {
      state.error = null;
    }
  },

  // ── Async reducers (patientSlice object syntax) ────────────────────────────
  extraReducers: {
    // ── fetchThreads ──────────────────────────────────────────────────────
    [fetchThreads.pending.type]: (state: MessagesState) => {
      state.loading = true;
      state.error = null;
    },
    [fetchThreads.fulfilled.type]: (state: MessagesState, { payload }: any) => {
      state.loading = false;
      if (payload) {
        const sorted = [...payload.threads].sort(
          (a, b) =>
            moment(b.lastActivity ?? 0).valueOf() -
            moment(a.lastActivity ?? 0).valueOf()
        );
        state.threads = sorted;
        if (state.providers.length === 0) {
          state.providers = payload.providers;
        }
      }
    },
    [fetchThreads.rejected.type]: (state: MessagesState) => {
      state.loading = false;
      state.error = 'Failed to load messages.';
    },

    //---------  Get Providers ------
    [fetchPatientProviders.pending.type]: (state: MessagesState) => {
      state.providersLoading = true;
    },
    [fetchPatientProviders.fulfilled.type]: (
      state: MessagesState,
      { payload }: PayloadAction<Provider[]>
    ) => {
      state.providersLoading = false;
      state.providers = payload;
    },
    [fetchPatientProviders.rejected.type]: (state: MessagesState) => {
      state.providersLoading = false;
      // keep existing providers if fetch fails
    },

    // ── sendReply ─────────────────────────────────────────────────────────
    [sendReply.pending.type]: (state: MessagesState) => {
      state.sending = true;
      state.error = null;
    },
    [sendReply.fulfilled.type]: (state: MessagesState, { payload }: any) => {
      state.sending = false;
      if (payload) {
        const idx = state.threads.findIndex((t) => t.id === payload.threadId);
        if (idx !== -1) {
          const thread = state.threads[idx];
          thread.messages.push(payload.message);
          thread.lastMessage = payload.message.content;
          thread.lastActivity = payload.message.timestamp;
          state.threads.splice(idx, 1);
          state.threads.unshift(thread);
        }
        state.successMessage = 'Reply sent successfully.';
      }
    },
    [sendReply.rejected.type]: (state: MessagesState) => {
      state.sending = false;
      state.error = 'Failed to send reply. Please try again.';
    },

    // ── createThread ──────────────────────────────────────────────────────
    [createThread.pending.type]: (state: MessagesState) => {
      state.sending = true;
      state.error = null;
    },
    [createThread.fulfilled.type]: (
      state: MessagesState,
      { payload }: PayloadAction<Thread>
    ) => {
      state.sending = false;
      if (payload) {
        state.threads.unshift(payload);
        state.isNewMessageOpen = false;
        state.activeThreadId = payload.id;
        state.successMessage = 'Message sent successfully.';
      }
    },
    [createThread.rejected.type]: (state: MessagesState) => {
      state.sending = false;
      state.error = 'Failed to create message. Please try again.';
    },

    // ── updateThreadStatus ────────────────────────────────────────────────
    [updateThreadStatus.pending.type]: (state: MessagesState) => {
      state.error = null;
    },
    [updateThreadStatus.fulfilled.type]: (
      state: MessagesState,
      { payload }: PayloadAction<{ threadId: string; status: MessageStatus }>
    ) => {
      if (payload) {
        const thread = state.threads.find((t) => t.id === payload.threadId);
        if (thread) {
          thread.status = payload.status;
        }
      }
    },
    [updateThreadStatus.rejected.type]: (state: MessagesState) => {
      state.error = 'Failed to update message status. Please try again.';
    }
  } as any // object syntax requires this for TS compatibility with RTK
});

export const {
  setActiveThread,
  setSortOption,
  setGroupOption,
  openNewMessage,
  closeNewMessage,
  clearSuccess,
  clearError
} = messagesSlice.actions;

export default messagesSlice.reducer;
