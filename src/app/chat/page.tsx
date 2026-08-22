'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Sidebar } from '@/components/chat/Sidebar';
import { Header } from '@/components/chat/Header';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { MessageSquare, Sparkles, Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { user, isLoading } = useAuth();
  const { activeConversation } = useChat();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0B1120] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#38BDF8] mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="h-screen w-full bg-[#0B1120] flex overflow-hidden font-sans">
      {/* Sidebar Navigation — Full width on small devices when no active conversation, hidden on small devices when chat is active */}
      <div
        className={`w-full md:w-80 lg:w-96 h-full shrink-0 ${
          activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Chat Panel — Full width on small devices when chat is active, hidden on small devices when no chat selected */}
      <main
        className={`flex-1 flex-col h-full bg-[#0B1120] relative overflow-hidden ${
          activeConversation ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConversation ? (
          <>
            <Header />
            <MessageList />
            <MessageInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 md:p-8 text-center text-slate-400 select-none">
            <div className="max-w-md space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#FFB03A]/15 border border-[#FFB03A]/30 flex items-center justify-center mx-auto shadow-2xl shadow-[#FFB03A]/10">
                <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFB03A]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Welcome to Nexus Chat</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Select a conversation from the sidebar or click <strong className="text-[#FFB03A]">New Chat</strong> / <strong className="text-[#38BDF8]">New Group</strong> to connect with friends and teammates.
              </p>
              <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Real-time WebSocket Socket.io enabled</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
