import { baseApi } from "./baseApi";

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get conversations for caregiver (with dependents)
    getCaregiverConversations: builder.query({
      query: () => "/messages/caregiver/conversations",
      providesTags: ["Message"],
    }),

    // Get messages for a specific conversation
    getConversationMessages: builder.query({
      query: (conversationId) => `/messages/conversation/${conversationId}`,
      providesTags: (result, error, conversationId) => [
        { type: "Message", id: conversationId },
      ],
    }),

    // Send a message
    sendMessage: builder.mutation({
      query: ({ conversationId, content, recipientId }) => ({
        url: "/messages/send",
        method: "POST",
        body: { conversation_id: conversationId, content, recipient_id: recipientId },
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "Message", id: conversationId },
        "Message",
      ],
    }),

    // Start a new conversation with a dependent
    startConversation: builder.mutation({
      query: (dependentId) => ({
        url: "/messages/conversation/start",
        method: "POST",
        body: { dependent_id: dependentId },
      }),
      invalidatesTags: ["Message"],
    }),

    // Get unread message count for caregiver
    getUnreadCount: builder.query({
      query: () => "/messages/caregiver/unread-count",
      providesTags: ["Message"],
    }),
  }),
});

export const {
  useGetCaregiverConversationsQuery,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useStartConversationMutation,
  useGetUnreadCountQuery,
} = messagesApi;