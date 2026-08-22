'use client';

import { useState } from 'react';

export function ArchitectureExplorer() {
  const [activeTab, setActiveTab] = useState<'redux' | 'redis' | 'ws' | 'rest'>('redux');

  return (
    <section id="architecture" className="py-24 px-6 bg-[#0F172A] border-t border-[#334155]">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3 reveal-hidden">
          <span className="px-4 py-1.5 rounded-full bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-bold">
            Developer Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100">Under The Hood</h2>
          <p className="text-sm text-slate-300">
            Inspect how state, APIs, and WebSockets interact inside Nexus Chat.
          </p>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-7 shadow-2xl reveal-hidden">
          <div className="flex items-center gap-2 mb-6 border-b border-[#334155] pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('redux')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                activeTab === 'redux'
                  ? 'bg-[#FFB03A] text-[#0F172A] shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Redux Toolkit Slice
            </button>
            <button
              onClick={() => setActiveTab('redis')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                activeTab === 'redis'
                  ? 'bg-[#FFB03A] text-[#0F172A] shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Redis Cache Engine
            </button>
            <button
              onClick={() => setActiveTab('ws')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                activeTab === 'ws'
                  ? 'bg-[#FFB03A] text-[#0F172A] shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WebSocket Event
            </button>
            <button
              onClick={() => setActiveTab('rest')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                activeTab === 'rest'
                  ? 'bg-[#FFB03A] text-[#0F172A] shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              REST Endpoint
            </button>
          </div>

          <pre className="p-5 rounded-2xl bg-[#0B1120] border border-[#334155] text-xs font-mono text-[#38BDF8] overflow-x-auto custom-scrollbar leading-relaxed">
            {activeTab === 'redux' && `// Redux Toolkit — chatSlice.ts Optimistic Thunk
export const sendMessageThunk = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, text }, { dispatch }) => {
    // 1. Dispatch optimistic message to state with temp ID & 'sending' status
    dispatch(addOptimisticMessage({ tempId, conversationId, text }));

    // 2. Perform REST API POST request
    const realMsg = await api.sendMessage(conversationId, text);

    // 3. Replace tempId with real MongoDB _id and status 'sent'
    dispatch(replaceOptimisticMessage({ tempId, realMessage: realMsg }));
  }
);`}
            {activeTab === 'redis' && `// Redis Cache Strategy — lib/cache.ts
export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const freshData = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(freshData));
  return freshData;
}`}
            {activeTab === 'ws' && `// WebSocket Listener — lib/socket.ts
socket.on('message:new', (incomingMessage) => {
  // Deduplicate against active optimistic messages in Redux state
  dispatch(addIncomingSocketMessage(incomingMessage));
});`}
            {activeTab === 'rest' && `// REST API Payload
POST https://frontend-task-chatapp.onrender.com/api/messages
Header: Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "6a890fc3e5d6aac975262fa3",
  "text": "rakib removed another person [u:6a8907...|u:6a890b...]"
}`}
          </pre>
        </div>
      </div>
    </section>
  );
}
