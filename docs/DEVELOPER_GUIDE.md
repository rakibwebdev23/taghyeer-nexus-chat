# 📘 Nexus Chat — Developer & Architecture Handbook

Welcome to the **Nexus Chat** Developer Guide! This document is designed to onboard any developer taking over or contributing to this codebase. It provides a complete file-by-file breakdown, architectural deep-dive, data flow explanations, and maintenance guidelines.

---

## 🧭 Project Architecture Overview

**Nexus Chat** is a full-stack real-time messaging application built with:
* **Next.js 16 (Turbopack, App Router)**: High-performance SSR/SSG React framework.
* **Redux Toolkit (`@reduxjs/toolkit` & `react-redux`)**: Centralized single source of truth for user authentication, conversation state, message logs, and unread counts.
* **Socket.io Client (`socket.io-client`)**: Bi-directional WebSockets delivering real-time messages (`message:new`) and thread updates (`conversation:updated`).
* **Redis Caching Engine (`ioredis` + Memory Cache)**: In-memory cache layer for accelerating user directory searches and chat metadata with TTL expiration.
* **Tailwind CSS v4**: Vanilla dark-mode utility classes adhering to the *California Beaches* design palette (`#0F172A` Slate, `#FFB03A` Sunset Gold, `#38BDF8` Sky Blue).

---

## ⚙️ Environment Variables Configuration

Nexus Chat uses Environment Variables for configuring API and Socket backend URLs:

* **`.env.local`** (Active environment file):
  ```env
  NEXT_PUBLIC_API_BASE_URL=https://frontend-task-chatapp.onrender.com
  NEXT_PUBLIC_SOCKET_URL=https://frontend-task-chatapp.onrender.com
  ```
* **`.env.example`**: Copy template provided for onboarding developers.

---

## 📂 File & Directory Structure

```
nexus-chat/
├── docs/
│   ├── API_DOCUMENTATION.md     # Full REST API & Socket.io specification
│   └── DEVELOPER_GUIDE.md       # This comprehensive developer onboarding guide
├── public/
│   ├── favicon.svg              # Legacy SVG fallback favicon
│   └── favicon.ico              # Classic ICO fallback favicon
├── src/
│   ├── app/
│   │   ├── chat/
│   │   │   └── page.tsx         # Responsive Chat Application Page (/chat)
│   │   ├── favicon.ico          # App Router Favicon
│   │   ├── globals.css          # Design system keyframes & utility overrides
│   │   ├── icon.svg             # High-DPI Vector Logo Favicon
│   │   ├── layout.tsx           # Root HTML Layout, Metadata & Provider Wrappers
│   │   └── page.tsx             # Interactive Product Landing Page (/)
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginForm.tsx    # Viewport-centered authentication modal
│   │   ├── chat/
│   │   │   ├── CreateGroupModal.tsx  # Group creation modal
│   │   │   ├── GroupInfoModal.tsx    # Group settings & participant management modal
│   │   │   ├── Header.tsx            # Active chat header bar + mobile back button
│   │   │   ├── MessageInput.tsx      # Auto-expanding message textarea
│   │   │   ├── MessageItem.tsx       # Sub-component for individual chat bubbles
│   │   │   ├── MessageList.tsx       # Message timeline container & scroll engine
│   │   │   ├── NewChatModal.tsx      # Direct user search & directory modal
│   │   │   ├── Sidebar.tsx           # Contact list, search, and group tabs
│   │   │   └── SystemNoticePill.tsx  # Sub-component for group system notices
│   │   ├── landing/
│   │   │   ├── ArchitectureExplorer.tsx # Interactive code explorer widget
│   │   │   ├── ChatSandbox.tsx          # Interactive live Socket.io hero sandbox
│   │   │   ├── CtaBanner.tsx            # Bottom call-to-action banner
│   │   │   ├── FeatureShowcase.tsx      # Core feature cards grid
│   │   │   ├── Footer.tsx               # Landing page footer
│   │   │   ├── Hero.tsx                 # Full-viewport height hero section
│   │   │   ├── Navbar.tsx               # Sticky header & mobile navigation drawer
│   │   │   └── PurposeSection.tsx       # Purpose & architectural breakdown
│   │   └── providers/
│   │       └── ReduxProvider.tsx        # React-Redux Provider component wrapper
│   ├── context/
│   │   ├── AuthContext.tsx              # React Context exposing user auth state & login/logout
│   │   └── ChatContext.tsx              # React Context bridging Redux & Socket.io events
│   ├── lib/
│   │   ├── api.ts                   # Centralized REST HTTP API client & multi-case search
│   │   ├── cache.ts                 # Redis & memory caching engine
│   │   └── socket.ts                # Socket.io connection manager & singleton
│   ├── store/
│   │   ├── index.ts                 # Redux Store configuration & typed hooks
│   │   └── slices/
│   │       ├── authSlice.ts         # Redux slice for authentication & session restoration
│   │       └── chatSlice.ts         # Core Redux slice for conversations, messages & deduplication
│   └── types/
│       └── chat.ts                  # TypeScript interfaces (User, Message, Conversation, etc.)
└── package.json
```

---

## 🔍 Core Files & Deep-Dive Explanation

### 1. `src/store/slices/chatSlice.ts` — Core State Engine
This file is the **brain** of the application state. It manages `conversations`, `messages`, `activeConversationId`, and `unreads`.

* **`sortChronologically(msgs: Message[])`**:
  - Ensures messages are strictly ordered by `createdAt` timestamp (`oldest` at top, `newest` at bottom).
  - Performs **Content-Signature Deduplication** (`${senderId}_${text.trim()}`). When a permanent MongoDB message (`6a89...`) arrives from the REST API, it automatically searches for and deletes any temporary socket (`soc_...`) or optimistic (`temp-`) placeholder message with matching sender and text.
* **`extractConvId(payload)`**:
  - Backend API payloads sometimes return conversation IDs as a string (`conversationId`) or an object (`conversation: { _id: "..." }`). This helper extracts a clean 24-character string ID to prevent keys evaluating to `"[object Object]"`.
* **`addIncomingSocketMessage(state, action)`**:
  - Generates a **Deterministic Stable Socket ID** (`soc_${convId}_${senderId}_${text}_${timeBucket}`) for incoming WebSocket events that lack a backend `_id`.
  - Guarantees that if a socket event is processed multiple times, Redux updates the item in-place instead of creating a duplicate message bubble.
* **`sendMessageThunk`**:
  - Dispatches an optimistic message (`temp-${timestamp}`) with `'sending'` status for 0ms visual delay.
  - Calls `api.sendMessage()` and dispatches `replaceOptimisticMessage` to swap the temporary ID with the real MongoDB `_id` and `'sent'` status.

---

### 2. `src/lib/api.ts` — REST API Client & Case-Insensitive Search
Handles all HTTP communication with `https://frontend-task-chatapp.onrender.com`.

* **`searchUsers(query: string)`**:
  - Solves backend MongoDB regex case-sensitivity where searching `rifat` returned `[]` while `Rifat` returned results.
  - Generates query variations (`q`, `TitleCase`, `lowercase`, `UPPERCASE`) and executes `Promise.all()` in parallel, merging deduplicated user objects.
  - Sanitizes regex special characters (`+`, `*`, `?`, etc.) to prevent backend server 500 crashes.
* **`getMessages(conversationId, limit, before)`**:
  - Safely extracts response arrays from both `res.messages` and `res.data`.
  - Bypasses client caching for message lists to ensure live message history accuracy.

---

### 3. `src/context/ChatContext.tsx` — Socket.io & Redux Bridge
Bridges real-time Socket.io events with Redux actions.

* **Socket Listeners**:
  - Listens for `socket.on('message:new')` and dispatches `addIncomingSocketMessage(newMsg)`.
  - Listens for `socket.on('conversation:updated')` and dispatches `fetchConversations()`.
* **Exposed React Hooks**:
  - Provides `useChat()` hook for components to invoke `sendMessage`, `selectConversation`, `startDirectChat`, `createGroup`, `addParticipants`, `removeParticipant`, and `promoteAdmin`.

---

### 4. `src/components/chat/NewChatModal.tsx` — User Search & Directory Modal
* **Preloaded User Directory**: Pre-populates registered users from broad backend queries (`a`, `r`, `1`, `9`, `7`, `0`) when opened, allowing 1-tap contact selection.
* **Out-of-Order Race Condition Guard**: Implements a monotonic `requestIdRef` sequence counter inside `performSearch()`. Discards stale out-of-order HTTP responses when fast-typing multi-character queries.
* **Self-Account Support**: Displays the logged-in user's profile card with a **`(You)`** badge when searching self phone or name.

---

### 5. `src/components/chat/MessageList.tsx`, `MessageItem.tsx`, `SystemNoticePill.tsx`
* **`MessageList.tsx`**: Manages scroll anchoring when prepending historical messages, auto-scrolling to bottom when new messages arrive, and floating scroll-to-bottom button visibility.
* **`SystemNoticePill.tsx`**: Parses group action text (`abc added Rifat`, `abc left the group`) into clickable profile links that immediately launch private 1-to-1 direct chat rooms.
* **`MessageItem.tsx`**: Renders individual chat bubbles with status icons (`Clock` for sending, `Check` for sent, `AlertCircle` for error) and formatted timestamps.

---

### 6. `src/app/chat/page.tsx` — Responsive Mobile View Engine
* **Mobile View Toggle (< 768px)**:
  - When no chat is selected: Displays **Sidebar** full width (`w-full`), hiding main chat panel.
  - When a chat is active: Displays **Main Chat Panel** full width (`w-full`), hiding sidebar.
* **Desktop View (>= 768px)**: Displays Sidebar (`w-80`/`w-96`) and Chat Panel (`flex-1`) side-by-side continuously.
* **Mobile Back Button**: Tapping the back arrow in `Header.tsx` calls `selectConversation('')`, returning the user to the contact list on mobile devices.

---

## 🚀 How to Extend & Maintain the Project

### 1. Adding a New Socket Event Listener
1. Define the event handler in `src/context/ChatContext.tsx` inside the socket `useEffect`:
   ```typescript
   socket.on('custom:event', (data) => {
     dispatch(myReduxAction(data));
   });
   ```
2. Clean up the event listener in the `useEffect` return cleanup block:
   ```typescript
   socket.off('custom:event');
   ```

### 2. Adding a New REST API Endpoint
1. Add the fetch method to `src/lib/api.ts`:
   ```typescript
   async myNewEndpoint(param: string): Promise<MyType> {
     return await request<MyType>(`/api/my-endpoint/${param}`);
   }
   ```
2. Add a corresponding `createAsyncThunk` in `src/store/slices/chatSlice.ts` if state needs updating.

---

## ⚠️ Important Engineering Rules & Gotchas

1. **Always Extract Conversation IDs**: Never use raw `msg.conversation` directly as a object key without calling `extractConvId()`. Objects cast to string become `"[object Object]"`!
2. **Never Mutate Redux State Directly**: Always use Redux Toolkit slice reducers or immutable updates.
3. **Preserve Content-Signature Deduplication**: When editing `sortChronologically()`, retain the `${senderId}_${text.trim()}` content check to prevent duplicate message rendering.
4. **Preserve Case-Insensitive Search**: Always keep `queryVariants` in `api.searchUsers()` so searches match MongoDB backend entries regardless of letter casing.

---

© 2026 **Nexus Chat** — Next-Gen Full-Stack Real-Time Communication Platform.
