import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import kbRoutes from './routes/knowledgeBases';
import leadRoutes from './routes/leads';
import evolutionRoutes from './routes/evolution';
import adminRoutes from './routes/adminRoutes';
import orderRoutes from './routes/orderRoutes';
import teamRoutes from './routes/teamRoutes';
import financialRoutes from './routes/financialRoutes';
import settingRoutes from './routes/settingRoutes';
import internalRoutes from './routes/internalRoutes';


import { startScheduleService } from './services/scheduleService';
import './cron/subscriptionExpiry'; // Initialize cron jobs

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/knowledge-bases', kbRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/evolution', evolutionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/financials', financialRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/internal', internalRoutes);


// Start Automated Background Services
startScheduleService();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
