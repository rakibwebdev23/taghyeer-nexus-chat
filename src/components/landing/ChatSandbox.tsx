'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';

export function ChatSandbox() {
  const [sandboxMessages, setSandboxMessages] = useState([
    { id: '1', sender: 'NexusBot 🤖', text: 'Welcome to Nexus Chat! Type a message below to test real-time WebSocket simulation live.', isOwn: false, time: '09:41 AM' },
    { id: '2', sender: 'Alex (Team Lead)', text: 'Redux Toolkit + Redis response caching makes this feel insanely fast! 🚀', isOwn: false, time: '09:42 AM' },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [simulatedLatencies, setSimulatedLatencies] = useState<number | null>(14);

  const handleSendSandbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const startTime = performance.now();
    const userText = inputMsg.trim();

    const newMsg = {
      id: Date.now().toString(),
      sender: 'You',
      text: userText,
      isOwn: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSandboxMessages((prev) => [...prev, newMsg]);
    setInputMsg('');

    setTimeout(() => {
      const endTime = performance.now();
      setSimulatedLatencies(Math.round(endTime - startTime + 8));

      const botReplies = [
        `Received "${userText}"! Broadcasted over Socket.io room in sub-15ms.`,
        `Redis cache hit! Response delivered with zero state desync.`,
        `Redux Toolkit optimistic state updated! Status set to 'sent'.`,
      ];
      const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];

      setSandboxMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'Nexus System (WS)',
          text: randomReply,
          isOwn: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 500);
  };

  return (
    <div className="bg-[#1E293B]/95 border-2 border-[#38BDF8]/40 hover:border-[#FFB03A]/60 rounded-3xl p-5 shadow-[0_0_50px_rgba(56,189,248,0.15)] backdrop-blur-2xl transition-all duration-500 relative group">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFB03A] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FFB03A]" />
          </span>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>Live Interactive Sandbox</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFB03A]/20 text-[#FFB03A] font-bold">
                Try It Live!
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Type a message below to trigger real-time socket updates</p>
          </div>
        </div>
        {simulatedLatencies && (
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 font-bold shadow-sm">
            ⚡ {simulatedLatencies}ms Latency
          </span>
        )}
      </div>

      {/* Sandbox Messages Area */}
      <div className="h-64 overflow-y-auto space-y-3 p-3.5 bg-[#0B1120] rounded-2xl border border-[#334155] custom-scrollbar mb-4">
        {sandboxMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'} animate-fade-in`}
          >
            <span className="text-[10px] font-bold text-[#FFB03A] mb-1 pl-1">
              {msg.sender}
            </span>
            <div
              className={`px-4 py-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                msg.isOwn
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#38BDF8] text-white rounded-br-none font-medium shadow-md'
                  : 'bg-[#1E293B] border border-[#334155] text-slate-100 rounded-bl-none shadow-sm'
              }`}
            >
              <p>{msg.text}</p>
              <span className="text-[9px] text-slate-400 block text-right mt-1 font-mono">
                {msg.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendSandbox} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message & press Enter..."
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl bg-[#0F172A] border border-[#334155] text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] font-medium"
        />
        <button
          type="submit"
          className="p-3 rounded-xl bg-[#FFB03A] hover:bg-[#FF9800] text-[#0F172A] font-extrabold transition-all cursor-pointer shadow-lg hover:scale-105"
        >
          <Send className="w-4 h-4 text-[#0F172A]" />
        </button>
      </form>
    </div>
  );
}
