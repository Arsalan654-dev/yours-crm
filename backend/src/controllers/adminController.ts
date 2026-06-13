import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const getClientConfigForN8n = async (req: Request, res: Response) => {
  try {
    const { instance } = req.query;

    if (!instance || typeof instance !== 'string') {
      return res.status(400).json({ error: 'Instance name is required as a query parameter' });
    }

    // Find the client by instance name
    const client = await prisma.client.findFirst({
      where: { instanceName: instance }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found for this instance' });
    }

    // Check if subscription is active
    if (client.status !== 'ACTIVE') {
      return res.status(403).json({ 
        error: 'Client subscription is not active',
        status: client.status
      });
    }

    // Ensure they have a webhook URL to talk to
    if (!client.n8nWebhookUrl) {
      return res.status(400).json({ 
        error: 'Client has no n8n Webhook URL configured' 
      });
    }

    // Return exactly what n8n needs to process the request
    res.json({
      success: true,
      data: {
        customerId: client.id,
        companyName: client.companyName,
        n8nWebhookUrl: client.n8nWebhookUrl,
        evolutionApiUrl: client.evolutionApiUrl,
        evolutionApiKey: client.evolutionApiKey,
        botEnabled: client.botEnabled,
        defaultAiModel: client.defaultAiModel,
        defaultPrompt: client.defaultPrompt
      }
    });

  } catch (error) {
    console.error('n8n Bridge API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
