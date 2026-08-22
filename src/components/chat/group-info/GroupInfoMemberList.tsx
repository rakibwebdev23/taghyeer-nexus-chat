import React from 'react';
import { User, Conversation } from '@/types/chat';
import { Shield, UserMinus, Loader2, MessageSquare } from 'lucide-react';

interface GroupInfoMemberListProps {
  participants: User[];
  conversation: Conversation;
  currentUser: User | null;
  isUserOnline: (user: User) => boolean;
  isAdmin: boolean | null;
  actionLoading: string | null;
  handleOpenDirectChat: (id: string) => void;
  handlePromote: (id: string) => void;
  handleRemove: (id: string) => void;
}

export function GroupInfoMemberList({
  participants,
  conversation,
  currentUser,
  isUserOnline,
  isAdmin,
  actionLoading,
  handleOpenDirectChat,
  handlePromote,
  handleRemove,
}: GroupInfoMemberListProps) {
  return (
    <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1 custom-scrollbar">
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
        Group Members ({participants.length})
      </h3>

      {participants.map((member) => {
        const isMemberAdmin =
          conversation.admins?.includes(member._id) ||
          conversation.createdBy === member._id;
        const isSelf = currentUser?._id === member._id;
        const isMemberOnline = isUserOnline(member);

        return (
          <div
            key={member._id}
            className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A] border border-[#334155]"
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center font-bold text-xs shadow-md text-white">
                  {member.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0F172A] ${
                    isMemberOnline
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                      : 'bg-slate-500/80'
                  }`}
                  title={isMemberOnline ? 'Online' : 'Offline'}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-100">
                    {member.name} {isSelf && '(You)'}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-normal ${
                      isMemberOnline
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    {isMemberOnline ? 'Online' : 'Offline'}
                  </span>
                  {isMemberAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">{member.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {!isSelf && (
                <button
                  onClick={() => handleOpenDirectChat(member._id)}
                  disabled={actionLoading === `chat-${member._id}`}
                  title={`Start 1-to-1 chat with ${member.name}`}
                  className="p-1.5 rounded-lg bg-[#FFB03A]/15 hover:bg-[#FFB03A]/30 text-[#FFB03A] transition-colors cursor-pointer"
                >
                  {actionLoading === `chat-${member._id}` ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {isAdmin && !isSelf && (
                <>
                  {!isMemberAdmin && (
                    <button
                      onClick={() => handlePromote(member._id)}
                      disabled={actionLoading === `promote-${member._id}`}
                      title="Promote to Admin"
                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors cursor-pointer"
                    >
                      {actionLoading === `promote-${member._id}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Shield className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(member._id)}
                    disabled={actionLoading === `remove-${member._id}`}
                    title="Remove Member"
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                  >
                    {actionLoading === `remove-${member._id}` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserMinus className="w-3.5 h-3.5" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
