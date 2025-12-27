// Simple in-memory database for Vercel deployment
export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Message {
  id: number;
  user_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// In-memory storage (will reset on each deployment)
let users: User[] = [];
let messages: Message[] = [];
let userIdCounter = 1;
let messageIdCounter = 1;

export function getOrCreateUser(username: string): User {
  const existing = users.find(u => u.username === username);
  if (existing) return existing;

  const newUser: User = {
    id: userIdCounter++,
    username,
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
}

export function saveMessage(userId: number, role: 'user' | 'assistant', content: string): Message {
  const newMessage: Message = {
    id: messageIdCounter++,
    user_id: userId,
    role,
    content,
    created_at: new Date().toISOString(),
  };
  messages.push(newMessage);
  return newMessage;
}

export function getChatHistory(userId: number, limit: number = 50): Message[] {
  return messages
    .filter(m => m.user_id === userId)
    .slice(-limit);
}

export function getAllUsers(): User[] {
  return [...users].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
