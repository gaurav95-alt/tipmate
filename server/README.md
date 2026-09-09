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

## Run locally

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

The API runs on `http://localhost:5000` by default.

Health check: `GET /api/health`
