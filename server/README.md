# JustSPAI Backend

Node.js + Express API using an MVC-oriented structure.

## Structure

```text
server/
├── src/
│   ├── config/
│   │   └── env.js
│   ├── controllers/
│   │   └── healthController.js
│   ├── middleware/
│   │   └── errorMiddleware.js
│   ├── models/
│   ├── routes/
│   │   └── healthRoutes.js
│   ├── app.js
│   └── server.js
├── .env.example
└── package.json
```

## Run locally

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

The API runs on `http://localhost:5000` by default.

Health check: `GET /api/health`
