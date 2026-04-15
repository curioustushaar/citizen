import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import complaintRoutes from './routes/complaints';
import officerRoutes from './routes/officers';
import analyticsRoutes from './routes/analytics';
import simulateRoutes from './routes/simulate';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import slaRoutes from './routes/sla';
import auditRoutes from './routes/audit';
import departmentRoutes from './routes/departments';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/officers', officerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/simulate', simulateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sla', slaRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/departments', departmentRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '2.0.0', roles: ['PUBLIC', 'ADMIN', 'SUPER_ADMIN'] });
});

// Connect & Start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Routes: auth, complaints, officers, analytics, simulate, users, sla, audit-logs, departments`);
  });
});
