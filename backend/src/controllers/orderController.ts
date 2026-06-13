import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { clientId, name, phoneNumber, companyName, products, address, status } = req.body;

    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required' });
    }

    // @ts-ignore
    const order = await prisma.order.create({
      data: {
        clientId,
        name,
        phoneNumber,
        companyName,
        products,
        address,
        status: status || 'PENDING'
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    // If the super admin wants to see all orders, they don't pass clientId.
    // If we want to filter by client, we pass clientId in query.
    const { clientId } = req.query;
    
    let whereClause = {};
    if (clientId) {
      whereClause = { clientId: String(clientId) };
    }

    // @ts-ignore
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: { client: { select: { name: true, companyName: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // @ts-ignore
    const order = await prisma.order.update({
      where: { id },
      data: updates
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // @ts-ignore
    await prisma.order.delete({
      where: { id }
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
