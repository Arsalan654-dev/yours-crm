import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import prisma from '../prismaClient';

export const createClient = async (req: Request, res: Response) => {
  try {
    const {
      companyName, ownerName, email, phoneNumber, address, password,
      instanceName, evolutionApiUrl, evolutionApiKey, initialKnowledgeBase
    } = req.body;

    // Validation
    if (!email || !password || !companyName || !ownerName || !instanceName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Attempt to create instance on Evolution API
    let evolutionData: any = null;
    try {
      const evoResponse = await axios.post(
        `${evolutionApiUrl}/instance/create`,
        {
          instanceName: instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        },
        {
          headers: {
            'apikey': evolutionApiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      evolutionData = evoResponse.data;
    } catch (evoError: any) {
      console.error('Evolution API Error:', evoError.response?.data || evoError.message);
      // Proceed with client creation even if Evolution API fails. 
      // The user can configure/reconnect the instance later from the Config AI page.
    }

    // Generate unique API Key for the specific instance from Evolution if provided, else fallback
    const specificApiKey = evolutionData?.hash?.apikey || evolutionApiKey;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30); // Default 30 day trial

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create client and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          companyName,
          ownerName,
          email,
          phoneNumber,
          address,
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate,
          subscriptionDays: 30,
          amountCharged: 0,
          paymentStatus: 'UNPAID',
          instanceName,
          instanceId: evolutionData?.instance?.instanceId || null,
          evolutionApiUrl,
          evolutionApiKey: specificApiKey
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'CLIENT',
          clientId: client.id
        }
      });

      // @ts-ignore
      await tx.agentConfig.create({
        data: {
          client: { connect: { id: client.id } },
          instanceName,
          isActive: true,
          status: 'ONLINE',
          timezone: 'UTC'
        }
      });

      if (initialKnowledgeBase && initialKnowledgeBase.trim() !== '') {
        await tx.knowledgeBase.create({
          data: {
            clientId: client.id,
            title: 'Initial Knowledge Base',
            type: 'FAQ',
            content: initialKnowledgeBase,
            category: 'General'
          }
        });
      }

      await tx.auditLog.create({
        data: {
          userId: user.id, // technically the SuperAdmin is doing this, but we'll log it here or as system
          action: 'CLIENT_CREATED',
          details: `Client ${companyName} and instance ${instanceName} provisioned.`
        }
      });

      return client;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: { leads: true, knowledgeBases: true }
        }
      }
    });
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { leads: true, knowledgeBases: true }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;

    const client = await prisma.client.update({
      where: { id },
      data: updates
    });

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Delete associated data first
    await prisma.knowledgeBase.deleteMany({ where: { clientId: id } });

    // Delete user
    await prisma.user.deleteMany({ where: { clientId: id } });

    // Finally delete client
    const client = await prisma.client.delete({
      where: { id }
    });

    res.json({ message: 'Client deleted', id: client.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getClientSettings = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?.clientId;
    if (!clientId) return res.status(403).json({ message: 'Client ID required' });

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      // @ts-ignore
      include: { agentConfig: true }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateClientSettings = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?.clientId;
    if (!clientId) return res.status(403).json({ message: 'Client ID required' });

    const { companyName, ownerName, phoneNumber, address, defaultAiModel, defaultPrompt, isActive, scheduleEnabled, scheduleStartTime, scheduleEndTime, timezone } = req.body;

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        companyName,
        ownerName,
        phoneNumber,
        address,
        defaultAiModel,
        defaultPrompt
      }
    });

    // @ts-ignore
    const updatedAgentConfig = await prisma.agentConfig.upsert({
      where: { id: clientId },
      update: {
        isActive: isActive !== undefined ? isActive : undefined,
        scheduleEnabled: scheduleEnabled !== undefined ? scheduleEnabled : undefined,
        scheduleStartTime,
        scheduleEndTime,
        timezone
      },
      create: {
        client: { connect: { id: clientId } },
        isActive: isActive !== undefined ? isActive : true,
        scheduleEnabled: scheduleEnabled !== undefined ? scheduleEnabled : false,
        scheduleStartTime,
        scheduleEndTime,
        timezone: timezone || "UTC"
      }
    });

    res.json({ ...updatedClient, agentConfig: updatedAgentConfig });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getClientDashboardStats = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?.clientId;
    if (!clientId) return res.status(403).json({ message: 'Client ID required' });

    const totalLeads = await prisma.lead.count({ where: { clientId } });
    const newLeads = await prisma.lead.count({ where: { clientId, status: 'NEW' } });
    const totalKbDocs = await prisma.knowledgeBase.count({ where: { clientId } });
    
    const recentLeads = await prisma.lead.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // @ts-ignore
    const agentConfig = await prisma.agentConfig.findUnique({
      where: { id: clientId }
    });

    res.json({
      totalLeads,
      newLeads,
      totalKbDocs,
      recentLeads,
      botStatus: agentConfig ? agentConfig.status : 'OFFLINE',
      botActive: agentConfig ? agentConfig.isActive : false
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
