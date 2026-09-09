# JustSPAI Backend

Node.js + Express + MongoDB backend for JustSPAI.

## Real-time chat

Socket.io is attached to the same HTTP server and authenticates connections with the existing JWT secret.

### Socket authentication

Send the JWT when connecting:

```js
const socket = io(API_URL, {
  auth: { token: jwtToken },
});
```

### Room events

Join an authorized room:

```js
socket.emit('join_room', { roomId }, (result) => console.log(result));
```

Send a message:

```js
socket.emit('send_message', { roomId, text: 'Hello!' }, (result) => console.log(result));
```

Listen for messages:

```js
socket.on('receive_message', (message) => {
  console.log(message);
});
```

Leave a room with `leave_room`.

Only users listed in a room's `participants` can join it or send messages. Messages are persisted in MongoDB in the `Message` collection.

### REST chat API

All routes require `Authorization: Bearer <JWT>`.

- `POST /api/chat/rooms` — create or retrieve an authorized room.
- `GET /api/chat/rooms/:roomId/messages?limit=50` — retrieve persisted chat history (maximum 100 messages per request).

## Admin API

Admin routes require a valid JWT for a user whose database `role` is exactly `admin`. New registrations default to `role: user`; never accept a client-supplied role during registration.

- `GET /api/admin/users?page=1&limit=25&search=&role=&isActive=` — list users with pagination and optional filters.
- `DELETE /api/admin/users/:id` — permanently delete a user and associated moderation/chat records. An admin cannot delete their own account.
- `GET /api/admin/reports?page=1&limit=25&status=pending` — list moderation reports.
- `PUT /api/admin/reports/:id` — update report status and moderator note.
- `GET /api/admin/analytics` — return user, active-user, match, report, chat-room and message metrics.

The `isActive` metric represents accounts currently marked active. `lastActiveAt` is updated during successful login and can be used for future time-window activity analytics.

## Run locally

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

The API runs on `http://localhost:5000` by default.

Health check: `GET /api/health`
