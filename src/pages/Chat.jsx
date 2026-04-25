


import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MessageCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { useApp } from '../context/AppContext';

const BASE_URL = 'http://localhost:5000/v1';
const socket   = io('http://localhost:5000');

const makeRoomId = (idA, idB) => [idA, idB].sort().join('_');
const getToken   = ()         => localStorage.getItem('pg_token');
const getAvatar  = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

// ── load / save lastMsgTimes from localStorage so order persists on refresh ──
const loadTimes = () => {
  try { return JSON.parse(localStorage.getItem('pg_chat_times') || '{}'); }
  catch { return {}; }
};
const saveTimes = (times) =>
  localStorage.setItem('pg_chat_times', JSON.stringify(times));

// ── load / save last message preview per person ──────────────────────────────
const loadPreviews = () => {
  try { return JSON.parse(localStorage.getItem('pg_chat_previews') || '{}'); }
  catch { return {}; }
};
const savePreviews = (previews) =>
  localStorage.setItem('pg_chat_previews', JSON.stringify(previews));

export default function Chat() {
  const { user } = useApp();
  const myId = user?.id || user?._id;

  const [users,        setUsers]        = useState([]);
  const [search,       setSearch]       = useState('');
  const [activeUser,   setActiveUser]   = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  // tracks last message time per person — drives sidebar sort order
  const [lastMsgTimes,    setLastMsgTimes]    = useState(loadTimes);
  // tracks last message text preview per person
  const [lastMsgPreviews, setLastMsgPreviews] = useState(loadPreviews);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // ── persist times + previews to localStorage whenever they change ───────────
  useEffect(() => { saveTimes(lastMsgTimes);       }, [lastMsgTimes]);
  useEffect(() => { savePreviews(lastMsgPreviews); }, [lastMsgPreviews]);

  // ── fetch all chat-able users on mount ──────────────────────────────────────
  useEffect(() => {
    if (!myId) return;
    fetch(`${BASE_URL}/auth/chat-users`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => {
        const others = Array.isArray(data)
          ? data.filter(o => o._id !== myId && o.id !== myId)
          : [];
        setUsers(others);
        // auto-select the person messaged most recently (if any)
        if (others.length > 0) {
          const times = loadTimes();
          const sorted = [...others].sort(
            (a, b) => (times[b._id] || 0) - (times[a._id] || 0)
          );
          setActiveUser(sorted[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, [myId]);

  // ── join socket room when active user changes ───────────────────────────────
  useEffect(() => {
    if (!activeUser || !myId) return;

    const roomId = makeRoomId(myId, activeUser._id);

    socket.off('room_history');
    socket.off('receive_message');
    setMessages([]);

    socket.emit('join_room', roomId);

    socket.on('room_history', (history) => {
      setMessages(history);
    });

    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);

      // bump this person to the top + update preview
      setLastMsgTimes(prev => ({ ...prev, [activeUser._id]: Date.now() }));
      setLastMsgPreviews(prev => ({ ...prev, [activeUser._id]: message.text }));
    });

    setTimeout(() => inputRef.current?.focus(), 100);

    return () => {
      socket.off('room_history');
      socket.off('receive_message');
    };
  }, [activeUser?._id, myId]);

  // ── auto scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── send message ────────────────────────────────────────────────────────────
  const sendMessage = () => {
    const text = input.trim();
    if (!text || !activeUser) return;

    const roomId  = makeRoomId(myId, activeUser._id);
    const message = {
      id:       Date.now(),
      sender:   user?.name || 'Me',
      senderId: myId,
      text,
      time:     new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit('send_message', { roomId, message });
    setInput('');
    inputRef.current?.focus();

    // bump sender to top + update preview
    setLastMsgTimes(prev    => ({ ...prev,    [activeUser._id]: Date.now() }));
    setLastMsgPreviews(prev => ({ ...prev,    [activeUser._id]: text       }));
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const isMe = (msg) => msg.senderId === myId;

  // ── filter by search then sort: messaged first, then alphabetical ───────────
  const filteredUsers = users
    .filter(o =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const tA = lastMsgTimes[a._id] || 0;
      const tB = lastMsgTimes[b._id] || 0;
      if (tB !== tA) return tB - tA;          // most recent first
      return a.name.localeCompare(b.name);    // then alphabetical
    });

  // ── format sidebar timestamp ────────────────────────────────────────────────
  const formatSidebarTime = (ts) => {
    if (!ts) return '';
    const d    = new Date(ts);
    const now  = new Date();
    const diff = now - d;
    if (diff < 60_000)                return 'just now';
    if (diff < 3_600_000)             return `${Math.floor(diff / 60_000)}m`;
    if (d.toDateString() === now.toDateString())
                                      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
  };

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-display font-bold text-white mb-6">Messages</h1>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden" style={{ height: '620px' }}>
        <div className="flex h-full">

          {/* ── sidebar ──────────────────────────────────────────────────────── */}
          <div className="w-72 border-r border-white/5 flex flex-col shrink-0">

            {/* search */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  placeholder="Search people..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* user list */}
            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 px-4 text-center">
                  <MessageCircle size={24} className="text-slate-600 mb-2" />
                  <p className="text-slate-500 text-xs">
                    {search ? 'No people found' : 'No users yet'}
                  </p>
                </div>
              ) : (
                filteredUsers.map(person => {
                  const hasMsg    = !!lastMsgTimes[person._id];
                  const preview   = lastMsgPreviews[person._id];
                  const timeLabel = formatSidebarTime(lastMsgTimes[person._id]);
                  const isActive  = activeUser?._id === person._id;

                  return (
                    <button
                      key={person._id}
                      onClick={() => setActiveUser(person)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/5 transition-colors border-b border-white/3 ${
                        isActive ? 'bg-brand-500/10 border-r-2 border-brand-500' : ''
                      }`}
                    >
                      {/* avatar with unread indicator dot if messaged */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400">
                          {getAvatar(person.name)}
                        </div>
                        {hasMsg && !isActive && (
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-brand-500 rounded-full border-2 border-slate-900" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* name + time */}
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-sm truncate ${hasMsg ? 'font-semibold text-white' : 'font-medium text-slate-300'}`}>
                            {person.name}
                          </p>
                          {timeLabel && (
                            <span className="text-xs text-slate-500 shrink-0">{timeLabel}</span>
                          )}
                        </div>
                        {/* preview or email */}
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-xs text-slate-500 truncate">
                            {preview || person.email}
                          </p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                            person.role === 'owner'
                              ? 'bg-brand-500/20 text-brand-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {person.role}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* ── chat area ────────────────────────────────────────────────────── */}
          {activeUser ? (
            <div className="flex-1 flex flex-col min-w-0">

              {/* header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 shrink-0">
                <div className="w-9 h-9 rounded-full bg-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400">
                  {getAvatar(activeUser.name)}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{activeUser.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{activeUser.role} · {activeUser.email}</p>
                </div>
              </div>

              {/* messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="w-14 h-14 rounded-full bg-brand-500/10 flex items-center justify-center">
                      <MessageCircle size={24} className="text-brand-400" />
                    </div>
                    <p className="text-slate-400 text-sm text-center">
                      Start a conversation with{' '}
                      <span className="text-white font-medium">{activeUser.name}</span>
                    </p>
                    <p className="text-slate-600 text-xs">
                      Ask about room availability, pricing, or visit schedule
                    </p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex ${isMe(msg) ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-sm flex flex-col gap-1 ${isMe(msg) ? 'items-end' : 'items-start'}`}>
                        {!isMe(msg) && (
                          <p className="text-xs text-slate-500 px-1">{msg.sender}</p>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                          isMe(msg)
                            ? 'bg-brand-500 text-white rounded-br-sm'
                            : 'bg-white/10 text-slate-200 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>
                        <p className="text-xs text-slate-600">{msg.time}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* input */}
              <div className="p-4 border-t border-white/5 shrink-0">
                <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus-within:border-brand-500/40 transition-colors">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={`Message ${activeUser.name}…`}
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center hover:bg-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send size={14} className="text-white" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center">
                <MessageCircle size={28} className="text-brand-400" />
              </div>
              <p className="text-slate-400 text-sm">Select someone to start chatting</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
