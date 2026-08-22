'use client';

import { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Users, Info, ChevronLeft } from 'lucide-react';
import { GroupInfoModal } from './GroupInfoModal';

export function Header() {
  const { user: currentUser } = useAuth();
  const { activeConversation, selectConversation, onlineUsers, lastSeenMap } = useChat();
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

  if (!activeConversation) return null;

  const isGroup = activeConversation.type === 'group';

  const title = isGroup
    ? activeConversation.name || 'Group Chat'
    : activeConversation.participant?.name || 'Direct Chat';

  const partnerId = activeConversation.participant?._id;
  const partnerPhone = activeConversation.participant?.phone;

  const isPartnerOnline =
    !isGroup &&
    (onlineUsers.some((id) => id === partnerId || id === partnerPhone));

  const formatLastSeen = (isoString?: string) => {
    if (!isoString) return 'Offline';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Offline';
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return `Last seen today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Last seen yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    return `Last seen ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  let subtitle = '';
  if (isGroup) {
    const totalMembers = activeConversation.participants?.length || 0;
    const onlineCount =
      activeConversation.participants?.filter((p) =>
        currentUser && (p._id === currentUser._id || p.phone === currentUser.phone)
          ? true
          : onlineUsers.some((id) => id === p._id || id === p.phone)
      ).length || 0;

    subtitle = `${totalMembers} Members • ${onlineCount} Online`;
  } else {
    if (isPartnerOnline) {
      subtitle = 'Online';
    } else {
      const lastSeenTime = (partnerId && lastSeenMap[partnerId]) || (partnerPhone && lastSeenMap[partnerPhone]) || activeConversation.updatedAt;
      subtitle = formatLastSeen(lastSeenTime);
    }
  }

  return (
    <>
      <header className="h-16 px-3 sm:px-6 bg-[#0F172A]/90 backdrop-blur-md border-b border-[#334155] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Back to Sidebar Button */}
          <button
            onClick={() => selectConversation('')}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer shrink-0"
            title="Back to conversations list"
          >
            <ChevronLeft className="w-5 h-5 text-[#FFB03A]" />
          </button>

          {/* Avatar with Status Dot */}
          <div className="relative shrink-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-md ${
                isGroup
                  ? 'bg-gradient-to-tr from-[#FFB03A] to-[#FF9800] text-[#0F172A]'
                  : 'bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white'
              }`}
            >
              {isGroup ? (
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F172A]" />
              ) : (
                title[0]?.toUpperCase() || '?'
              )}
            </div>

            {!isGroup && (
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0F172A] ${
                  isPartnerOnline
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : 'bg-slate-500/80'
                }`}
              />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5 truncate">
              <span className="truncate">{title}</span>
              {isGroup && (
                <span className="px-2 py-0.5 rounded-full bg-[#FFB03A]/20 text-[#FFB03A] text-[10px] font-bold border border-[#FFB03A]/30 shrink-0">
                  Group
                </span>
              )}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate flex items-center gap-1">
              <span>{subtitle}</span>
            </p>
          </div>
        </div>

        {isGroup && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsGroupInfoOpen(true)}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Info className="w-3.5 h-3.5 text-[#FFB03A]" />
              <span className="hidden sm:inline">Group Info</span>
            </button>
          </div>
        )}
      </header>

      {isGroup && (
        <GroupInfoModal
          conversation={activeConversation}
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
        />
      )}
    </>
  );
}
