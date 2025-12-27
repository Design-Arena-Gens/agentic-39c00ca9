'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface User {
  id: number;
  username: string;
  created_at: string;
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isLoggedIn) {
      loadHistory();
      loadUsers();
    }
  }, [isLoggedIn]);

  const loadHistory = async () => {
    try {
      const response = await fetch(`/api/history?username=${username}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setMessages([]);
    setSelectedUser(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message optimistically
    const tempUserMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message: userMessage }),
      });

      const data = await response.json();

      if (data.response) {
        const assistantMsg: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.response,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      }

      // Reload users list (in case this is a new user)
      loadUsers();
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = async (clickedUsername: string) => {
    setSelectedUser(clickedUsername);
    try {
      const response = await fetch(`/api/history?username=${clickedUsername}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load user history:', error);
    }
  };

  const handleBackToMyChat = () => {
    setSelectedUser(null);
    loadHistory();
  };

  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="header">
          <h1>🤖 Multi-User AI Chat</h1>
          <p>Intelligent conversations with persistent history</p>
        </div>
        <div className="main-content" style={{ display: 'block' }}>
          <div className="chat-section">
            <div className="login-screen">
              <h2>Welcome! Please enter your username</h2>
              <form className="login-form" onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="Enter your username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
                <button type="submit">Start Chatting</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 Multi-User AI Chat</h1>
        <p>Logged in as: {username}</p>
      </div>
      <div className="main-content">
        <aside className="sidebar">
          <h2>👥 All Users</h2>
          <ul className="user-list">
            {users.map((user) => (
              <li
                key={user.id}
                className={`user-item ${selectedUser === user.username ? 'active' : ''}`}
                onClick={() => handleUserClick(user.username)}
              >
                {user.username}
                {user.username === username && ' (You)'}
              </li>
            ))}
          </ul>
        </aside>

        <section className="chat-section">
          <div className="chat-header">
            <h2>
              {selectedUser && selectedUser !== username
                ? `Viewing ${selectedUser}'s Chat`
                : 'Your Chat'}
            </h2>
            <div>
              {selectedUser && selectedUser !== username && (
                <button className="view-history-btn" onClick={handleBackToMyChat}>
                  Back to My Chat
                </button>
              )}
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          <div className="messages-container">
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                <p>No messages yet. Start a conversation!</p>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {(!selectedUser || selectedUser === username) && (
            <div className="input-area">
              <form className="input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !inputMessage.trim()}>
                  Send
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
