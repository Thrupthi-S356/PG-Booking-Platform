import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, Search } from 'lucide-react';
import { mockMessages } from '../data/mockData';

const conversations = [
  { id: 1, name: 'Sunrise Residency Owner', lastMsg: 'Sunday works! Come around 11 AM.', time: '10:12 AM', unread: 0, avatar: 'SR', online: true },
  { id: 2, name: 'Green Valley PG', lastMsg: 'The room is available, yes!', time: 'Yesterday', unread: 2, avatar: 'GV', online: false },
  { id: 3, name: 'Urban Nest', lastMsg: 'Please send your documents.', time: 'Mon', unread: 0, avatar: 'UN', online: true },
];

export default function Chat() {
  const [activeConv, setActiveConv] = useState(conversations[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const msg = { id: messages.length + 1, sender: 'me', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(m => [...m, msg]);
    setInput('');
    // Simulate reply
    setTimeout(() => {
      setMessages(m => [...m, { id: m.length + 1, sender: 'them', text: 'Thanks for the message! I\'ll get back to you shortly.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1500);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-display font-bold text-white mb-6">Messages</h1>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-72 border-r border-white/5 flex flex-col hidden sm:flex">
            {/* Search */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5">
                <Search size={14} className="text-slate-400" />
                <input placeholder="Search conversations..." className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none" />
              </div>
            </div>
            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/5 transition-colors ${activeConv.id === conv.id ? 'bg-brand-500/10 border-r-2 border-brand-500' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400">{conv.avatar}</div>
                    {conv.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white truncate">{conv.name}</p>
                      <p className="text-xs text-slate-500 shrink-0">{conv.time}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 truncate">{conv.lastMsg}</p>
                      {conv.unread > 0 && <span className="w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center shrink-0">{conv.unread}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400">{activeConv.avatar}</div>
                  {activeConv.online && <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-slate-900" />}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{activeConv.name}</p>
                  <p className="text-xs text-slate-500">{activeConv.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><Phone size={16} /></button>
                <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><Video size={16} /></button>
                <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><MoreVertical size={16} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-sm ${msg.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'me'
                        ? 'bg-brand-500 text-white rounded-br-sm'
                        : 'bg-white/10 text-slate-200 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <p className="text-xs text-slate-600">{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus-within:border-brand-500/40 transition-colors">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type a message…"
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
        </div>
      </div>
    </div>
  );
}
