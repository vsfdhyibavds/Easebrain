/**
 * Mock Data for Caregiver Dashboard - Dependent & Chat Testing
 * 
 * This file provides sample data structures for testing the ChatSpace.jsx
 * and CaregiverChatModal.jsx components.
 */

// ============================================
// MOCK DEPENDENT DATA (for Caregiver Dashboard)
// ============================================

export const mockDependents = [
  {
    id: 1,
    name: "Sarah Johnson",
    status: "Excellent",
    mood: "Happy",
    lastCheck: "2 hours ago",
    relationship: "Daughter",
    age: 28,
    avatar: null,
    phone: "+1234567890",
    email: "sarah.johnson@email.com",
    medical_notes: "Managing well with current medication",
    last_mood_check: "2024-01-08T10:00:00Z",
    medications: [
      { name: "Sertraline", dosage: "50mg", frequency: "Daily" },
      { name: "Vitamin D", dosage: "1000IU", frequency: "Daily" }
    ],
    upcoming_appointments: [
      { date: "2024-01-15", time: "10:00 AM", type: "Therapy Session" }
    ],
    emergency_contact: {
      name: "John Johnson",
      phone: "+1987654321",
      relationship: "Husband"
    }
  },
  {
    id: 2,
    name: "Michael Chen",
    status: "Stable",
    mood: "Neutral",
    lastCheck: "4 hours ago",
    relationship: "Son",
    age: 35,
    avatar: null,
    phone: "+1234567891",
    email: "michael.chen@email.com",
    medical_notes: "Stable condition, regular check-ins recommended",
    last_mood_check: "2024-01-08T08:00:00Z",
    medications: [
      { name: "Lithium", dosage: "300mg", frequency: "Twice daily" }
    ],
    upcoming_appointments: [
      { date: "2024-01-10", time: "2:00 PM", type: "Psychiatrist" }
    ],
    emergency_contact: {
      name: "Lisa Chen",
      phone: "+1987654322",
      relationship: "Wife"
    }
  },
  {
    id: 3,
    name: "Emma Williams",
    status: "Needs Attention",
    mood: "Anxious",
    lastCheck: "30 mins ago",
    relationship: "Granddaughter",
    age: 22,
    avatar: null,
    phone: "+1234567892",
    email: "emma.williams@email.com",
    medical_notes: "Recent anxiety spikes, increased monitoring needed",
    last_mood_check: "2024-01-08T12:30:00Z",
    medications: [
      { name: "Escitalopram", dosage: "10mg", frequency: "Daily" },
      { name: "Lorazepam", dosage: "0.5mg", frequency: "As needed" }
    ],
    upcoming_appointments: [
      { date: "2024-01-09", time: "11:00 AM", type: "Crisis Follow-up" }
    ],
    emergency_contact: {
      name: "Robert Williams",
      phone: "+1987654323",
      relationship: "Father"
    }
  }
];

// ============================================
// MOCK CONVERSATION DATA (for Chat)
// ============================================

export const mockConversations = [
  {
    id: "conv-1",
    dependent_id: 1,
    dependent_name: "Sarah Johnson",
    last_message: "Thank you for checking in, Mom!",
    last_message_time: "2024-01-08T11:30:00Z",
    unread_count: 2,
    status: "active"
  },
  {
    id: "conv-2",
    dependent_id: 2,
    dependent_name: "Michael Chen",
    last_message: "Appointment confirmed for Friday",
    last_message_time: "2024-01-08T09:15:00Z",
    unread_count: 0,
    status: "active"
  },
  {
    id: "conv-3",
    dependent_id: 3,
    dependent_name: "Emma Williams",
    last_message: "Feeling a bit overwhelmed today",
    last_message_time: "2024-01-08T12:45:00Z",
    unread_count: 5,
    status: "urgent"
  }
];

// ============================================
// MOCK MESSAGES (for ChatSpace & ChatModal)
// ============================================

export const mockMessages = {
  "conv-1": [
    {
      id: 1,
      conversation_id: "conv-1",
      sender_id: 1,
      sender_name: "Sarah Johnson",
      sender_role: "dependent",
      content: "Good morning! How are you today?",
      created_at: "2024-01-08T08:00:00Z",
      is_from_caregiver: false,
      read: true
    },
    {
      id: 2,
      conversation_id: "conv-1",
      sender_id: 100,
      sender_name: "Caregiver Mom",
      sender_role: "caregiver",
      content: "Good morning, Sarah! I'm doing well. How did you sleep?",
      created_at: "2024-01-08T08:05:00Z",
      is_from_caregiver: true,
      read: true
    },
    {
      id: 3,
      conversation_id: "conv-1",
      sender_id: 1,
      sender_name: "Sarah Johnson",
      sender_role: "dependent",
      content: "Pretty well! Took my medication on time and felt rested.",
      created_at: "2024-01-08T08:10:00Z",
      is_from_caregiver: false,
      read: true
    },
    {
      id: 4,
      conversation_id: "conv-1",
      sender_id: 100,
      sender_name: "Caregiver Mom",
      sender_role: "caregiver",
      content: "That's wonderful to hear! Remember, therapy session is tomorrow at 10 AM.",
      created_at: "2024-01-08T08:15:00Z",
      is_from_caregiver: true,
      read: true
    },
    {
      id: 5,
      conversation_id: "conv-1",
      sender_id: 1,
      sender_name: "Sarah Johnson",
      sender_role: "dependent",
      content: "Thank you for reminding me! I'm looking forward to it.",
      created_at: "2024-01-08T08:20:00Z",
      is_from_caregiver: false,
      read: true
    },
    {
      id: 6,
      conversation_id: "conv-1",
      sender_id: 100,
      sender_name: "Caregiver Mom",
      sender_role: "caregiver",
      content: "You're welcome! Let me know if you need any help preparing.",
      created_at: "2024-01-08T08:25:00Z",
      is_from_caregiver: true,
      read: true
    },
    {
      id: 7,
      conversation_id: "conv-1",
      sender_id: 1,
      sender_name: "Sarah Johnson",
      sender_role: "dependent",
      content: "Will do! Thanks for always being there for me 💕",
      created_at: "2024-01-08T11:30:00Z",
      is_from_caregiver: false,
      read: false
    }
  ],
  "conv-2": [
    {
      id: 8,
      conversation_id: "conv-2",
      sender_id: 2,
      sender_name: "Michael Chen",
      sender_role: "dependent",
      content: "Hi, I wanted to update you about my appointment",
      created_at: "2024-01-08T09:00:00Z",
      is_from_caregiver: false,
      read: true
    },
    {
      id: 9,
      conversation_id: "conv-2",
      sender_id: 100,
      sender_name: "Caregiver Mom",
      sender_role: "caregiver",
      content: "Of course! How did it go?",
      created_at: "2024-01-08T09:05:00Z",
      is_from_caregiver: true,
      read: true
    },
    {
      id: 10,
      conversation_id: "conv-2",
      sender_id: 2,
      sender_name: "Michael Chen",
      sender_role: "dependent",
      content: "Appointment confirmed for Friday with the psychiatrist",
      created_at: "2024-01-08T09:10:00Z",
      is_from_caregiver: false,
      read: true
    },
    {
      id: 11,
      conversation_id: "conv-2",
      sender_id: 100,
      sender_name: "Caregiver Mom",
      sender_role: "caregiver",
      content: "Great! Let me know if you need a ride or anything else.",
      created_at: "2024-01-08T09:15:00Z",
      is_from_caregiver: true,
      read: true
    }
  ],
  "conv-3": [
    {
      id: 12,
      conversation_id: "conv-3",
      sender_id: 3,
      sender_name: "Emma Williams",
      sender_role: "dependent",
      content: "Hey, are you available to talk?",
      created_at: "2024-01-08T12:00:00Z",
      is_from_caregiver: false,
      read: true
    },
    {
      id: 13,
      conversation_id: "conv-3",
      sender_id: 100,
      sender_name: "Caregiver Mom",
      sender_role: "caregiver",
      content: "Yes, I'm here for you. What's going on?",
      created_at: "2024-01-08T12:05:00Z",
      is_from_caregiver: true,
      read: true
    },
    {
      id: 14,
      conversation_id: "conv-3",
      sender_id: 3,
      sender_name: "Emma Williams",
      sender_role: "dependent",
      content: "Feeling a bit overwhelmed today with work and everything",
      created_at: "2024-01-08T12:10:00Z",
      is_from_caregiver: false,
      read: true
    },
    {
      id: 15,
      conversation_id: "conv-3",
      sender_id: 3,
      sender_name: "Emma Williams",
      sender_role: "dependent",
      content: "The anxiety is getting to me",
      created_at: "2024-01-08T12:15:00Z",
      is_from_caregiver: false,
      read: false
    },
    {
      id: 16,
      conversation_id: "conv-3",
      sender_id: 100,
      sender_name: "Caregiver Mom",
      sender_role: "caregiver",
      content: "I'm sorry you're feeling this way. Have you taken your as-needed medication?",
      created_at: "2024-01-08T12:20:00Z",
      is_from_caregiver: true,
      read: false
    },
    {
      id: 17,
      conversation_id: "conv-3",
      sender_id: 3,
      sender_name: "Emma Williams",
      sender_role: "dependent",
      content: "Not yet, I didn't want to take it too early",
      created_at: "2024-01-08T12:25:00Z",
      is_from_caregiver: false,
      read: false
    },
    {
      id: 18,
      conversation_id: "conv-3",
      sender_id: 3,
      sender_name: "Emma Williams",
      sender_role: "dependent",
      content: "Maybe I should talk to someone now",
      created_at: "2024-01-08T12:30:00Z",
      is_from_caregiver: false,
      read: false
    },
    {
      id: 19,
      conversation_id: "conv-3",
      sender_id: 100,
      sender_name: "Caregiver Mom",
      sender_role: "caregiver",
      content: "Your crisis follow-up is tomorrow. Should I call and see if they can see you today instead?",
      created_at: "2024-01-08T12:35:00Z",
      is_from_caregiver: true,
      read: false
    },
    {
      id: 20,
      conversation_id: "conv-3",
      sender_id: 3,
      sender_name: "Emma Williams",
      sender_role: "dependent",
      content: "Yes please, that would help",
      created_at: "2024-01-08T12:40:00Z",
      is_from_caregiver: false,
      read: false
    },
    {
      id: 21,
      conversation_id: "conv-3",
      sender_id: 3,
      sender_name: "Emma Williams",
      sender_role: "dependent",
      content: "Feeling a bit overwhelmed today",
      created_at: "2024-01-08T12:45:00Z",
      is_from_caregiver: false,
      read: false
    }
  ]
};

// ============================================
// MOCK CURRENT USER (Caregiver Context)
// ============================================

export const mockCurrentUser = {
  id: 100,
  name: "Caregiver Mom",
  first_name: "Caregiver",
  last_name: "Mom",
  email: "caregiver@easebrain.com",
  role: "caregiver",
  avatar: null
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a specific dependent by ID
 */
export const getDependentById = (id) => {
  return mockDependents.find(d => d.id === id);
};

/**
 * Get conversation by ID
 */
export const getConversationById = (id) => {
  return mockConversations.find(c => c.id === id);
};

/**
 * Get messages for a conversation
 */
export const getMessagesForConversation = (conversationId) => {
  return mockMessages[conversationId] || [];
};

/**
 * Get unread message count for a conversation
 */
export const getUnreadCount = (conversationId) => {
  const messages = mockMessages[conversationId] || [];
  return messages.filter(m => !m.read && !m.is_from_caregiver).length;
};

/**
 * Simulate sending a message
 */
export const simulateSendMessage = (conversationId, content, senderId, senderName, senderRole) => {
  const newMessage = {
    id: Date.now(),
    conversation_id: conversationId,
    sender_id: senderId,
    sender_name: senderName,
    sender_role: senderRole,
    content,
    created_at: new Date().toISOString(),
    is_from_caregiver: senderRole === "caregiver",
    read: false
  };
  
  if (mockMessages[conversationId]) {
    mockMessages[conversationId].push(newMessage);
  } else {
    mockMessages[conversationId] = [newMessage];
  }
  
  return newMessage;
};

/**
 * Simulate receiving a message
 */
export const simulateReceiveMessage = (conversationId, content, senderId, senderName) => {
  const newMessage = {
    id: Date.now(),
    conversation_id: conversationId,
    sender_id: senderId,
    sender_name: senderName,
    sender_role: "dependent",
    content,
    created_at: new Date().toISOString(),
    is_from_caregiver: false,
    read: false
  };
  
  if (mockMessages[conversationId]) {
    mockMessages[conversationId].push(newMessage);
  } else {
    mockMessages[conversationId] = [newMessage];
  }
  
  return newMessage;
};

/**
 * Mark all messages as read in a conversation
 */
export const markMessagesAsRead = (conversationId) => {
  if (mockMessages[conversationId]) {
    mockMessages[conversationId] = mockMessages[conversationId].map(m => ({
      ...m,
      read: true
    }));
  }
};

export default {
  mockDependents,
  mockConversations,
  mockMessages,
  mockCurrentUser,
  getDependentById,
  getConversationById,
  getMessagesForConversation,
  getUnreadCount,
  simulateSendMessage,
  simulateReceiveMessage,
  markMessagesAsRead
};
