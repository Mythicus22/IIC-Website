import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import connectDB, { getDatabaseHealth } from './src/config/db.js';
import { validateEnv } from './src/config/env.js';
import { allowedOrigins, corsOptions } from './src/config/cors.js';
import apiRoutes from './src/routes/api.js';
import { setupSocket } from './src/socket/index.js';
import { notFound, errorHandler } from './src/middlewares/error.middleware.js';

validateEnv();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000, // Limit each IP to 1000 requests per window
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Standard Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/health', (req, res) => {
  const database = getDatabaseHealth();

  res.json({
    status: database.status === 'connected' ? 'ok' : 'degraded',
    database,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Socket.io
setupSocket(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`CORS enabled for: ${allowedOrigins.join(', ') || 'same-origin/server-to-server only'}`);
    });
  } catch (error) {
    console.error(`[Startup] ${error.message}`);
    process.exit(1);
  }
};

startServer();
