const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const env = require('./config/env');

const app = express();

app.disable('x-powered-by');

app.use(cors({
  origin: env.clientOrigin === '*' ? true : env.clientOrigin,
  credentials: env.clientOrigin !== '*',
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'JustSPAI API is running' });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
