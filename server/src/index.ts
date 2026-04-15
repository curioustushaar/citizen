import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import connectDB from './config/db';
import complaintRoutes from './routes/complaints';
import analyticsRoutes from './routes/analytics';
import authRoutes from './routes/auth';
import officerRoutes from './routes/officers';
import userRoutes from './routes/users';
import slaRoutes from './routes/sla';
import auditRoutes from './routes/audit';
import simulateRoutes from './routes/simulate';
import notificationRoutes from './routes/notifications';
import { initSocket } from './socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(httpServer);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/officers', officerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sla', slaRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/simulate', simulateRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Connect & Start
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
