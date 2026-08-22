import React from 'react';
import { User } from '@/types/chat';
import { UserPlus, Search, Loader2, X, Plus, Check } from 'lucide-react';

interface GroupInfoAddMemberSectionProps {
  isAdmin: boolean | null;
  isAddingMember: boolean;
  setIsAddingMember: (val: boolean) => void;
  searchQuery: string;
  handleSearchChange: (val: string) => void;
  searching: boolean;
  displayCandidates: User[];
  selectedNewUsers: User[];
  toggleSelectNewUser: (user: User) => void;
  handleAddSelectedMembers: () => void;
  actionLoading: string | null;
  error: string | null;
  isUserOnline: (user: User) => boolean;
}

export function GroupInfoAddMemberSection({
  isAdmin,
  isAddingMember,
  setIsAddingMember,
  searchQuery,
  handleSearchChange,
  searching,
  displayCandidates,
  selectedNewUsers,
  toggleSelectNewUser,
  handleAddSelectedMembers,
  actionLoading,
  error,
  isUserOnline,
}: GroupInfoAddMemberSectionProps) {
  if (!isAdmin) return null;

  return (
    <>
      <div className="py-3 border-b border-[#334155]/60">
        <button
          onClick={() => setIsAddingMember(!isAddingMember)}
          className="w-full py-2 px-3 rounded-xl bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 text-[#38BDF8] border border-[#38BDF8]/35 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isAddingMember ? 'Hide Add Member Form' : 'Add New Members to Group'}</span>
        </button>
      </div>

      {isAddingMember && (
        <div className="p-3 my-2 rounded-xl bg-[#0F172A] border border-[#334155] space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Add Participants</span>
            <span className="text-[10px] text-[#38BDF8] font-bold">
              {searchQuery.trim() ? 'Search Database' : 'Recent Contacts'}
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Type to search name or phone number..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-10 py-2 rounded-lg bg-[#1E293B] border border-[#334155] text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#38BDF8]"
              autoFocus
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38BDF8]" />
              </div>
            )}
          </div>

          {selectedNewUsers.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#FFB03A] font-bold">
                Selected to Add ({selectedNewUsers.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNewUsers.map((u) => (
                  <span
                    key={u._id}
                    className="px-2 py-0.5 rounded bg-[#FFB03A] text-[#0F172A] font-bold text-[11px] flex items-center gap-1"
                  >
                    {u.name}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => toggleSelectNewUser(u)}
                    />
                  </span>
                ))}
              </div>
              <button
                onClick={handleAddSelectedMembers}
                disabled={actionLoading === 'add-members'}
                className="w-full py-1.5 rounded-lg bg-[#FFB03A] hover:bg-[#FF9800] text-[#0F172A] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-sm"
              >
                {actionLoading === 'add-members' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F172A]" />
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-[#0F172A]" />
                    <span>Confirm & Add Selected Members</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
            {searching ? (
              <div className="py-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38BDF8]" />
                Searching database...
              </div>
            ) : displayCandidates.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-xs">
                {searchQuery ? 'No matching candidate users found' : 'No available recent contacts to add'}
              </div>
            ) : (
              displayCandidates.map((u) => {
                const isSelected = selectedNewUsers.some((sel) => sel._id === u._id);
                const isCandidateOnline = isUserOnline(u);

                return (
                  <div
                    key={u._id}
                    onClick={() => toggleSelectNewUser(u)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border ${
                      isSelected
                        ? 'bg-[#FFB03A]/20 border-[#FFB03A] text-white'
                        : 'bg-[#1E293B] border-[#334155] text-slate-200 hover:bg-[#334155]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative shrink-0">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center text-[10px] font-bold text-white">
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#1E293B] ${
                            isCandidateOnline ? 'bg-emerald-500' : 'bg-slate-500'
                          }`}
                        />
                      </div>
                      <span>
                        {u.name} ({u.phone})
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-normal ${
                          isCandidateOnline
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        {isCandidateOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isSelected
                          ? 'bg-[#FFB03A] border-[#FFB03A] text-[#0F172A]'
                          : 'border-slate-500'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}
