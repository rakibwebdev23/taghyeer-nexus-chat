# Nexus Chat API Documentation (REST + WebSocket)

This document formalizes the API specification for **Nexus Chat**, documenting all REST endpoints, request/response bodies, status codes, query parameters, and real-time Socket.io events.

---

## Base URLs
* **REST API Base URL**: `https://frontend-task-chatapp.onrender.com/api`
* **System Health Check**: `https://frontend-task-chatapp.onrender.com/health`
* **WebSocket Server Origin**: `https://frontend-task-chatapp.onrender.com` (Socket.io path `/socket.io/`)

---

## Authentication Mechanism

Authentication relies on JWT Bearer Tokens.
1. Send credentials to `POST /api/auth/login`.
2. Include token in subsequent protected requests:
   ```http
   Authorization: Bearer <your_jwt_token>
   ```
3. For WebSocket connections, pass the token in the Socket.io handshake auth:
   ```js
   const socket = io('https://frontend-task-chatapp.onrender.com', {
     auth: { token: 'YOUR_JWT_TOKEN' }
   });
   ```

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Logs in an existing user or automatically registers a new account if the phone number is unique.

* **Security**: None (Public)
* **Request Body**:
  ```json
  {
    "phone": "+15551234567",
    "name": "Ada Lovelace"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "_id": "6a88275de5d6aac97521e37a",
      "name": "Ada Lovelace",
      "phone": "+15551234567",
      "createdAt": "2026-08-21T10:24:29.021Z"
    }
  }
  ```

---

### `GET /api/auth/me`
Retrieves the profile of the currently authenticated user based on the Bearer token.

* **Security**: Bearer Token required
* **Success Response (`200 OK`)**:
  ```json
  {
    "user": {
      "_id": "6a88275de5d6aac97521e37a",
      "name": "Ada Lovelace",
      "phone": "+15551234567",
      "createdAt": "2026-08-21T10:24:29.021Z"
    }
  }
  ```

---

## 2. Users Endpoint

### `GET /api/users/search`
Searches registered users by name or phone number.

* **Security**: Bearer Token required
* **Query Parameters**:
  * `q` (string, required): Search query (e.g. `Ada` or `+1555`)
* **Success Response (`200 OK`)**:
  ```json
  [
    {
      "_id": "6a88275de5d6aac97521e37a",
      "name": "Ada Lovelace",
      "phone": "+15551234567"
    }
  ]
  ```

---

## 3. Conversations Endpoints

### `GET /api/conversations`
Lists all conversations (direct 1-to-1 and group chats) for the authenticated user.

* **Security**: Bearer Token required
* **Success Response (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "_id": "6a88b4a6e5d6aac97524f9db",
        "type": "group",
        "name": "Developers Sync",
        "createdBy": "6a885027e5d6aac975223f38",
        "admins": ["6a885027e5d6aac975223f38"],
        "participants": [
          { "_id": "6a885027e5d6aac975223f38", "name": "Alice", "phone": "+15550001" }
        ],
        "lastMessage": {
          "_id": "6a88b4a7e5d6aac97524f9ee",
          "text": "Meeting at 3 PM",
          "sender": "6a885027e5d6aac975223f38",
          "createdAt": "2026-08-22T00:47:17.818Z"
        },
        "updatedAt": "2026-08-22T00:47:17.818Z"
      },
      {
        "_id": "6a883a6ae5d6aac9752200ce",
        "type": "direct",
        "participant": {
          "_id": "6a883a69e5d6aac9752200bd",
          "name": "Bob",
          "phone": "+15550002"
        },
        "lastMessage": {
          "text": "Hey Bob!",
          "createdAt": "2026-08-22T00:29:29.982Z"
        },
        "updatedAt": "2026-08-22T00:29:29.982Z"
      }
    ]
  }
  ```

---

### `POST /api/conversations`
Starts or opens a direct 1-to-1 conversation with another user.

* **Security**: Bearer Token required
* **Request Body**:
  ```json
  {
    "userId": "6a883a69e5d6aac9752200bd"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "6a883a6ae5d6aac9752200ce",
    "type": "direct",
    "participant": {
      "_id": "6a883a69e5d6aac9752200bd",
      "name": "Bob",
      "phone": "+15550002"
    }
  }
  ```

---

### `GET /api/conversations/{id}/messages`
Retrieves message history for a specific conversation with cursor pagination.

* **Security**: Bearer Token required
* **Query Parameters**:
  * `limit` (integer, optional, default: 30): Max messages per page.
  * `before` (string, optional): Message ID cursor to fetch history preceding a given message.
* **Success Response (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "_id": "6a88c001e5d6aac975254101",
        "conversationId": "6a883a6ae5d6aac9752200ce",
        "sender": {
          "_id": "6a88275de5d6aac97521e37a",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        "text": "Hello Bob!",
        "createdAt": "2026-08-22T01:05:00.000Z"
      }
    ]
  }
  ```

---

## 4. Messages Endpoint

### `POST /api/messages`
Sends a new text message to a conversation.

* **Security**: Bearer Token required
* **Request Body**:
  ```json
  {
    "conversationId": "6a883a6ae5d6aac9752200ce",
    "text": "Hello team!"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "6a88c002e5d6aac975254102",
    "conversationId": "6a883a6ae5d6aac9752200ce",
    "sender": {
      "_id": "6a88275de5d6aac97521e37a",
      "name": "Ada Lovelace"
    },
    "text": "Hello team!",
    "createdAt": "2026-08-22T01:06:00.000Z"
  }
  ```

---

## 5. Group Management Endpoints

### `POST /api/conversations/group`
Creates a multi-user group chat. The creator is automatically assigned as an admin.

* **Request Body**:
  ```json
  {
    "name": "Engineering Lead Sync",
    "participantIds": ["6a883a69e5d6aac9752200bd", "6a885027e5d6aac975223f38"]
  }
  ```

### `POST /api/conversations/{id}/participants`
Adds new participants to a group (Admins only).

* **Request Body**:
  ```json
  {
    "userIds": ["6a887662e5d6aac9752312d2"]
  }
  ```

### `DELETE /api/conversations/{id}/participants/{userId}`
Removes a member from a group (Admins only). Passing your own `userId` leaves the group.

### `POST /api/conversations/{id}/admins`
Promotes a group member to Admin (Admins only).

* **Request Body**:
  ```json
  {
    "userId": "6a883a69e5d6aac9752200bd"
  }
  ```

### `PATCH /api/conversations/{id}`
Renames a group conversation (Admins only).

* **Request Body**:
  ```json
  {
    "name": "Updated Team Name"
  }
  ```

---

## 6. WebSocket Events (Socket.io)

### Client → Server Events
* **`message:send`**: Sends a real-time message.
  ```json
  {
    "conversationId": "6a883a6ae5d6aac9752200ce",
    "text": "Live message text"
  }
  ```

### Server → Client Events
* **`message:new`**: Emitted when a new message is received in any conversation the user belongs to.
* **`conversation:updated`**: Emitted when a group chat changes (renamed, member added/removed, admin promoted).
